import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/services/Banco"
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

    if(req.method === 'GET'){

        const {
            action,
            id
        } = req.query

        if(action == "getAvaliacao"){
            try {
                const [rows_cell] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        *
                    FROM
                        avaliacao
                    WHERE
                        dt_data_avaliacao >= CURDATE()
                    ORDER BY
                        dt_data_avaliacao DESC
                    `,[]
                )

                res.status(200).json(rows_cell)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }

        if(action == "getAllAvaliacao"){
            try {
                const [rows_cell] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        *
                    FROM
                        avaliacao
                    ORDER BY
                        dt_data_avaliacao DESC
                    `,[]
                )

                res.status(200).json(rows_cell)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }

        if(action == 'getCandidatosByAvaliacao'){
            try {
                const [rows_cell] = await pool.query<RowDataPacket[]>(`
                    SELECT 
                        c.n_id_candidato,
                        c.s_nome_candidato,
                        c.s_cpf_candidato
                    FROM 
                        candidato c
                    INNER JOIN 
                        fap acf ON c.n_id_candidato = acf.n_id_candidato
                    WHERE 
                        acf.n_id_avaliacao = ?;
                `,[id]
                )

                res.status(200).json(rows_cell)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    }

    if(req.method === 'PUT'){
        const { id_pessoa, id_avaliacao, idsCandidatos } = req.body;

        if (!id_pessoa || !id_avaliacao || !idsCandidatos || !Array.isArray(idsCandidatos)) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        try {
            await pool.query<ResultSetHeader>(`
                UPDATE 
                    fap
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