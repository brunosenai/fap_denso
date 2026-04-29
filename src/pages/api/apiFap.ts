import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/services/Banco"
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import fs from 'fs';
import path from 'path';

// Ajustado para permitir o envio de dados maiores
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', 
        },
    },
};

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

    if (req.method === 'GET') {
        const {
            action,
            n_id_candidato,
            n_id_avaliacao,
            n_id_avaliacao_atual,
            n_id_avaliacao_nova,
        } = req.query;

        if (action == "getTrazerCandidado") {
            try {
                const [rows_cadidatos] = await pool.query<RowDataPacket[]>(`
                    UPDATE
                        fap
                    SET
                        n_id_avaliacao=?
                    WHERE
                        n_id_avaliacao=? AND n_id_candidato=?;
                    `, [n_id_avaliacao_nova,n_id_avaliacao_atual,n_id_candidato]
                );
                res.status(200).json(rows_cadidatos);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" });
            }
        } else if (action == "getListaCandidatos") {
            try {
                const [rows_cadidatos] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        n_id_candidato,
                        s_nome_candidato
                    FROM
                        candidato
                    ORDER BY
                        s_nome_candidato ASC
                    `, []
                );
                
                res.status(200).json(rows_cadidatos);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" });
            }
        } else if (action == "getInfoFapCandidato") {
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
                    `, [n_id_candidato, n_id_avaliacao]
                );
                res.status(200).json(rows_fap[0]);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" });
            }
        } else if (action == "getAllCandidatosFap_cad" || action == "getAllCandidatosFap") {
            try {
                // LÓGICA DE PAGINAÇÃO
                const pagina = Number(req.query.pagina) || 1;
                const limite = 50;
                const offset = (pagina - 1) * limite;

                // 1. Descobrir o total de registros (Para calcular o total de páginas)
                const countQuery = action == "getAllCandidatosFap" 
                    ? `SELECT COUNT(DISTINCT c.n_id_candidato) as total FROM candidato c INNER JOIN fap f ON c.n_id_candidato = f.n_id_candidato`
                    : `SELECT COUNT(DISTINCT c.n_id_candidato) as total FROM candidato c`;
                
                const [countResult] = await pool.query<RowDataPacket[]>(countQuery);
                const totalRegistros = countResult[0].total;
                const totalPaginas = Math.ceil(totalRegistros / limite);

                // 2. Buscar apenas os 50 registros da página atual
                const [rows_cadidatos] = await pool.query<RowDataPacket[]>(`
                    SELECT 
                        c.n_id_candidato,
                        c.s_nome_candidato, 
                        c.s_email_candidato,
                        JSON_ARRAYAGG(f.s_relatorio_fap) AS relatorios 
                    FROM 
                        candidato c
                    ${action == "getAllCandidatosFap" ? "INNER JOIN" : "LEFT JOIN"} 
                        fap f ON c.n_id_candidato = f.n_id_candidato
                    GROUP BY 
                        c.n_id_candidato
                    ORDER BY 
                        c.n_id_candidato DESC
                    LIMIT ? OFFSET ?;
                    `, [limite, offset] // <-- Parâmetros mágicos do MySQL para paginação
                );

                // 3. Retornar um Objeto com os Dados e as Páginas
                res.status(200).json({
                    dados: rows_cadidatos,
                    totalPaginas: totalPaginas === 0 ? 1 : totalPaginas, // Garante que existe no mínimo 1 página
                    paginaAtual: pagina
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" });
            }
        }
    } 
    
    else if (req.method === 'PUT') {
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

        if (action == "editarFapCandidato") {
            try {
                const [rows_cadidatos] = await pool.query<RowDataPacket[]>(`
                    UPDATE fap
                    SET s_q13_fap = ?, s_q14_fap = ?, s_q15_fap = ?, s_q16_fap = ?
                    WHERE n_id_avaliacao = ? AND n_id_candidato = ?;
                    `, [s_q13_fap, s_q14_fap, s_q15_fap, s_q16_fap, n_id_avaliacao, n_id_candidato]
                );
                res.status(200).json(rows_cadidatos);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" });
            }
        } else {
            // === SALVAMENTO DA AVALIAÇÃO COMPLETA ===
            try {
                // 1. Atualiza a nota e status de cada candidato na tabela FAP
                for (const itemFap of fap) {
                    let dataMySQL = itemFap.dt_date_fap;
                    if (dataMySQL && typeof dataMySQL === 'string' && dataMySQL.includes('T')) {
                        dataMySQL = dataMySQL.slice(0, 19).replace('T', ' ');
                    }   
                    await pool.query<ResultSetHeader>(`
                        UPDATE fap SET 
                            n_id_pessoa=?, dt_date_fap=?, n_nota_fap=?, n_resultado_fap=?,
                            n_posto1_fap=?, n_posto2_fap=?, n_posto3_fap=?, n_posto4_fap=?,
                            n_posto5_fap=?, n_posto6_fap=?, n_q6_fap=?, n_q7_fap=?,
                            n_q8_fap=?, n_q9_fap=?, n_q10_fap=?, n_q11_fap=?,
                            n_q12_fap=?, s_q13_fap=?, s_q14_fap=?, s_q15_fap=?, s_q16_fap=?,
                            n_status_fap=?
                        WHERE n_id_avaliacao = ? AND n_id_candidato = ?;
                    `, [
                        itemFap.n_id_pessoa, dataMySQL, itemFap.n_nota_fap, itemFap.n_resultado_fap,
                        itemFap.n_posto1_fap, itemFap.n_posto2_fap, itemFap.n_posto3_fap, itemFap.n_posto4_fap,
                        itemFap.n_posto5_fap, itemFap.n_posto6_fap, itemFap.n_q6_fap, itemFap.n_q7_fap,
                        itemFap.n_q8_fap, itemFap.n_q9_fap, itemFap.n_q10_fap, itemFap.n_q11_fap,
                        itemFap.n_q12_fap, itemFap.s_q13_fap, itemFap.s_q14_fap, itemFap.s_q15_fap, itemFap.s_q16_fap,
                        itemFap.n_status_fap, itemFap.n_id_avaliacao, itemFap.n_id_candidato 
                    ]);
                }

                // 2. Atualiza o status geral da turma na tabela AVALIACAO
                if (fap && fap.length > 0) {
                    const idAvaliacao = fap[0].n_id_avaliacao;
                    await pool.query<ResultSetHeader>(`
                        UPDATE avaliacao 
                        SET n_status_avaliacao = 1 
                        WHERE n_id_avaliacao = ?
                    `, [idAvaliacao]);
                }

                return res.status(200).json({ 
                    message: 'Avaliações salvas com sucesso e status atualizado!',
                });
            } catch (error) {
                console.error("Erro ao salvar avaliação:", error);
                res.status(500).json({ message: "Internal Server Error: erro 500" });
            }
        }
    } 
    
    else if (req.method === 'POST') {
        // Rota POST mantida caso precise gravar um PDF base64 individualmente no futuro
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