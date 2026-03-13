import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/services/Banco"
import { ResultSetHeader } from 'mysql2';

//export const config = {
//    api: {
//        bodyParser: false,
//    },
//};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const apiKey = req.headers['x-api-key'];

    //if (!apiKey || apiKey !== process.env.API_KEY) {
    //   return res.status(401).json({ message: 'Acesso não autorizado: API Key inválida ou ausente.' });
    //}

    if(req.method !== "POST") {
        return res.status(405).json({ message: 'Método não permitido' });
    }
    

    if (!req.body) {
        return res.status(400).json({ message: 'Corpo da requisição vazio' });
    }

    const { nome_avaliacao, dt_avaliacao } = req.body;

    if (!nome_avaliacao) {
        return res.status(400).json({ message: 'Dados incompletos ou formato inválido' });
    }

    try {

        await pool.query<ResultSetHeader>(
            'INSERT INTO avaliacao (s_nome_avaliacao, dt_data_avaliacao) VALUES (?, ?)',
            [nome_avaliacao, dt_avaliacao]
        );

        return res.status(201).json({ 
            message: "Avaliação registrada!"
        });
    }catch(err){

        throw err;
    }

}