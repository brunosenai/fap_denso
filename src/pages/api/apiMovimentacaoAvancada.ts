import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/services/Banco"
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    let apiKey = ''
    if (req.method === 'GET') {
        apiKey = req.query.apiKey as string
    } else {
        apiKey = req.body.apiKey as string
    }
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ message: 'Acesso não autorizado: API Key inválida ou ausente.' });
    }

    if (req.method === 'GET') {
        const {
            action,
            idAvaliacao,
        } = req.query

        if (action == "getIni") {
            try {
                const [rows_candidatos] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        c.*,
                        f.n_id_avaliacao,
                        f.dt_date_fap
                    FROM
                        candidato c
                    LEFT JOIN fap f ON c.n_id_candidato = f.n_id_candidato
                    ORDER BY
                        c.n_id_candidato DESC;
                    `, []
                )
                const [rows_avaliacoes] = await pool.query<RowDataPacket[]>(`
                    SELECT * FROM avaliacao WHERE n_status_avaliacao=0 ORDER BY n_id_avaliacao DESC;
                    `, []
                )
                const retorno={
                    candidatos:rows_candidatos,
                    avaliacoes:rows_avaliacoes
                }
                res.status(200).json(retorno)
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" })
            }
        }else if (action == "getCandidatosAvaliacao") {
            try {
                const [rows_candidatos] = await pool.query<RowDataPacket[]>(`
                    SELECT 
                        c.*,
                        f.n_id_avaliacao
                    FROM 
                        candidato c
                    INNER JOIN 
                        fap f ON c.n_id_candidato = f.n_id_candidato
                    WHERE 
                        f.n_id_avaliacao = ?;
                    `, [idAvaliacao]
                )
                res.status(200).json(rows_candidatos)
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" })
            }
        }
    }else if (req.method === 'PUT') {
        const {
            action,
            idCandidato,
            idAvaliacaoCandidato,
            idNovaAvaliacao
        } = req.body;
        console.log('iniciando api')
        console.log(req.body)
        if (action === 'moverCandidato') {
            try {
                await pool.query<ResultSetHeader>(`
                    UPDATE fap 
                    SET n_id_avaliacao = ? 
                    WHERE n_id_avaliacao = ? AND n_id_candidato = ?;
                `, [idNovaAvaliacao, idAvaliacaoCandidato, idCandidato]);

                return res.status(200).json({ message: 'Status de presença atualizado!' });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Erro ao atualizar falta." });
            }
        } else {
            const { id_pessoa, id_avaliacao, idsCandidatos } = req.body;
            if (!id_pessoa || !id_avaliacao || !idsCandidatos || !Array.isArray(idsCandidatos)) {
                return res.status(400).json({ message: 'Dados incompletos' });
            }
            try {
                await pool.query<ResultSetHeader>(`
                    UPDATE fap
                    SET n_id_pessoa = ?
                    WHERE n_id_avaliacao = ? AND n_id_candidato IN (?);
                `, [id_pessoa, id_avaliacao, idsCandidatos]);

                return res.status(200).json({ message: 'Candidatos vinculados à pessoa com sucesso!' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" })
            }
        }
    }
}