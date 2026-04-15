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

    const { filter, dataInicio, dataFim, page = 1, avaliacao, isExport = false} = req.query;

    try{
        let filtroSql = "";
        
        const params: any[] = [];
        const limitSql = isExport === 'true' ? 10000 : 20; 
        const offsetSql = isExport === 'true' ? 0 : (Number(page) - 1) * 20;

        if (filter === 'aprovados') {
            filtroSql += " AND f.n_resultado_fap <> 0";
        } else if (filter === 'reprovados') {
            filtroSql += " AND f.n_resultado_fap = 0";
        }

        if (dataInicio && dataFim) {
            filtroSql += " AND f.dt_date_fap BETWEEN ? AND ?";
            params.push(`${dataInicio} 00:00:00`, `${dataFim} 23:59:59`);
        }

        if (avaliacao && avaliacao !== 'todas') {
            filtroSql += " AND f.n_id_avaliacao = ?";
            params.push(avaliacao);
        }

        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                *,
                -- Cálculo Simples de Erros (Total - Acertos)
                (total_avaliados - acertos_q6) AS erros_q6,
                (total_avaliados - acertos_q7) AS erros_q7
            FROM (
                SELECT 
                  
                    total_avaliados,
                    total_aprovados,
                    total_reprovados,
                    ROUND((total_aprovados * 100.0 / total_avaliados), 2) AS taxa_aprovacao,

                  
                    acertos_q6,
                    acertos_q7,

              
                    q8_p1, q8_p2, q8_p3, q8_p4,
                    q9_p1, q9_p2, q9_p3, q9_p4,
                    q10_p1, q10_p2, q10_p3, q10_p4,
                    q11_p1, q11_p2, q11_p3, q11_p4,
                    q12_p1, q12_p2, q12_p3, q12_p4

                FROM (
                    SELECT 
                        COUNT(*) AS total_avaliados,
                        SUM(CASE WHEN n_resultado_fap <> 0 THEN 1 ELSE 0 END) AS total_aprovados,
                        SUM(CASE WHEN n_resultado_fap = 0 THEN 1 ELSE 0 END) AS total_reprovados,
                        
                        SUM(CASE WHEN n_q6_fap = 1 THEN 1 ELSE 0 END) AS acertos_q6,
                        SUM(CASE WHEN n_q7_fap = 1 THEN 1 ELSE 0 END) AS acertos_q7,

                      
                        SUM(CASE WHEN n_q8_fap = 1 THEN 1 ELSE 0 END) AS q8_p1,
                        SUM(CASE WHEN n_q8_fap = 2 THEN 1 ELSE 0 END) AS q8_p2,
                        SUM(CASE WHEN n_q8_fap = 3 THEN 1 ELSE 0 END) AS q8_p3,
                        SUM(CASE WHEN n_q8_fap = 4 THEN 1 ELSE 0 END) AS q8_p4,

                        SUM(CASE WHEN n_q9_fap = 1 THEN 1 ELSE 0 END) AS q9_p1,
                        SUM(CASE WHEN n_q9_fap = 2 THEN 1 ELSE 0 END) AS q9_p2,
                        SUM(CASE WHEN n_q9_fap = 3 THEN 1 ELSE 0 END) AS q9_p3,
                        SUM(CASE WHEN n_q9_fap = 4 THEN 1 ELSE 0 END) AS q9_p4,

                        SUM(CASE WHEN n_q10_fap = 1 THEN 1 ELSE 0 END) AS q10_p1,
                        SUM(CASE WHEN n_q10_fap = 2 THEN 1 ELSE 0 END) AS q10_p2,
                        SUM(CASE WHEN n_q10_fap = 3 THEN 1 ELSE 0 END) AS q10_p3,
                        SUM(CASE WHEN n_q10_fap = 4 THEN 1 ELSE 0 END) AS q10_p4,

                        SUM(CASE WHEN n_q11_fap = 1 THEN 1 ELSE 0 END) AS q11_p1,
                        SUM(CASE WHEN n_q11_fap = 2 THEN 1 ELSE 0 END) AS q11_p2,
                        SUM(CASE WHEN n_q11_fap = 3 THEN 1 ELSE 0 END) AS q11_p3,
                        SUM(CASE WHEN n_q11_fap = 4 THEN 1 ELSE 0 END) AS q11_p4,

                        SUM(CASE WHEN n_q12_fap = 1 THEN 1 ELSE 0 END) AS q12_p1,
                        SUM(CASE WHEN n_q12_fap = 2 THEN 1 ELSE 0 END) AS q12_p2,
                        SUM(CASE WHEN n_q12_fap = 3 THEN 1 ELSE 0 END) AS q12_p3,
                        SUM(CASE WHEN n_q12_fap = 4 THEN 1 ELSE 0 END) AS q12_p4

                    FROM (
                        SELECT 
                            f.*,
                            ROW_NUMBER() OVER (PARTITION BY f.n_id_candidato ORDER BY f.dt_date_fap DESC) as ordem
                        FROM 
                            fap f
                        WHERE 
                            f.s_relatorio_fap IS NOT NULL
                    ) AS sub
                    WHERE sub.ordem = 1
                ) AS resumo_interno
            ) AS resumo_final;
            `,[] 
        )

        const [listaCandidatos] = await pool.query<RowDataPacket[]>(`
            SELECT 
                c.s_nome_candidato AS nome,
                a.s_nome_avaliacao AS avaliacao,
                DATE_FORMAT(f.dt_date_fap, '%d/%m/%Y %H:%i') AS data,
                f.n_resultado_fap AS resultado,
                f.s_relatorio_fap AS relatorio
            FROM fap f
            INNER JOIN candidato c ON f.n_id_candidato = c.n_id_candidato
            INNER JOIN avaliacao a ON f.n_id_avaliacao = a.n_id_avaliacao
            WHERE f.s_relatorio_fap IS NOT NULL ${filtroSql}
            ORDER BY f.dt_date_fap DESC
            LIMIT ? OFFSET ?
        `, [...params, limitSql, offsetSql]);

        const dadosGraficoGeral = [
            { value: rows[0].total_aprovados, name: 'Aprovados' },
            { value: rows[0].total_reprovados, name: 'Reprovados' }
        ];

        const dadosDicotomicos = {
            questoes: [
                'Condução segura do ciclo\n(Uso do EPI)', 
                'Tratamento adequado de Não\nConformidade (Stop & Call)'
            ],
            acertos: [
                rows[0].acertos_q6, 
                rows[0].acertos_q7
            ],
            erros: [
                rows[0].erros_q6, 
                rows[0].erros_q7
            ]
        };

        const dadosGradual = {
            eixoX: ['DISCIPLINA OPERACIONAL', 'MONTAGEM CORRETA', 'ORGANIZAÇÃO DO POSTO', 'ACOMPANHAMENTO', 'RESILIÊNCIA'],
            nota1: [rows[0].q8_p1, rows[0].q9_p1, rows[0].q10_p1, rows[0].q11_p1, rows[0].q12_p1],
            nota2: [rows[0].q8_p2, rows[0].q9_p2, rows[0].q10_p2, rows[0].q11_p2, rows[0].q12_p2],
            nota3: [rows[0].q8_p3, rows[0].q9_p3, rows[0].q10_p3, rows[0].q11_p3, rows[0].q12_p3],
            nota4: [rows[0].q8_p4, rows[0].q9_p4, rows[0].q10_p4, rows[0].q11_p4, rows[0].q12_p4]
        };
        return res.status(200).json({
            cards: {
                totalAvaliados: rows[0].total_avaliados || 0,
                totalAprovados: rows[0].total_aprovados || 0,
                totalReprovados: rows[0].total_reprovados || 0,
                taxaAprovacao: Number(rows[0].taxa_aprovacao || 0).toFixed(2) + "%",
                taxaReprovacao: (100 - (rows[0].taxa_aprovacao || 0)).toFixed(2) + "%"
            },
            graficoPizzaGeral: dadosGraficoGeral,
            graficoDicotomico: dadosDicotomicos,
            graficoGradual: dadosGradual,
            tabelaCandidatos: listaCandidatos,
        });
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Internal Server Error: erro 500"})
    }
    

}