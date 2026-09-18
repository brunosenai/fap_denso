import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    let apiKey = '';
    if (req.method === 'GET') {
        apiKey = req.query.apiKey as string;
    } else {
        apiKey = req.body.apiKey as string;
    }

    if (apiKey !== process.env.NEXT_PUBLIC_API_KEY && apiKey !== process.env.API_KEY) {
        return res.status(401).json({ message: 'Acesso não autorizado: API Key inválida.' });
    }

    const filePath = path.join(process.cwd(), 'public', 'relatorios', 'dashboard_emails.json');
    const defaultEmails = ['ingridy.carvalho@fiemg.com.br', 'db.oliveira@fiemg.com.br', 'bpinho@fiemg.com.br'];

    if (req.method === 'GET') {
        try {
            if (!fs.existsSync(filePath)) {
                // Cria com o array default se não existir
                if (!fs.existsSync(path.dirname(filePath))) {
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                }
                fs.writeFileSync(filePath, JSON.stringify(defaultEmails, null, 2));
                return res.status(200).json(defaultEmails);
            }
            
            const data = fs.readFileSync(filePath, 'utf-8');
            const emails = JSON.parse(data);
            res.status(200).json(emails);
        } catch (error) {
            console.error('Erro ao ler dashboard_emails.json:', error);
            // Retorna fallback
            res.status(200).json(defaultEmails);
        }
    } else if (req.method === 'POST' || req.method === 'PUT') {
        const { emails } = req.body;
        if (!Array.isArray(emails)) {
            return res.status(400).json({ message: 'A lista de emails deve ser um array.' });
        }

        try {
            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }
            fs.writeFileSync(filePath, JSON.stringify(emails, null, 2));
            res.status(200).json({ message: 'E-mails salvos com sucesso', emails });
        } catch (error) {
            console.error('Erro ao salvar dashboard_emails.json:', error);
            res.status(500).json({ message: 'Erro ao salvar os e-mails' });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
