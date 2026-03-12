import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "../../../services/banco"
import { ResultSetHeader } from 'mysql2';

//export const config = {
//    api: {
//        bodyParser: false,
//    },
//};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const apiKey = req.headers['x-api-key'];

    //if (!apiKey || apiKey !== process.env.API_KEY) {
    //   return res.status(401).json({ message: 'Acesso não autorizado: API Key inválida ou ausente.' });
    //}

    if(req.method !== "POST") {
        return res.status(405).json({ message: 'Método não permitido' });
    }
    

    if (!req.body) {
        return res.status(400).json({ message: 'Corpo da requisição vazio' });
    }

    const { data } = req.body;


    const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [resFap] = await connection.query<ResultSetHeader>(
                `INSERT INTO fap (
                    dt_date_fap, n_q6_fap, n_q7_fap, n_q8_fap, n_q9_fap, 
                    n_q10_fap, n_q11_fap, n_q12_fap, s_q13_fap, s_q14_fap, 
                    s_q15_fap, s_q16_fap
                ) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.q6, data.q7, data.q8, data.q9, 
                    data.q10, data.q11, data.q12, data.q13, 
                    data.q14, data.q15, data.q16
                ]
            );

            const novoIdFap = resFap.insertId;

            // 2. Atualizar a tabela 'avaCanFap' com os resultados e o novo ID da FAP
            await connection.query(
                `UPDATE avaCanFap SET 
                    n_id_fap = ?, 
                    n_nota_avaCanFap = ?, 
                    n_resultado_avaCanFap = ?,
                    n_posto1_avaCanFap = ?, 
                    n_posto2_avaCanFap = ?, 
                    n_posto3_avaCanFap = ?,
                    n_posto4_avaCanFap = ?, 
                    n_posto5_avaCanFap = ?, 
                    n_posto6_avaCanFap = ?
                WHERE n_id_avaliacao = ? AND n_id_candidato = ?`,
                [
                    novoIdFap, 
                    data.nota, 
                    data.resultado,
                    data.posto1, data.posto2, data.posto3,
                    data.posto4, data.posto5, data.posto6,
                    data.id_avaliacao, 
                    data.id_candidato
                ]
            );

            await connection.commit();
            return res.status(200).json({ message: 'Formulário e avaliação salvos com sucesso!' });

        } catch (err) {
            await connection.rollback();
            console.error(err);
            return res.status(500).json({ message: 'Erro ao processar conclusão da avaliação.' });
        } finally {
            connection.release();
        }

}