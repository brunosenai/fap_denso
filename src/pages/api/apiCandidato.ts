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
            n_id_avaliacao,
            n_id_candidato,
            listaIds,
            nomeAvaliacao
        } = req.query

        if (action == "getCandidatosByAvaliacaoFiltro") {
            try {
                const [rows_av] = await pool.query<RowDataPacket[]>(`
                    SELECT n_id_avaliacao FROM avaliacao WHERE s_nome_avaliacao = ?
                    `, [nomeAvaliacao]
                )
                const idAval = rows_av.length > 0 ? rows_av[0].n_id_avaliacao : -1;
                const [rows_cell] = await pool.query<RowDataPacket[]>(`
                    SELECT f.n_id_candidato, c.s_nome_candidato, c.s_cpf_candidato
                    FROM fap f
                    LEFT JOIN candidato c ON c.n_id_candidato=f.n_id_candidato
                    WHERE f.n_id_avaliacao=?
                    ORDER BY c.s_nome_candidato ASC
                    `, [idAval]
                )
                res.status(200).json(rows_cell)
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" })
            }
        } else if (action == "getListaCandidatos") {
            try {
                // CORREÇÃO DE SEGURANÇA (SQL INJECTION): Converte a string "1,2,3" num Array de números [1,2,3]
                const arrIds = String(listaIds).split(',').map(id => Number(id.trim()));

                const [rows_cell] = await pool.query<RowDataPacket[]>(`
                    SELECT n_id_candidato, s_nome_candidato
                    FROM candidato
                    WHERE n_id_candidato IN (?)
                    ORDER BY s_nome_candidato ASC
                    `, [arrIds] // O MySQL2 resolve automaticamente arrays com o '?'
                )
                res.status(200).json(rows_cell)
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" })
            }
        } else if (action == "getCandidatosPorAvaliacao") {
            try {
                const [rows_cell] = await pool.query<RowDataPacket[]>(`
                    SELECT * FROM candidato
                    WHERE n_id_candidato IN (
                        SELECT n_id_candidato FROM fap WHERE n_id_avaliacao=?
                    )
                    ORDER BY n_id_candidato ASC;
                    `, [n_id_avaliacao]
                )
                res.status(200).json(rows_cell)
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" })
            }
        } else if (action == "getCandidatosByAvaliacao") {
            try {
                const [rows_cell] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        f.n_id_candidato,
                        c.s_nome_candidato,
                        c.s_cpf_candidato,
                        f.n_candidatopresente_fap
                    FROM fap f
                    LEFT JOIN candidato c ON c.n_id_candidato=f.n_id_candidato
                    WHERE f.n_id_avaliacao=? AND f.n_status_fap=0
                    ORDER BY c.s_nome_candidato ASC
                    `, [n_id_avaliacao]
                )
                res.status(200).json(rows_cell)
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" })
            }
        } else if (action == "getDadosByFap") {
            try {
                // CORREÇÃO DE SEGURANÇA (SQL INJECTION): Mesma blindagem aqui!
                const arrIds = String(listaIds).split(',').map(id => Number(id.trim()));

                const [rows_fap] = await pool.query<RowDataPacket[]>(`
                    SELECT f.*, c.s_nome_candidato
                    FROM fap f
                    LEFT JOIN candidato c ON c.n_id_candidato=f.n_id_candidato
                    WHERE f.n_id_avaliacao = ? AND f.n_id_candidato IN (?)
                    ORDER BY f.n_id_candidato ASC;
                    `, [n_id_avaliacao, arrIds]
                )
                const [rows_candidatos] = await pool.query<RowDataPacket[]>(`
                   SELECT n_id_candidato, s_nome_candidato
                   FROM candidato
                   WHERE n_id_candidato IN (?)
                   ORDER BY s_nome_candidato ASC
                   `, [arrIds]
                )
                const [rows_avaliacao] = await pool.query<RowDataPacket[]>(`
                    SELECT * FROM avaliacao WHERE n_id_avaliacao = ?
                    `, [n_id_avaliacao]
                )
                
                const data = {
                    fap: rows_fap,
                    candidatos: rows_candidatos,
                    avaliacao: rows_avaliacao[0]
                }
                res.status(200).json(data)
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" })
            }
        } else if (action == "getTrazerCandidato") {
            try {
                const [rows_cell] = await pool.query<RowDataPacket[]>(`
                SELECT 
                    c.n_id_candidato, 
                    c.s_nome_candidato, 
                    c.s_cpf_candidato, 
                    f.n_id_avaliacao, 
                    a.s_nome_avaliacao, 
                    a.dt_data_avaliacao
                FROM 
                    fap f
                INNER JOIN 
                    candidato c ON f.n_id_candidato = c.n_id_candidato
                INNER JOIN 
                    avaliacao a ON f.n_id_avaliacao = a.n_id_avaliacao
                WHERE 
                    f.n_status_fap = 0 AND f.n_id_avaliacao <> ?
                ORDER BY 
                    a.dt_data_avaliacao ASC, 
                    c.s_nome_candidato ASC;
                    `, [n_id_avaliacao]
                )
                res.status(200).json(rows_cell)
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

        // ==========================================
        // NOVA AÇÃO: Marcar Falta
        // ==========================================
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
        } 
        // ==========================================
        // Ação Antiga (vínculo de avaliadores)
        // ==========================================
        else {
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