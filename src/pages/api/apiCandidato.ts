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
            n_id_avaliacao,
            n_id_candidato,
            listaIds
        } = req.query

        if(action == "getListaCandidatos"){
            try {
                const [rows_cell] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        n_id_candidato,
                        s_nome_candidato
                    FROM
                        candidato
                    WHERE
                        n_id_candidato in (${listaIds})
                    ORDER BY
                        s_nome_candidato ASC
                    `,[]
                )
                res.status(200).json(rows_cell)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if(action == "getCandidatosByAvaliacao"){
            try {
                const [rows_cell] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        f.n_id_candidato,
                        c.s_nome_candidato,
                        c.s_cpf_candidato
                    FROM
                        fap f
                    LEFT JOIN candidato c ON c.n_id_candidato=f.n_id_candidato
                    WHERE
                        f.n_id_avaliacao=?
                    ORDER BY
                        c.s_nome_candidato ASC
                    `,[n_id_avaliacao]
                )
                res.status(200).json(rows_cell)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if(action == "getDadosByFap"){
            try {
                const [rows_fap] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        f.*,
                        c.s_nome_candidato
                    FROM
                        fap f
                    LEFT JOIN candidato c ON c.n_id_candidato=f.n_id_candidato
                    WHERE
                        f.n_id_avaliacao = ? AND f.n_id_candidato in (${listaIds})
                    ORDER BY
                        f.n_id_candidato asc;
                    `,[n_id_avaliacao]
                )
                const [rows_candidatos] = await pool.query<RowDataPacket[]>(`
                   SELECT
                        n_id_candidato,
                        s_nome_candidato
                    FROM
                        candidato
                    WHERE
                        n_id_candidato in (${listaIds})
                    ORDER BY
                        s_nome_candidato ASC
                    `,[]
                )
                const [rows_avaliacao] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        *
                    FROM
                        avaliacao
                    WHERE
                        n_id_avaliacao = ?
                    `,[n_id_avaliacao]
                )
                const data={
                    fap:rows_fap,
                    candidatos:rows_candidatos,
                    avaliacao:rows_avaliacao[0]
                }

                res.status(200).json(data)
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
                        fap f ON c.n_id_candidato = f.n_id_candidato
                    WHERE 
                        f.n_id_avaliacao = ?;
                `,[n_id_candidato]
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