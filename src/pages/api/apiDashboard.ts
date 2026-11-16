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
        let filtroTabelaSql = "";
        let filtroComumSql = "";
        
        const paramsComuns: any[] = [];
        const limitSql = isExport === 'true' ? 10000 : 20; 
        const offsetSql = isExport === 'true' ? 0 : (Number(page) - 1) * 20;

        if (filter === 'aprovados') {
            filtroTabelaSql += " AND f.n_candidatopresente_fap = 1 AND f.n_resultado_fap <> 0";
        } else if (filter === 'reprovados') {
            filtroTabelaSql += " AND f.n_candidatopresente_fap = 1 AND f.n_resultado_fap = 0";
        } else if (filter === 'faltas') {
            filtroTabelaSql += " AND f.n_candidatopresente_fap = 0";
        } else if (filter === 'todos') {
            filtroTabelaSql += " AND f.n_candidatopresente_fap = 1";
        }

        if (dataInicio && dataFim) {
            filtroComumSql += " AND f.dt_date_fap BETWEEN ? AND ?";
            paramsComuns.push(`${dataInicio} 00:00:00`, `${dataFim} 23:59:59`);
        }

        if (avaliacao && avaliacao !== 'todas') {
            filtroComumSql += " AND f.n_id_avaliacao = ?";
            paramsComuns.push(avaliacao);
        }

        if (filtroSgtSge === 'SGT') {
            filtroComumSql += " AND f.dt_date_fap <= '2026-07-21 23:59:59'";
        } else if (filtroSgtSge === 'SGE') {
            filtroComumSql += " AND f.dt_date_fap >= '2026-07-22 00:00:00'";
        }

        // Lógica para descobrir a nota de corte real a partir das configurações dinâmicas
        const [configRows] = await pool.query<RowDataPacket[]>("SELECT j_config_fap FROM config LIMIT 1");
        let cutoff = 13;
        if (configRows.length > 0 && configRows[0].j_config_fap) {
            const configObj = typeof configRows[0].j_config_fap === 'string' ? JSON.parse(configRows[0].j_config_fap) : configRows[0].j_config_fap;
            let notaDeCorte = configObj.notaDeCorte || 13;
            let maxNota = 0;
            if (configObj.questoes && Array.isArray(configObj.questoes)) {
                configObj.questoes.filter((q: any) => q.habilitada).forEach((q: any) => {
                    if (q.tipo === 'num') maxNota += 4 * q.peso;
                    else if (q.tipo === 'sn') maxNota += 1 * q.peso;
                });
            } else {
                maxNota = 22; 
            }
            if (notaDeCorte > maxNota) {
                cutoff = (notaDeCorte / 100) * maxNota; // transforma em porcentagem (ex: 70 -> 15.4)
            } else {
                cutoff = notaDeCorte; // absoluto (ex: 15)
            }
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
                    total_faltas,
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
                        SUM(CASE WHEN n_candidatopresente_fap = 1 THEN 1 ELSE 0 END) AS total_avaliados,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_resultado_fap <> 0 THEN 1 ELSE 0 END) AS total_aprovados,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_resultado_fap = 0 THEN 1 ELSE 0 END) AS total_reprovados,
                        SUM(CASE WHEN n_candidatopresente_fap = 0 THEN 1 ELSE 0 END) AS total_faltas,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 THEN apenas_dicotomica ELSE 0 END) AS reprovado_apenas_dicotomica,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 THEN apenas_gradual ELSE 0 END) AS reprovado_apenas_gradual,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 THEN ambas ELSE 0 END) AS reprovado_pelas_duas,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q6_fap = 1 THEN 1 ELSE 0 END) AS acertos_q6,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q7_fap = 1 THEN 1 ELSE 0 END) AS acertos_q7,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q8_fap = 1 THEN 1 ELSE 0 END) AS q8_p1,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q8_fap = 2 THEN 1 ELSE 0 END) AS q8_p2,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q8_fap = 3 THEN 1 ELSE 0 END) AS q8_p3,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q8_fap = 4 THEN 1 ELSE 0 END) AS q8_p4,

                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q9_fap = 1 THEN 1 ELSE 0 END) AS q9_p1,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q9_fap = 2 THEN 1 ELSE 0 END) AS q9_p2,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q9_fap = 3 THEN 1 ELSE 0 END) AS q9_p3,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q9_fap = 4 THEN 1 ELSE 0 END) AS q9_p4,

                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q10_fap = 1 THEN 1 ELSE 0 END) AS q10_p1,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q10_fap = 2 THEN 1 ELSE 0 END) AS q10_p2,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q10_fap = 3 THEN 1 ELSE 0 END) AS q10_p3,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q10_fap = 4 THEN 1 ELSE 0 END) AS q10_p4,

                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q11_fap = 1 THEN 1 ELSE 0 END) AS q11_p1,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q11_fap = 2 THEN 1 ELSE 0 END) AS q11_p2,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q11_fap = 3 THEN 1 ELSE 0 END) AS q11_p3,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q11_fap = 4 THEN 1 ELSE 0 END) AS q11_p4,

                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q12_fap = 1 THEN 1 ELSE 0 END) AS q12_p1,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q12_fap = 2 THEN 1 ELSE 0 END) AS q12_p2,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q12_fap = 3 THEN 1 ELSE 0 END) AS q12_p3,
                        SUM(CASE WHEN n_candidatopresente_fap = 1 AND n_q12_fap = 4 THEN 1 ELSE 0 END) AS q12_p4
                    FROM (
                        SELECT 
                            f.*,
                            CASE WHEN (f.n_nota_fap < ${cutoff}) AND (f.n_q6_fap = 1 AND f.n_q7_fap = 1) THEN 1 ELSE 0 END AS apenas_gradual,
                            CASE WHEN (f.n_q6_fap = 0 OR f.n_q7_fap = 0) AND (f.n_nota_fap >= ${cutoff}) THEN 1 ELSE 0 END AS apenas_dicotomica,
                            CASE WHEN (f.n_q6_fap = 0 OR f.n_q7_fap = 0) AND (f.n_nota_fap < ${cutoff}) THEN 1 ELSE 0 END AS ambas
                        FROM 
                            fap f
                        WHERE 
                            f.n_status_fap <> 0 ${filtroComumSql}
                    ) AS sub
                ) AS resumo_interno
            ) AS resumo_final;  
        `, paramsComuns);


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
                f.n_candidatopresente_fap AS presente,
                f.s_relatorio_fap AS relatorio
            FROM fap f
            INNER JOIN candidato c ON f.n_id_candidato = c.n_id_candidato
            INNER JOIN avaliacao a ON f.n_id_avaliacao = a.n_id_avaliacao
            LEFT JOIN pessoa p ON f.n_id_pessoa = p.n_id_pessoa
            WHERE f.n_status_fap <> 0 ${filtroComumSql} ${filtroTabelaSql}
            ORDER BY f.dt_date_fap DESC
            LIMIT ? OFFSET ?
        `, [...paramsComuns, limitSql, offsetSql]);

        const totalAvaliados = Number(rows[0]?.total_avaliados || 0);
        const totalAprovados = Number(rows[0]?.total_aprovados || 0);
        const totalReprovados = Number(rows[0]?.total_reprovados || 0);
        const totalFaltas = Number(rows[0]?.total_faltas || 0);
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
                totalFaltas: totalFaltas,
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
                totalFaltas: 0,
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