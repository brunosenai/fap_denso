import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/services/Banco"
import { ResultSetHeader } from 'mysql2';

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
    if(req.method !== "POST") {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    if (!req.body) {
        return res.status(400).json({ message: 'Corpo da requisição vazio' });
    }

    const { data } = req.body;

    if (!data) {
        return res.status(400).json({ message: 'Dados incompletos ou formato inválido' });
    }

    try {

        await pool.query<ResultSetHeader>(`
            INSERT INTO
                pessoa (n_id_tipoPessoa, s_nome_pessoa, s_cpf_pessoa, s_telefone_pessoa, s_email_pessoa, s_senha_pessoa)
            VALUES
                (?, ?, ?, ?, ?, ?)
            `,[data.tipo, data.nome, data.cpf, data.telefone, data.email, data.senha]
        )

        return res.status(200).json({})
    }catch(err: any){
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'CPF ou Email já cadastrado.' });
        }
        return res.status(500).json({ message: 'Erro no servidor.' });
    }

}