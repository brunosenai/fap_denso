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
            dtini,
            dtfim
        } = req.query

        if (action === "getAnalyticsEntreDatas") {
            try {
                let di=dtini
                let df=dtfim
                if(!dtini) {
                    di='1970-01-01';
                }
                if(!dtfim) {
                    df='9999-12-31';
                }
                const [rows] = await pool.query<RowDataPacket[]>(`
                    WITH DadosAvaliacao AS (
                        SELECT 
                            f.n_resultado_fap,
                            -- Otimização: Já converte o sexo para 'm' ou 'f' logo na raiz para não repetir o código em baixo
                            LOWER(SUBSTRING(c.s_sexo_candidato, 1, 1)) AS sexo,
                            a.dt_data_avaliacao,
                            TIMESTAMPDIFF(YEAR, c.dt_nasc_candidato, a.dt_data_avaliacao) AS idade
                        FROM fap f
                        INNER JOIN avaliacao a ON f.n_id_avaliacao = a.n_id_avaliacao
                        INNER JOIN candidato c ON f.n_id_candidato = c.n_id_candidato
                        WHERE 
                            DATE(a.dt_data_avaliacao) BETWEEN ? AND ? 
                            AND f.n_candidatopresente_fap = 1 
                    )
                    SELECT 
                        -- ==============================================================================
                        -- 1. TAXA DE SUCESSO (Dos Homens e Mulheres avaliados, quantos % passaram?)
                        -- ==============================================================================
                        ROUND(
                            IFNULL(
                                SUM(CASE WHEN sexo = 'm' AND n_resultado_fap = 1 THEN 1 ELSE 0 END) * 100.0 / 
                                NULLIF(SUM(CASE WHEN sexo = 'm' THEN 1 ELSE 0 END), 0)
                            , 0)
                        , 1) AS taxa_sucesso_masculina,
                        
                        ROUND(
                            IFNULL(
                                SUM(CASE WHEN sexo = 'f' AND n_resultado_fap = 1 THEN 1 ELSE 0 END) * 100.0 / 
                                NULLIF(SUM(CASE WHEN sexo = 'f' THEN 1 ELSE 0 END), 0)
                            , 0)
                        , 1) AS taxa_sucesso_feminina,
                        
                        -- ==============================================================================
                        -- 2. COMPOSIÇÃO DOS APROVADOS (Do grupo de aprovados, quantos % são H e quantos M?)
                        -- *A soma destes dois vai dar 100%*
                        -- ==============================================================================
                        ROUND(
                            IFNULL(
                                SUM(CASE WHEN sexo = 'm' AND n_resultado_fap = 1 THEN 1 ELSE 0 END) * 100.0 / 
                                NULLIF(SUM(CASE WHEN n_resultado_fap = 1 THEN 1 ELSE 0 END), 0)
                            , 0)
                        , 1) AS composicao_aprovados_masculina,

                        ROUND(
                            IFNULL(
                                SUM(CASE WHEN sexo = 'f' AND n_resultado_fap = 1 THEN 1 ELSE 0 END) * 100.0 / 
                                NULLIF(SUM(CASE WHEN n_resultado_fap = 1 THEN 1 ELSE 0 END), 0)
                            , 0)
                        , 1) AS composicao_aprovados_feminina,
                        
                        -- ==============================================================================
                        -- 3. PERFIL VENCEDOR (Dia e Idade)
                        -- ==============================================================================
                        (SELECT 
                            CASE DAYOFWEEK(dt_data_avaliacao)
                                WHEN 1 THEN 'Domingo'
                                WHEN 2 THEN 'Segunda-feira'
                                WHEN 3 THEN 'Terça-feira'
                                WHEN 4 THEN 'Quarta-feira'
                                WHEN 5 THEN 'Quinta-feira'
                                WHEN 6 THEN 'Sexta-feira'
                                WHEN 7 THEN 'Sábado'
                            END AS dia
                         FROM DadosAvaliacao
                         WHERE dt_data_avaliacao IS NOT NULL AND n_resultado_fap = 1
                         GROUP BY dia
                         ORDER BY COUNT(*) DESC 
                         LIMIT 1) AS melhor_dia_semana,
                         
                        (SELECT 
                            CASE 
                                WHEN idade < 18 THEN 'Menor de 18 anos'
                                WHEN idade BETWEEN 18 AND 25 THEN '18 a 25 anos'
                                WHEN idade BETWEEN 26 AND 35 THEN '26 a 35 anos'
                                WHEN idade BETWEEN 36 AND 45 THEN '36 a 45 anos'
                                WHEN idade BETWEEN 46 AND 55 THEN '46 a 55 anos'
                                ELSE 'Mais de 55 anos'
                            END AS faixa
                         FROM DadosAvaliacao
                         WHERE idade IS NOT NULL AND n_resultado_fap = 1
                         GROUP BY faixa
                         ORDER BY COUNT(*) DESC 
                         LIMIT 1) AS melhor_faixa_etaria
                         
                    FROM DadosAvaliacao;
                `,[di,df])
                res.status(200).json(rows)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if (action === "getListaPresenca") {
            try {
                // Transforma a string "1,2,3" num array de números [1, 2, 3]
                const arrIds = String(req.query.ids).split(',').map(id => Number(id.trim()));

                const [rows] = await pool.query<RowDataPacket[]>(`
                    SELECT 
                        a.n_id_avaliacao, 
                        a.s_nome_avaliacao, 
                        a.dt_data_avaliacao,
                        c.n_id_candidato, 
                        c.s_nome_candidato, 
                        c.s_cpf_candidato, 
                        c.s_email_candidato
                    FROM avaliacao a
                    INNER JOIN fap f ON f.n_id_avaliacao = a.n_id_avaliacao
                    INNER JOIN candidato c ON c.n_id_candidato = f.n_id_candidato
                    WHERE a.n_id_avaliacao IN (?)
                    ORDER BY a.dt_data_avaliacao ASC, a.s_nome_avaliacao ASC, c.s_nome_candidato ASC;
                `, [arrIds]);

                res.status(200).json(rows);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error: erro 500" });
            }
        }else if(action == "getAvaliacoesEntreDatas"){
            try {
                let di=dtini
                let df=dtfim
                if(!dtini) {
                    di='1970-01-01';
                }
                if(!dtfim) {
                    df='9999-12-31';
                }
                const [rows] = await pool.query<RowDataPacket[]>(`
                    SELECT 
                        CAST(a.dt_data_avaliacao AS DATE) AS data_evento,
                        COUNT(f.n_id_avaliacao) AS total_avaliados,
                        SUM(CASE WHEN f.n_resultado_fap = 1 THEN 1 ELSE 0 END) AS total_aprovados,
                        SUM(CASE WHEN f.n_resultado_fap = 0 THEN 1 ELSE 0 END) AS total_reprovados
                    FROM fap f
                    INNER JOIN avaliacao a ON a.n_id_avaliacao = f.n_id_avaliacao
                    WHERE DATE(a.dt_data_avaliacao) BETWEEN ? AND ? 
                    AND f.n_candidatopresente_fap = 1 AND f.n_status_fap <> 0 
                    GROUP BY CAST(a.dt_data_avaliacao AS DATE)
                    ORDER BY data_evento;
                `,[di,df])
                res.status(200).json(rows)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if(action == "getAvaliacoesHojeEmDiante"){
            try {
                const [rows] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        *
                    FROM
                        avaliacao
                    WHERE
                        dt_data_avaliacao >= CURDATE() AND n_status_avaliacao=0
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
                            dt_data_avaliacao >= CURDATE() AND n_status_avaliacao<=1
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
        }else if(action == "getTotalAvaliacoesRealizadas"){
            try {
                const [rows] = await pool.query<RowDataPacket[]>(`
                    SELECT COUNT(*) as total 
                    FROM avaliacao 
                    WHERE dt_data_avaliacao < CURDATE() OR n_status_avaliacao > 1
                `);
                res.status(200).json({ total: rows[0].total });
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    } else if(req.method === 'DELETE'){
        const { id_avaliacao } = req.body;

        try {
            // 1. TRAVA DE SEGURANÇA: Verifica o status atual da avaliação
            const [rowsStatus] = await pool.query<RowDataPacket[]>(`
                SELECT n_status_avaliacao 
                FROM avaliacao 
                WHERE n_id_avaliacao = ?;
            `, [id_avaliacao]);

            // Se a avaliação não for encontrada ou o status for diferente de 0, bloqueia!
            if (rowsStatus.length === 0) {
                return res.status(404).json({ message: 'Avaliação não encontrada.' });
            }
            if (rowsStatus[0].n_status_avaliacao !== 0) {
                return res.status(400).json({ 
                    message: 'Operação bloqueada: Apenas avaliações com status "Não Realizada" (0) podem ser excluídas.' 
                });
            }

            // 2. EXCLUSÃO CASCATA: Primeiro os formulários (FAP) vinculados
            await pool.query(`
                DELETE FROM fap WHERE n_id_avaliacao = ?;
            `, [id_avaliacao]);

            // 3. EXCLUSÃO FINAL: A avaliação principal
            await pool.query(`
                DELETE FROM avaliacao WHERE n_id_avaliacao = ?;
            `, [id_avaliacao]);

            return res.status(200).json({ 
                message: 'Avaliação e todos os formulários vinculados foram excluídos com sucesso!',
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