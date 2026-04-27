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
        } = req.query

        if (action == "getIni") {
            try {
                const [rows_candidatos] = await pool.query<RowDataPacket[]>(`
                    SELECT * FROM candidato WHERE n_id_candidato NOT IN (SELECT n_id_candidato FROM fap)
                    `, []
                )
                const [rows_avaliacoes] = await pool.query<RowDataPacket[]>(`
                    SELECT * FROM avaliacao WHERE n_status_avaliacao=0
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
        }
    } else if (req.method === 'POST') {
        const { s_nome_candidato, s_cpf_candidato, s_email_candidato } = req.body;
        try {
            await pool.query<ResultSetHeader>(`
                INSERT INTO candidato (s_nome_candidato,s_cpf_candidato,s_email_candidato)
                VALUES (?,?,?);
            `, [s_nome_candidato, s_cpf_candidato, s_email_candidato])
            
            return res.status(200).json({ message: 'Candidato cadastrado com sucesso!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error: erro 500" })
        }
    } else if (req.method === 'PUT') {
        const { action } = req.body;
        if (action === 'marcarFalta') {
            const { id_avaliacao, id_candidato, presente } = req.body;
            try {
                await pool.query<ResultSetHeader>(`
                    UPDATE fap 
                    SET n_candidatopresente_fap = ? 
                    WHERE n_id_avaliacao = ? AND n_id_candidato = ?;
                `, [presente, id_avaliacao, id_candidato]);

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