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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { ids_avaliacoes } = req.body;

    if (!ids_avaliacoes || !Array.isArray(ids_avaliacoes) || ids_avaliacoes.length === 0) {
        return res.status(400).json({ error: 'Nenhum ID de avaliação fornecido' });
    }

    try {
        const pastaRelatorios = path.join(process.cwd(), 'public', 'relatorios');
        
        // Garante que a pasta de destino existe
        if (!fs.existsSync(pastaRelatorios)) {
            fs.mkdirSync(pastaRelatorios, { recursive: true });
        }

        const arquivosZipGerados: string[] = [];

        // 1. PROCESSAMENTO POR TURMA (AVALIAÇÃO)
        for (const id_avaliacao of ids_avaliacoes) {
            
            // Busca dados da Avaliação (Turma)
            const [resTurma] = await pool.query<RowDataPacket[]>(
                `SELECT s_nome_avaliacao, dt_data_avaliacao FROM avaliacao WHERE n_id_avaliacao = ?`,
                [id_avaliacao]
            );
            
            if (resTurma.length === 0) continue;

            const turmaNome = resTurma[0].s_nome_avaliacao.replace(/\s+/g, '_');
            const nomeArquivoZip = `Relatorios_${turmaNome}_ID${id_avaliacao}.zip`;
            const caminhoZip = path.join(pastaRelatorios, nomeArquivoZip);

            // Busca Candidatos e suas respectivas FAPs desta avaliação
            const [dadosCompletos] = await pool.query<RowDataPacket[]>(`
                SELECT c.*, f.* FROM candidato c
                INNER JOIN fap f ON c.n_id_candidato = f.n_id_candidato
                WHERE f.n_id_avaliacao = ?
            `, [id_avaliacao]);

            // Configuração do Archiver (ZIP)
            const output = fs.createWriteStream(caminhoZip);
            const archive = archiver('zip', { zlib: { level: 9 } });

            const zipPromise = new Promise<void>((resolve, reject) => {
                output.on('close', () => resolve());
                archive.on('error', (err) => reject(err));
            });

            archive.pipe(output);

            // 2. GERAÇÃO DOS PDFs INDIVIDUAIS, UPDATE NO BANCO E INCLUSÃO NO ZIP
            for (const item of dadosCompletos) {
                const candidato: tCandidato = item as tCandidato; 
                const fap: tFap = item as tFap;

                // Cria um nome de arquivo único para não sobrescrever em caso de nomes iguais
                const nomePdf = `FAP_${candidato.s_nome_candidato.replace(/\s+/g, '_')}_${candidato.n_id_candidato}_${id_avaliacao}.pdf`;
                const caminhoFisicoPdf = path.join(pastaRelatorios, nomePdf);
                const urlDatabase = `/relatorios/${nomePdf}`;

                // Renderiza o PDF como stream
                const pdfStream = await renderToStream(
                    RelatorioFap({ candidato, fapCandidato: fap })
                );

                // PASSO A: Salva o PDF individualmente no disco (HD da VPS)
                const writeStream = fs.createWriteStream(caminhoFisicoPdf);
                pdfStream.pipe(writeStream);

                // Adicione o <void> logo após o Promise:
                await new Promise<void>((resolve, reject) => {
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });

                // PASSO B: Adiciona o arquivo recém-criado no ZIP
                archive.file(caminhoFisicoPdf, { name: nomePdf });

                // PASSO C: Grava a URL no banco de dados, na coluna s_relatorio_fap
                await pool.query<ResultSetHeader>(
                    `UPDATE fap SET s_relatorio_fap = ? WHERE n_id_avaliacao = ? AND n_id_candidato = ?`,
                    [urlDatabase, id_avaliacao, candidato.n_id_candidato]
                );
            }

            // Fecha e finaliza o arquivo ZIP da turma
            await archive.finalize();
            await zipPromise;

            arquivosZipGerados.push(nomeArquivoZip);
        }

        // 3. ENVIO DO E-MAIL COM OS ANEXOS COMPACTADOS
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

        await transporter.sendMail({
            from: `"Sistema FAP Centro 4.0" <${process.env.SMTP_USER}>`,
            to: process.env.EMAIL_DESTINO_EMPRESA,
            subject: "Relatórios FAP - Envio em Lote",
            html: `
                <p>Olá,</p>
                <p>Os relatórios das avaliações selecionadas foram gerados com sucesso.</p>
                <p><strong>Turmas processadas:</strong> ${ids_avaliacoes.length}</p>
                <p>Arquivos compactados seguem em anexo.</p>
            `,
            attachments: anexos,
        });

        // 4. ATUALIZAÇÃO DO STATUS GERAL DE ENVIO NA TABELA AVALIACAO
        const placeholders = ids_avaliacoes.map(() => '?').join(',');
        await pool.query<ResultSetHeader>(
            `UPDATE avaliacao SET n_status_avaliacao = 2 WHERE n_id_avaliacao IN (${placeholders})`,
            [...ids_avaliacoes]
        );

        return res.status(200).json({ 
            message: 'Processo concluído: PDFs gerados, URLs salvas, ZIPs criados, E-mail enviado e Banco atualizado.' 
        });

    } catch (error) {
        console.error("Erro crítico na API de Relatórios:", error);
        return res.status(500).json({ error: 'Erro interno ao processar relatórios em lote.' });
    }
}