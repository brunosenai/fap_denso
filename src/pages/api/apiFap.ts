import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/services/Banco"
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import fs from 'fs';
import path from 'path';

// Ajustado para permitir o envio do PDF em Base64
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', 
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const apiKey = req.headers['x-api-key'];

    // if (!apiKey || apiKey !== process.env.API_KEY) {
    //     return res.status(401).json({ message: 'Acesso não autorizado: API Key inválida ou ausente.' });
    // }

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
                    ORDER BY
                        s_nome_candidato ASC
                    `,[]
                )
                // Mantido como no seu código original
                const [rows_avacanfap] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        *
                    FROM
                        avacanfap
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
        }else if(action == "getInfoFapCandidato"){
            try {
                const [rows_fap] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        s_q13_fap,
                        s_q14_fap,
                        s_q15_fap,
                        s_q16_fap
                    FROM
                        fap
                    WHERE
                        n_id_candidato = ? AND n_id_avaliacao = ?
                    `,[n_id_candidato, n_id_avaliacao]
                )
                res.status(200).json(rows_fap[0])
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if(action == "getAllCandidatosFap_cad"){
            try {
                const [rows_cadidatos] = await pool.query<RowDataPacket[]>(`
                    SELECT 
                        c.n_id_candidato,
                        c.s_nome_candidato, 
                        c.s_email_candidato,
                        JSON_ARRAYAGG(f.s_relatorio_fap) AS relatorios -- Agrupa os relatórios em um array JSON
                    FROM 
                        candidato c
                    LEFT JOIN 
                        fap f ON c.n_id_candidato = f.n_id_candidato
                    GROUP BY 
                        c.n_id_candidato;
                    `,[]
                )
                res.status(200).json(rows_cadidatos)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if(action == "getAllCandidatosFap"){
            try {
                const [rows_cadidatos] = await pool.query<RowDataPacket[]>(`
                    SELECT 
                        c.n_id_candidato,
                        c.s_nome_candidato, 
                        c.s_email_candidato,
                        JSON_ARRAYAGG(f.s_relatorio_fap) AS relatorios -- Agrupa os relatórios em um array JSON
                    FROM 
                        candidato c
                    INNER JOIN 
                        fap f ON c.n_id_candidato = f.n_id_candidato
                    GROUP BY 
                        c.n_id_candidato;
                    `,[]
                )

                res.status(200).json(rows_cadidatos)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    } else if(req.method === 'PUT'){
        const {
            fap,
            action,
            n_id_avaliacao,
            n_id_candidato,
            s_q13_fap,
            s_q14_fap,
            s_q15_fap,
            s_q16_fap 
        } = req.body;

        if(action == "editarFapCandidato"){
            console.log("Editar Fap Candidato:", { n_id_avaliacao, n_id_candidato, s_q13_fap, s_q14_fap, s_q15_fap, s_q16_fap });
            try {
                const [rows_cadidatos] = await pool.query<RowDataPacket[]>(`
                    UPDATE
                        fap
                    SET
                        s_q13_fap = ?, s_q14_fap = ?, s_q15_fap = ?, s_q16_fap = ?
                    WHERE
                        n_id_avaliacao = ? AND n_id_candidato = ?;
                    `,[s_q13_fap, s_q14_fap, s_q15_fap, s_q16_fap, n_id_avaliacao, n_id_candidato]
                )

                res.status(200).json(rows_cadidatos)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else{
            try {
                for (const itemFap of fap) {
                    let dataMySQL = itemFap.dt_date_fap;
                    if (dataMySQL && typeof dataMySQL === 'string' && dataMySQL.includes('T')) {
                        dataMySQL = dataMySQL.slice(0, 19).replace('T', ' ');
                    }   
                    await pool.query<ResultSetHeader>(`
                        UPDATE 
                            fap
                        SET 
                            n_id_pessoa=?, dt_date_fap=?, n_nota_fap=?, n_resultado_fap=?,
                            n_posto1_fap=?, n_posto2_fap=?, n_posto3_fap=?, n_posto4_fap=?,
                            n_posto5_fap=?, n_posto6_fap=?, n_q6_fap=?, n_q7_fap=?,
                            n_q8_fap=?, n_q9_fap=?, n_q10_fap=?, n_q11_fap=?,
                            n_q12_fap=?, s_q13_fap=?, s_q14_fap=?, s_q15_fap=?, s_q16_fap=?,
                            n_status_fap=?
                        WHERE 
                            n_id_avaliacao = ? AND
                            n_id_candidato = ?;
                    `, [
                        itemFap.n_id_pessoa, dataMySQL, itemFap.n_nota_fap, itemFap.n_resultado_fap,
                        itemFap.n_posto1_fap, itemFap.n_posto2_fap, itemFap.n_posto3_fap, itemFap.n_posto4_fap,
                        itemFap.n_posto5_fap, itemFap.n_posto6_fap, itemFap.n_q6_fap, itemFap.n_q7_fap,
                        itemFap.n_q8_fap, itemFap.n_q9_fap, itemFap.n_q10_fap, itemFap.n_q11_fap,
                        itemFap.n_q12_fap, itemFap.s_q13_fap, itemFap.s_q14_fap, itemFap.s_q15_fap, itemFap.s_q16_fap,
                        itemFap.n_status_fap, itemFap.n_id_avaliacao, itemFap.n_id_candidato 
                    ]);
                }

                return res.status(200).json({ 
                    message: 'Avaliações salvas com sucesso!',
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    } else if(req.method === 'POST') {
        // Nova rota em POST para cuidar apenas da gravação do PDF
        const { n_id_avaliacao, n_id_candidato, fileName, fileData } = req.body;

        if (!n_id_avaliacao || !n_id_candidato || !fileName || !fileData) {
            return res.status(400).json({ error: 'Dados insuficientes para gravar o relatório' });
        }

        try {
            const dir = path.join(process.cwd(), 'public', 'relatorios');

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const filePath = path.join(dir, fileName);
            const fileBuffer = Buffer.from(fileData, 'base64');
            fs.writeFileSync(filePath, fileBuffer);

            const s_relatorio_fap = `/relatorios/${fileName}`;
            console.log(s_relatorio_fap)

            // Utilizando a sua mesma conexão de pool para o update!
            await pool.query<ResultSetHeader>(`
                UPDATE fap 
                SET s_relatorio_fap = ? 
                WHERE n_id_avaliacao = ? AND n_id_candidato = ?
            `, [s_relatorio_fap, n_id_avaliacao, n_id_candidato]);

            return res.status(200).json({ 
                message: 'Relatório salvo e atualizado com sucesso', 
                path: s_relatorio_fap 
            });

        } catch (error) {
            console.error('Erro ao processar o PDF:', error);
            return res.status(500).json({ error: 'Falha interna ao guardar o relatório' });
        }
    }
}