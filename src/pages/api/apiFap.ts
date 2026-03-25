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
            n_id_candidato,
            n_ip_pessoa,
            n_id_avaliacao,
            listaIdsCandidatos,

        } = req.query

        if(action == "getListaCandidatos"){
            try {
                const [rows_cadidatos] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        n_id_candidato,
                        s_nome_candidato
                    FROM
                        candidato
                    WHERE
                        n_id_candidato in (${listaIdsCandidatos})
                    ORDER BY
                        s_nome_candidato ASC
                    `,[]
                )
                const [rows_avacanfap] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        *
                    FROM
                        avacanfap
                    WHERE
                        n_id_candidato in (${listaIdsCandidatos})
                    ORDER BY
                        s_nome_candidato ASC
                    `,[]
                )
                const data={
                    rows_cadidatos:rows_cadidatos
                }
                res.status(200).json(rows_cadidatos)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    }else if(req.method === 'PUT'){
        const { fap } = req.body;
        console.log(fap)
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