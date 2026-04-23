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
            n_id_pessoa,
            n_id_avaliacao,
            historico,
        } = req.query

        if(action == "getAvaliacoesHojeEmDiante"){
            try {
                const [rows] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        *
                    FROM
                        avaliacao
                    WHERE
                        dt_data_avaliacao >= CURDATE() AND n_status_avaliacao==0
                    ORDER BY
                        dt_data_avaliacao ASC
                    `,[]
                )
                res.status(200).json(rows)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if(action == "getInfoAvaliacao"){
            try {
                const [rows_avaliacao] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        *
                    FROM
                        avaliacao
                    WHERE
                        n_id_avaliacao=?;
                    `,[n_id_avaliacao]
                )
                const [rows_fap] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        n_id_candidato,n_id_pessoa
                    FROM
                        fap
                    WHERE
                        n_id_avaliacao=?;
                    `,[n_id_avaliacao]
                )
                const idsCandidatos = rows_fap.length > 0 ? rows_fap.map(row => row.n_id_candidato) : [0];
                const idsAvaliadores = rows_fap.length > 0 ? rows_fap.map(row => row.n_id_pessoa) : [0];
                const [rows_cand] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        c.n_id_candidato,
                        c.s_nome_candidato,
                        f.n_resultado_fap
                    FROM
                        candidato c
                    INNER JOIN fap f ON f.n_id_candidato=c.n_id_candidato AND n_id_avaliacao=?
                    WHERE
                        c.n_id_candidato in (?);
                    `,[n_id_avaliacao, idsCandidatos]
                )
                const [rows_avaliadores] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        n_id_pessoa,
                        s_nome_pessoa
                    FROM
                        pessoa
                    WHERE
                        n_id_pessoa in (?);
                    `,[idsAvaliadores]
                )
                const retorno = {
                    infoAvaliacao:rows_avaliacao,
                    infoCandidatos:rows_cand,
                    infoAvaliadores:rows_avaliadores
                }
                res.status(200).json(retorno)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if(action == "getAvaliacoesPorAvaliador"){
            try {
                const [rows] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        *
                    FROM
                        avaliacao
                    WHERE
                        n_id_avaliacao in (
                            SELECT
                                n_id_avaliacao
                            FROM
                                fap
                            WHERE
                                n_id_pessoa=?
                            group by n_id_avaliacao
                        );
                    `,[n_id_pessoa]
                )
                res.status(200).json(rows)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if(action == "getAvaliacoes"){
            try {
                if(historico=='true'){
                    const [rows] = await pool.query<RowDataPacket[]>(`
                        SELECT
                            *
                        FROM
                            avaliacao
                        ORDER BY
                            dt_data_avaliacao DESC
                        `,[]
                    )
                    res.status(200).json(rows)
                }else{
                    const [rows] = await pool.query<RowDataPacket[]>(`
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
                    res.status(200).json(rows)
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    }else if(req.method === 'DELETE'){
        const { id_avaliacao } = req.body;

        try {
            const [rows] = await pool.query<RowDataPacket[]>(`
                SELECT
                    n_id_avaliacao
                FROM
                    fap
                WHERE
                    n_id_avaliacao = ?;
            `, [id_avaliacao]);
            if(rows.length > 0){
                return res.status(400).json({ 
                    message: 'Não é possível excluir a avaliação, pois existem FAPs vinculados a ela.',
                });
            }
            await pool.query(`
                DELETE FROM
                    avaliacao
                WHERE 
                    n_id_avaliacao = ?;
            `, [id_avaliacao]);
            return res.status(200).json({ 
                message: 'Avaliação excluída com sucesso!',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message:"Internal Server Error: erro 500"})
        }
    }else if(req.method === 'POST'){
        const { s_nome_avaliacao,dt_data_avaliacao } = req.body;

        try {
            await pool.query(`
                INSERT INTO
                    avaliacao
                    (s_nome_avaliacao, dt_data_avaliacao)
                VALUES
                    (?, ?);
            `, [s_nome_avaliacao,dt_data_avaliacao]);
            return res.status(200).json({ 
                message: 'Avaliação cadastrada com sucesso!',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message:"Internal Server Error: erro 500"})
        }
    }else if(req.method === 'PUT'){
        const { fap } = req.body;

        try {
            for (const itemFap of fap) {
                // 1. Formata a data do padrão ISO do JS para o padrão DATETIME do MySQL
                let dataMySQL = itemFap.dt_date_fap;
                if (dataMySQL && typeof dataMySQL === 'string' && dataMySQL.includes('T')) {
                    // Pega os primeiros 19 caracteres e troca o 'T' por um espaço
                    // '2026-03-09T00:00:00.000Z' vira '2026-03-09 00:00:00'
                    dataMySQL = dataMySQL.slice(0, 19).replace('T', ' ');
                }                
                await pool.query<ResultSetHeader>(`
                    UPDATE 
                        fap
                    SET 
                        n_id_pessoa=?,
                        dt_date_fap=?,
                        n_nota_fap=?,
                        n_resultado_fap=?,
                        n_posto1_fap=?,
                        n_posto2_fap=?,
                        n_posto3_fap=?,
                        n_posto4_fap=?,
                        n_posto5_fap=?,
                        n_posto6_fap=?,
                        n_q6_fap=?,
                        n_q7_fap=?,
                        n_q8_fap=?,
                        n_q9_fap=?,
                        n_q10_fap=?,
                        n_q11_fap=?,
                        n_q12_fap=?,
                        s_q13_fap=?,
                        s_q14_fap=?,
                        s_q15_fap=?,
                        s_q16_fap=?
                    WHERE 
                        n_id_avaliacao = ? 
                        AND n_id_candidato = ?;
                `, [
                    itemFap.n_id_pessoa,
                    dataMySQL,
                    itemFap.n_nota_fap,
                    itemFap.n_resultado_fap,
                    itemFap.n_posto1_fap,
                    itemFap.n_posto2_fap,
                    itemFap.n_posto3_fap,
                    itemFap.n_posto4_fap,
                    itemFap.n_posto5_fap,
                    itemFap.n_posto6_fap,
                    itemFap.n_q6_fap,
                    itemFap.n_q7_fap,
                    itemFap.n_q8_fap,
                    itemFap.n_q9_fap,
                    itemFap.n_q10_fap,
                    itemFap.n_q11_fap,
                    itemFap.n_q12_fap,
                    itemFap.s_q13_fap,
                    itemFap.s_q14_fap,
                    itemFap.s_q15_fap,
                    itemFap.s_q16_fap,
                    itemFap.n_id_avaliacao,
                    itemFap.n_id_candidato 
                ]);
            }

            return res.status(200).json({ 
                message: 'Candidatos vinculados à pessoa com sucesso!',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message:"Internal Server Error: erro 500"})
        }
    }
}