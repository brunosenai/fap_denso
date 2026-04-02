import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Pega o nome do arquivo que vier na URL
    const { file } = req.query; 

    if (!file || typeof file !== 'string') {
        return res.status(400).json({ error: 'Nome do arquivo não fornecido' });
    }

    // Monta o caminho exato onde a sua apiFap salvou o arquivo
    const filePath = path.join(process.cwd(), 'public', 'relatorios', file);

    // Verifica se o arquivo realmente existe na VPS
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    try {
        // Lê o arquivo original do disco
        const fileBuffer = fs.readFileSync(filePath);

        // Avisa ao navegador que o que estamos enviando é um PDF verdadeiro
        res.setHeader('Content-Type', 'application/pdf');
        
        // "inline" faz o PDF abrir no navegador. Se quiser forçar o download, troque "inline" por "attachment"
        res.setHeader('Content-Disposition', `inline; filename=${file}`);

        // Despacha o arquivo
        res.send(fileBuffer);
    } catch (error) {
        console.error('Erro ao ler o PDF:', error);
        res.status(500).json({ error: 'Erro interno ao ler o arquivo' });
    }
}