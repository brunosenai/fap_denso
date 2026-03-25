import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/services/Banco"
import { ResultSetHeader, RowDataPacket } from 'mysql2';

//export const config = {
//    api: {
//        bodyParser: false,
//    },
//};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const apiKey = req.headers['x-api-key'];

    //if (!apiKey || apiKey !== process.env.API_KEY) {
    //    return res.status(401).json({ message: 'Acesso não autorizado: API Key inválida ou ausente.' });
    //}

    if(req.method === 'GET'){
        const {
            action,
        } = req.query

        if(action == "getPessoas"){
            try {
                const [rows_cell] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        n_id_pessoa,
                        s_nome_pessoa,
                        s_email_pessoa,
                        s_telefone_pessoa
                    FROM
                        pessoa
                    ORDER BY
                        s_nome_pessoa ASC;
                    `,[]
                )
                res.status(200).json(rows_cell)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    }else if(req.method === 'POST'){
        const { s_nome_candidato, s_cpf_candidato, s_email_candidato } = req.body;
        console.log(req.body)
        try {
            await pool.query<ResultSetHeader>(`
                INSERT INTO
                    candidato (s_nome_candidato,s_cpf_candidato,s_email_candidato)
                VALUES
                    (?,?,?);
            `,[s_nome_candidato, s_cpf_candidato, s_email_candidato]
            )
            return res.status(200).json({ 
                message: 'Candidato cadastrado com sucesso!',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message:"Internal Server Error: erro 500"})
        }
    }else if(req.method === 'PUT'){
        const { id_pessoa, id_avaliacao, idsCandidatos } = req.body;

        if (!id_pessoa || !id_avaliacao || !idsCandidatos || !Array.isArray(idsCandidatos)) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        try {
            await pool.query<ResultSetHeader>(`
                UPDATE 
                    avaCanFap
                SET 
                    n_id_pessoa = ?
                WHERE 
                    n_id_avaliacao = ? 
                    AND n_id_candidato IN (?);
            `,[id_pessoa, id_avaliacao, idsCandidatos]
            )

            return res.status(200).json({ 
            message: 'Candidatos vinculados à pessoa com sucesso!',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message:"Internal Server Error: erro 500"})
        }
    }
    

}