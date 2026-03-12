import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/DB/db"
import { ResultSetHeader } from 'mysql2';

//export const config = {
//    api: {
//        bodyParser: false,
//    },
//};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== "POST") {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    if (!req.body) {
        return res.status(400).json({ message: 'Corpo da requisição vazio' });
    }

    const { data } = req.body;

    if (!data) {
        return res.status(400).json({ message: 'Dados incompletos ou formato inválido' });
    }

    try {

        await pool.query<ResultSetHeader>(`
            INSERT INTO
                candidato (s_nome_candidato, s_cpf_candidato, s_email_candidato)
            VALUES
                (?, ?, ?)
            `,[data.nome, data.cpf, data.email]
        )

        return res.status(200).json({})
    }catch(err: any){
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'CPF ou Email já cadastrado.' });
        }
        return res.status(500).json({ message: 'Erro no servidor.' });
    }

}