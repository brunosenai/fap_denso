import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/services/Banco"
import { ResultSetHeader } from 'mysql2';

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

    if(req.method !== "POST") {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    if (!req.body) {
        return res.status(400).json({ message: 'Corpo da requisição vazio' });
    }

    const { data, action } = req.body;

    if (!data) {
        return res.status(400).json({ message: 'Dados incompletos ou formato inválido' });
    }


    if(action == 'cadastroLote'){

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ message: 'Para lote, data deve ser um array preenchido' });
        }

        try {
            const valoresLote = data.map((c: any) => [c.nome, c.cpf, c.email]);

            await pool.query<ResultSetHeader>(
                'INSERT INTO candidato (s_nome_candidato, s_cpf_candidato, s_email_candidato) VALUES ?',
                [valoresLote]
            );

            return res.status(201).json({ message: `${data.length} candidatos inseridos!` });
        } catch (err: any) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Erro: CPF/Email duplicado no lote.' });
            return res.status(500).json({ message: 'Erro no servidor' });
        }
    }else if(action == "cadastroCandidatoAvaliacao"){

        if (!data.id_avaliacao || !data.idsCandidatos || !Array.isArray(data.idsCandidatos)) {
            return res.status(400).json({ message: 'Dados incompletos ou formato inválido.' });
        }

        try{
            const valorCandidatosAvaliacao = data.idsCandidatos.map((idCand: number) => [
                data.id_avaliacao,
                idCand
            ]);

            await pool.query<ResultSetHeader>(
                'INSERT INTO avaCanFap (n_id_avaliacao, n_id_candidato) VALUES ?',
                [valorCandidatosAvaliacao]
            );

            return res.status(201).json({ message: 'Candidatos vinculados com sucesso!' });
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Erro ao registrar no banco de dados.' });
        }

    }else{

        try {

        await pool.query<ResultSetHeader>(`
                INSERT INTO
                    candidato (s_nome_candidato, s_cpf_candidato, s_email_candidato)
                VALUES
                    (?, ?, ?)
                `,[data.nome, data.cpf, data.email]
            )

            return res.status(200).json({})
        }catch(err: any){
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'CPF ou Email já cadastrado.' });
            }
            return res.status(500).json({ message: 'Erro no servidor.' });
        }
    }

}