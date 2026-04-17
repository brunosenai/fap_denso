import type { NextApiRequest, NextApiResponse } from 'next';
import { renderToStream } from '@react-pdf/renderer';
import { RelatorioFap } from '@/components/Pdf/RelatorioFap';
import { tCandidato, tFap } from "@/utils/Types";
import nodemailer from 'nodemailer';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import pool from "@/services/Banco";
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    let apiKey=''
    if(req.method === 'GET'){
        apiKey = req.query.apiKey as string
    }else{
        apiKey = req.body.apiKey as string
    }
    if(apiKey !== process.env.API_KEY){
        return res.status(401).json({ message: 'Acesso não autorizado: API Key inválida ou ausente.' });
    }

    if (req.method == 'GET') {
        const { action, n_id_avaliacao } = req.query;
        if(action == "verificarStatus"){
            try {
                const [rows_status] = await pool.query<RowDataPacket[]>(`
                    SELECT n_status_avaliacao FROM avaliacao WHERE n_id_avaliacao = ?
                `, [n_id_avaliacao]);
                
                if(rows_status.length === 0){
                    return res.status(404).json({ message: 'Avaliação não encontrada.' });
                }

                const status = rows_status[0].n_status_avaliacao;
                return res.status(200).json({ status });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Internal Server Error: erro 500" });
            }
        }
    }
   
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { ids_avaliacoes } = req.body;

    if (!ids_avaliacoes || !Array.isArray(ids_avaliacoes) || ids_avaliacoes.length === 0) {
        return res.status(400).json({ error: 'Nenhum ID de avaliação fornecido' });
    }

    try {
        // ========================================================================
        // 1. BLINDAGEM: VERIFICAR QUAIS AVALIAÇÕES JÁ FORAM PROCESSADAS
        // ========================================================================
        const placeholdersCheck = ids_avaliacoes.map(() => '?').join(',');
        const [avaliacoesCheck] = await pool.query<RowDataPacket[]>(
            `SELECT n_id_avaliacao, n_status_avaliacao FROM avaliacao WHERE n_id_avaliacao IN (${placeholdersCheck})`,
            [...ids_avaliacoes]
        );

        // Filtra para manter APENAS as que não foram processadas (status diferente de 2)
        const idsParaProcessar = avaliacoesCheck
            .filter(a => a.n_status_avaliacao !== 2)
            .map(a => a.n_id_avaliacao);

        // Se todas as que o usuário selecionou já tinham status 2, aborta e avisa o front
        if (idsParaProcessar.length === 0) {
            return res.status(400).json({ 
                error: 'ALREADY_PROCESSED', 
                message: 'Todas as avaliações selecionadas já foram processadas.' 
            });
        }

        // ========================================================================
        // 2. GERAÇÃO DE ARQUIVOS (Usando apenas os IDs válidos)
        // ========================================================================
        const pastaRelatorios = path.join(process.cwd(), 'public', 'relatorios');
        
        if (!fs.existsSync(pastaRelatorios)) {
            fs.mkdirSync(pastaRelatorios, { recursive: true });
        }

        const arquivosZipGerados: string[] = [];

        // USA O ARRAY FILTRADO 'idsParaProcessar'
        for (const id_avaliacao of idsParaProcessar) {
            
            const [resTurma] = await pool.query<RowDataPacket[]>(
                `SELECT s_nome_avaliacao, dt_data_avaliacao FROM avaliacao WHERE n_id_avaliacao = ?`,
                [id_avaliacao]
            );
            
            if (resTurma.length === 0) continue;

            const turmaNome = resTurma[0].s_nome_avaliacao.replace(/[\s:]/g, '_');
            const nomeArquivoZip = `Relatorios_${turmaNome}_ID${id_avaliacao}.zip`;
            const caminhoZip = path.join(pastaRelatorios, nomeArquivoZip);

            const [dadosCompletos] = await pool.query<RowDataPacket[]>(`
                SELECT c.*, f.* FROM candidato c
                INNER JOIN fap f ON c.n_id_candidato = f.n_id_candidato
                WHERE f.n_id_avaliacao = ?
            `, [id_avaliacao]);

            const output = fs.createWriteStream(caminhoZip);
            const archive = archiver('zip', { zlib: { level: 9 } });

            const zipPromise = new Promise<void>((resolve, reject) => {
                output.on('close', () => resolve());
                archive.on('error', (err) => reject(err));
            });

            archive.pipe(output);

            for (const item of dadosCompletos) {
                const candidato: tCandidato = item as tCandidato; 
                const fap: tFap = item as tFap;

                const nomePdf = `FAP_${candidato.s_nome_candidato.replace(/\s+/g, '_')}_${candidato.n_id_candidato}_${id_avaliacao}.pdf`;
                const caminhoFisicoPdf = path.join(pastaRelatorios, nomePdf);
                const urlDatabase = `/relatorios/${nomePdf}`;

                const pdfStream = await renderToStream(
                    RelatorioFap({ candidato, fapCandidato: fap })
                );

                const writeStream = fs.createWriteStream(caminhoFisicoPdf);
                pdfStream.pipe(writeStream);

                await new Promise<void>((resolve, reject) => {
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });

                archive.file(caminhoFisicoPdf, { name: nomePdf });

                await pool.query<ResultSetHeader>(
                    `UPDATE fap SET s_relatorio_fap = ? WHERE n_id_avaliacao = ? AND n_id_candidato = ?`,
                    [urlDatabase, id_avaliacao, candidato.n_id_candidato]
                );
            }

            await archive.finalize();
            await zipPromise;

            arquivosZipGerados.push(nomeArquivoZip);
        }

        // ========================================================================
        // 3. ENVIO DO E-MAIL
        // ========================================================================
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const anexos = arquivosZipGerados.map(nome => ({
            filename: nome,
            path: path.join(pastaRelatorios, nome)
        }));

        const [configRes] = await pool.query<RowDataPacket[]>(`SELECT s_emailDestino_config FROM config LIMIT 1`);
        
        let emailsDestino = process.env.EMAIL_DESTINO_EMPRESA; 
        
        if (configRes.length > 0 && configRes[0].s_emailDestino_config) {
            emailsDestino = configRes[0].s_emailDestino_config
                .split(';')
                .map((e: string) => e.trim())
                .filter((e: string) => e !== '')
                .join(', ');
        }

        await transporter.sendMail({
            from: `"Sistema FAP Centro 4.0" <${process.env.SMTP_USER}>`,
            to: emailsDestino, 
            subject: "Relatórios FAP - Envio em Lote",
            html: `
                <p>Olá,</p>
                <p>Os relatórios das avaliações selecionadas foram gerados com sucesso.</p>
                <p><strong>Turmas processadas:</strong> ${idsParaProcessar.length}</p>
                <p>Arquivos compactados seguem em anexo.</p>
            `,
            attachments: anexos,
        });

        // ========================================================================
        // 4. ATUALIZAÇÃO DO STATUS GERAL DE ENVIO NA TABELA AVALIACAO
        // ========================================================================
        const placeholdersUpdate = idsParaProcessar.map(() => '?').join(',');
        await pool.query<ResultSetHeader>(
            `UPDATE avaliacao SET n_status_avaliacao = 2 WHERE n_id_avaliacao IN (${placeholdersUpdate})`,
            [...idsParaProcessar]
        );

        return res.status(200).json({ 
            message: 'Processo concluído com sucesso.' 
        });

    } catch (error) {
        console.error("Erro crítico na API de Relatórios:", error);
        return res.status(500).json({ error: 'Erro interno ao processar relatórios em lote.' });
    }
}