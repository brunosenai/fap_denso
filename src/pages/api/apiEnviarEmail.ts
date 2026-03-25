import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { assunto, arquivos } = req.body;

    if (!arquivos || !Array.isArray(arquivos)) {
        return res.status(400).json({ error: 'Nenhum arquivo para enviar' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const anexos = arquivos.map((fileName) => {
            const filePath = path.join(process.cwd(), 'public', 'relatorios', fileName);
            return {
                filename: fileName,
                path: filePath 
            };
        });

        const emailEmpresa = process.env.EMAIL_DESTINO_EMPRESA;

        const info = await transporter.sendMail({
            from: `"Sistema FAP" <${process.env.SMTP_USER}>`, 
            to: emailEmpresa, // <-- Envia para o e-mail fixo da empresa
            subject: assunto, 
            text: "Olá! Seguem em anexo os relatórios FAP da última avaliação.", 
            html: "<p>Olá!</p><p>Seguem em anexo os relatórios FAP da última avaliação gerada pelo sistema.</p>", 
            attachments: anexos, 
        });

        return res.status(200).json({ message: 'E-mail enviado com sucesso para a empresa!' });

    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        return res.status(500).json({ error: 'Falha ao enviar o e-mail' });
    }
}