import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import pool from "@/services/Banco";
import { RowDataPacket } from 'mysql2';

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
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { assunto, arquivos } = req.body;

    // Filtra para remover qualquer null ou string vazia que venha da tela de listagem
    const arquivosValidos = Array.isArray(arquivos) 
        ? arquivos.filter(a => a !== null && a !== undefined && a !== "")
        : [];

    if (arquivosValidos.length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo válido para enviar' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true para 465, false para outras portas
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const anexos = arquivosValidos.map((arquivoString) => {
            let fileName = arquivoString;
            
            // Limpa o caminho caso venha da tela de listagem
            if (fileName.includes('file=')) {
                fileName = fileName.split('file=')[1];
            } else if (fileName.includes('/relatorios/')) {
                fileName = fileName.split('/relatorios/')[1];
            }

            const filePath = path.join(process.cwd(), 'public', 'relatorios', fileName);
            
            // Verifica no log da VPS se o arquivo realmente está lá na hora de anexar
            if (!fs.existsSync(filePath)) {
                console.log(`[AVISO] Arquivo não encontrado para anexo: ${filePath}`);
            }

            return {
                filename: fileName,
                path: filePath 
            };
        });

        // =========================================================
        // Busca a lista de e-mails configurados no banco
        // =========================================================
        const [configRes] = await pool.query<RowDataPacket[]>(`SELECT s_emailDestino_config FROM config LIMIT 1`);
        
        let emailsDestino = process.env.EMAIL_DESTINO_EMPRESA; // E-mail padrão de fallback
        
        if (configRes.length > 0 && configRes[0].s_emailDestino_config) {
            // Converte a string separada por ';' para uma lista separada por vírgula para o nodemailer
            emailsDestino = configRes[0].s_emailDestino_config
                .split(';')
                .map((e: string) => e.trim())
                .filter((e: string) => e !== '')
                .join(', ');
        }
        // =========================================================

        const info = await transporter.sendMail({
            from: `"Sistema FAP" <${process.env.SMTP_USER}>`, 
            to: emailsDestino, 
            subject: assunto, 
            text: "Olá! Seguem em anexo os relatórios FAP da última avaliação.", 
            html: "<p>Olá!</p><p>Seguem em anexo os relatórios FAP da última avaliação gerada pelo sistema.</p>", 
            attachments: anexos, 
        });

        return res.status(200).json({ message: 'E-mail enviado com sucesso para a empresa!' });

    } catch (error) {
        // Isso vai imprimir no console da VPS o motivo real da falha
        console.error("Erro detalhado ao enviar e-mail:", error);
        return res.status(500).json({ error: 'Falha ao enviar o e-mail' });
    }
}