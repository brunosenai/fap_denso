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
            idAvaliacao
        } = req.query

        if(action == "getIniData"){
            try {
                const [rows_candidatos] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        n_id_candidato,
                        s_nome_candidato,
                        s_cpf_candidato
                    FROM
                        candidato
                    ORDER BY
                        n_id_candidato DESC;
                    `,[]
                )
                const [rows_avaliacoes] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        *
                    FROM
                        avaliacao
                    WHERE
                        dt_data_avaliacao >= CURDATE()
                    ORDER BY
                        dt_data_avaliacao ASC
                    `,[]
                )
                const data={
                    candidatos:rows_candidatos,
                    avaliacoes:rows_avaliacoes
                }
                res.status(200).json(data)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if(action == "CandidatosPorAvaliacao"){
            try {
                const [rows_candidatos] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        c.n_id_candidato,
                        c.s_nome_candidato,
                        c.s_cpf_candidato
                    FROM
                        fap f
                    LEFT JOIN candidato c ON c.n_id_candidato = f.n_id_candidato
                    WHERE
                        f.n_id_avaliacao=?
                    ORDER BY
                        c.s_nome_candidato ASC;
                    `,[idAvaliacao]
                )
                res.status(200).json(rows_candidatos)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    }else if(req.method === 'POST'){
        const { n_id_candidato, n_id_avaliacao} = req.body;
        console.log(req.body)
        try {
            const [rows_candidatos] = await pool.query<RowDataPacket[]>(`
                SELECT
                    n_id_avaliacao
                FROM
                    fap
                WHERE
                    n_id_candidato=?;
                `,[n_id_candidato]
            )
            if(rows_candidatos.length>6){
                return res.status(500).json({message:"Não é possível associar mais de 6 candidatos por avaliação"})
            }
            await pool.query<ResultSetHeader>(`
                INSERT INTO
                    fap (n_id_avaliacao,n_id_candidato)
                VALUES
                    (?,?);
            `,[n_id_avaliacao, n_id_candidato]
            )
            return res.status(200).json({ 
                message: 'Candidato associado com sucesso!',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message:"Internal Server Error: erro 500"})
        }
    }else if(req.method === 'DELETE'){
        const { n_id_candidato, n_id_avaliacao} = req.body;
        try {
            console.log(req.body)
            await pool.query<ResultSetHeader>(`
                DELETE FROM  
                    fap
                WHERE 
                    n_id_avaliacao = ? AND
                    n_id_candidato = ?;
            `,[n_id_avaliacao, n_id_candidato]
            )

            return res.status(200).json({ 
            message: 'Candidato desvinculados com sucesso!',
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