import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/DB/db"
import { ResultSetHeader } from 'mysql2';

//export const config = {
//    api: {
//        bodyParser: false,
//    },
//};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== "POST") {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    if (!req.body) {
        return res.status(400).json({ message: 'Corpo da requisição vazio' });
    }

    const { nome_avaliacao, dt_avaliacao, candidatos } = req.body;

    if (!nome_avaliacao || !candidatos || !Array.isArray(candidatos)) {
        return res.status(400).json({ message: 'Dados incompletos ou formato inválido' });
    }
    
    const connection = await pool.getConnection();

    try {
       
        await connection.beginTransaction();

        const [resAval] = await connection.query<ResultSetHeader>(
            'INSERT INTO avaliacao (s_nome_avaliacao, dt_data_avaliacao) VALUES (?, ?)',
            [nome_avaliacao, dt_avaliacao]
        );
        const idAvaliacao = resAval.insertId;

        const cpfsParaVerificar = candidatos.map((c: any) => c.cpf);

        const [existentes]: any = await connection.query(
            'SELECT n_id_candidato, s_cpf_candidato FROM candidato WHERE s_cpf_candidato IN (?)',
            [cpfsParaVerificar]
        );

        const mapaExistentes = new Map(existentes.map((r: any) => [r.s_cpf_candidato, r.n_id_candidato]));

        const candidatosNovos = candidatos.filter((c: any) => !mapaExistentes.has(c.cpf));
        const idsCandidatosFinal: number[] = Array.from(mapaExistentes.values()) as number[];;

        if (candidatosNovos.length > 0) {
            const valoresNovos = candidatosNovos.map((c: any) => [c.nome, c.cpf, c.email]);
            
            const [insCands] = await connection.query<ResultSetHeader>(
                'INSERT INTO candidato (s_nome_candidato, s_cpf_candidato, s_email_candidato) VALUES ?',
                [valoresNovos]
            );

            for (let i = 0; i < insCands.affectedRows; i++) {
                idsCandidatosFinal.push(insCands.insertId + i);
            }
        }

        const valoresJuncao = idsCandidatosFinal.map(idCand => [
            idAvaliacao,
            idCand
        ]);


        await connection.query(
            'INSERT INTO avaCanFap (n_id_avaliacao, n_id_candidato) VALUES ?',
            [valoresJuncao]
        );

        await connection.commit();

        return res.status(200).json({})
    }catch(err){
        await connection.rollback();
        throw err;
    }finally{
        connection.release();
    }

}