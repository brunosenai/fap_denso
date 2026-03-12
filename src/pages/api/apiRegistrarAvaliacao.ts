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

    const { nome_avaliacao, dt_avaliacao, idsCandidatos } = req.body;

    if (!nome_avaliacao || !idsCandidatos || !Array.isArray(idsCandidatos)) {
        return res.status(400).json({ message: 'Dados incompletos ou formato inválido' });
    }
    
    const connection = await pool.getConnection();

    try {
       
        await connection.beginTransaction();

        const [resAval] = await connection.query<ResultSetHeader>(
            'INSERT INTO avaliacao (s_nome_avaliacao, dt_data_avaliacao) VALUES (?, ?)',
            [nome_avaliacao, dt_avaliacao]
        );
        const idAvaliacao = resAval.insertId;

        const valoresJuncao = idsCandidatos.map(idCand => [
            idAvaliacao,
            idCand
        ]);

        await connection.query(
            'INSERT INTO avaCanFap (n_id_avaliacao, n_id_candidato) VALUES ?',
            [valoresJuncao]
        );

        await connection.commit();

        return res.status(201).json({ 
            message: "Avaliação registrada e candidatos vinculados!"
        });
    }catch(err){
        await connection.rollback();
        throw err;
    }finally{
        connection.release();
    }

}