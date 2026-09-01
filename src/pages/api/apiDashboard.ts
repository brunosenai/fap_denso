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

    const { filter, dataInicio, dataFim, page = 1, avaliacao, isExport = false, filtroSgtSge} = req.query;

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

        if (filtroSgtSge === 'SGT') {
            filtroSql += " AND f.dt_date_fap <= '2026-07-21 23:59:59'";
        } else if (filtroSgtSge === 'SGE') {
            filtroSql += " AND f.dt_date_fap >= '2026-07-22 00:00:00'";
        }

        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                *,
                (total_avaliados - acertos_q6) AS erros_q6,
                (total_avaliados - acertos_q7) AS erros_q7
            FROM (
                SELECT 
                    total_avaliados,
                    total_aprovados,
                    total_reprovados,
                    reprovado_apenas_dicotomica,
                    reprovado_apenas_gradual,
                    reprovado_pelas_duas,
                    ROUND((total_aprovados * 100.0 / NULLIF(total_avaliados, 0)), 2) AS taxa_aprovacao,
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
                        SUM(apenas_dicotomica) AS reprovado_apenas_dicotomica,
                        SUM(apenas_gradual) AS reprovado_apenas_gradual,
                        SUM(ambas) AS reprovado_pelas_duas,
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
                            CASE WHEN (f.n_nota_fap < 13) AND (f.n_q6_fap = 1 AND f.n_q7_fap = 1) THEN 1 ELSE 0 END AS apenas_gradual,
                            CASE WHEN (f.n_q6_fap = 0 OR f.n_q7_fap = 0) AND (f.n_nota_fap >= 13) THEN 1 ELSE 0 END AS apenas_dicotomica,
                            CASE WHEN (f.n_q6_fap = 0 OR f.n_q7_fap = 0) AND (f.n_nota_fap < 13) THEN 1 ELSE 0 END AS ambas
                        FROM 
                            fap f
                        WHERE 
                            f.n_status_fap <> 0 AND f.n_candidatopresente_fap = 1 ${filtroSql}
                    ) AS sub
                ) AS resumo_interno
            ) AS resumo_final;  
        `, params);


        /**/ 

        const [listaCandidatos] = await pool.query<RowDataPacket[]>(`
            SELECT 
                c.s_nome_candidato AS nome,
                c.s_cpf_candidato AS cpf,
                c.s_email_candidato AS email,
                a.s_nome_avaliacao AS avaliacao,
                p.s_nome_pessoa AS avaliador,
                DATE_FORMAT(f.dt_date_fap, '%d/%m/%Y %H:%i') AS data,
                f.n_resultado_fap AS resultado,
                f.s_relatorio_fap AS relatorio
            FROM fap f
            INNER JOIN candidato c ON f.n_id_candidato = c.n_id_candidato
            INNER JOIN avaliacao a ON f.n_id_avaliacao = a.n_id_avaliacao
            INNER JOIN pessoa p ON f.n_id_pessoa = p.n_id_pessoa
            WHERE f.n_status_fap = 1 ${filtroSql}
            ORDER BY f.dt_date_fap DESC
            LIMIT ? OFFSET ?
        `, [...params, limitSql, offsetSql]);

        const totalAvaliados = Number(rows[0]?.total_avaliados || 0);
        const totalAprovados = Number(rows[0]?.total_aprovados || 0);
        const totalReprovados = Number(rows[0]?.total_reprovados || 0);
        const taxaAprovacao = Number(rows[0]?.taxa_aprovacao || 0);

        const dadosGraficoGeral = [
            { value: totalAprovados, name: 'Aprovados' },
            { value: totalReprovados, name: 'Reprovados' }
        ];

        const dadosDicotomicos = {
            questoes: [
                'Condução segura do ciclo\n(Uso do EPI)', 
                'Tratamento adequado de Não\nConformidade (Stop & Call)'
            ],
            acertos: [
                Number(rows[0]?.acertos_q6 || 0), 
                Number(rows[0]?.acertos_q7 || 0)
            ],
            erros: [
                Number(rows[0]?.erros_q6 || 0), 
                Number(rows[0]?.erros_q7 || 0)
            ]
        };

        const dadosGradual = {
            eixoX: ['DISCIPLINA OPERACIONAL', 'MONTAGEM CORRETA', 'ORGANIZAÇÃO DO POSTO', 'ACOMPANHAMENTO', 'RESILIÊNCIA'],
            nota1: [Number(rows[0]?.q8_p1 || 0), Number(rows[0]?.q9_p1 || 0), Number(rows[0]?.q10_p1 || 0), Number(rows[0]?.q11_p1 || 0), Number(rows[0]?.q12_p1 || 0)],
            nota2: [Number(rows[0]?.q8_p2 || 0), Number(rows[0]?.q9_p2 || 0), Number(rows[0]?.q10_p2 || 0), Number(rows[0]?.q11_p2 || 0), Number(rows[0]?.q12_p2 || 0)],
            nota3: [Number(rows[0]?.q8_p3 || 0), Number(rows[0]?.q9_p3 || 0), Number(rows[0]?.q10_p3 || 0), Number(rows[0]?.q11_p3 || 0), Number(rows[0]?.q12_p3 || 0)],
            nota4: [Number(rows[0]?.q8_p4 || 0), Number(rows[0]?.q9_p4 || 0), Number(rows[0]?.q10_p4 || 0), Number(rows[0]?.q11_p4 || 0), Number(rows[0]?.q12_p4 || 0)]
        };

        const dadosMotivosReprovacao = [
            { value: Number(rows[0]?.reprovado_apenas_gradual || 0), name: 'Reprovação Gradual' },
            { value: Number(rows[0]?.reprovado_apenas_dicotomica || 0), name: 'Reprovação Dicotômica' },
            { value: Number(rows[0]?.reprovado_pelas_duas || 0), name: 'Reprovação em Ambas' }
        ].filter(item => item.value > 0);

        return res.status(200).json({
            cards: {
                totalAvaliados: totalAvaliados,
                totalAprovados: totalAprovados,
                totalReprovados: totalReprovados,
                taxaAprovacao: taxaAprovacao.toFixed(2) + "%",
                taxaReprovacao: (100 - taxaAprovacao).toFixed(2) + "%"
            },
            graficoPizzaGeral: dadosGraficoGeral,
            graficoDicotomico: dadosDicotomicos,
            graficoGradual: dadosGradual,
            tabelaCandidatos: listaCandidatos || [],
            graficoMotivosReprovacao: dadosMotivosReprovacao
        });
    } catch (error) {
        console.error("Erro no apiDashboard:", error);
        return res.status(200).json({
            cards: {
                totalAvaliados: 0,
                totalAprovados: 0,
                totalReprovados: 0,
                taxaAprovacao: "0.00%",
                taxaReprovacao: "0.00%"
            },
            graficoPizzaGeral: [
                { value: 0, name: 'Aprovados' },
                { value: 0, name: 'Reprovados' }
            ],
            graficoDicotomico: {
                questoes: [
                    'Condução segura do ciclo\n(Uso do EPI)', 
                    'Tratamento adequado de Não\nConformidade (Stop & Call)'
                ],
                acertos: [0, 0],
                erros: [0, 0]
            },
            graficoGradual: {
                eixoX: ['DISCIPLINA OPERACIONAL', 'MONTAGEM CORRETA', 'ORGANIZAÇÃO DO POSTO', 'ACOMPANHAMENTO', 'RESILIÊNCIA'],
                nota1: [0, 0, 0, 0, 0],
                nota2: [0, 0, 0, 0, 0],
                nota3: [0, 0, 0, 0, 0],
                nota4: [0, 0, 0, 0, 0]
            },
            tabelaCandidatos: [],
            graficoMotivosReprovacao: []
        });
    }
    

}