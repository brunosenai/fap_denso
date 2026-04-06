import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/services/Banco"
import nodemailer from 'nodemailer';
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

    if(req.method === 'GET'){
        const {
            action,
        } = req.query

        if(action == "getPessoas"){
            try {
                const [rows_cell] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        n_id_pessoa,
                        s_nome_pessoa,
                        s_email_pessoa,
                        s_telefone_pessoa
                    FROM
                        pessoa
                    ORDER BY
                        s_nome_pessoa DESC;
                    `,[]
                )
                res.status(200).json(rows_cell)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    }else if(req.method === 'POST'){
        const { n_id_tipoPessoa, s_nome_pessoa, s_cpf_pessoa, s_email_pessoa, s_telefone_pessoa } = req.body;
        
        const [rows_pessoa]=await pool.query<RowDataPacket[]>(`
            SELECT
                s_nome_pessoa
            FROM
                pessoa
            WHERE
                s_email_pessoa=?;
        `,[s_email_pessoa]
        )

        if(rows_pessoa.length>0){
            return res.status(400).json({ message: 'Já existe um cadastro com este e-mail.' });
        }

        const gerarNovaSenhaAleatoria = () => {
            let senha:string[] = [];
            const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (let i = 0; i < 6; i++) {
                const indice = Math.floor(Math.random() * caracteres.length);
                senha[i] = caracteres.charAt(indice);
            }
            return senha.join('');
        }

        const senha=gerarNovaSenhaAleatoria()

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        const emailEmpresa = process.env.EMAIL_DESTINO_EMPRESA;
        const info = await transporter.sendMail({
            from: `"Sistema FAP" <${process.env.SMTP_USER}>`, 
            to: emailEmpresa, // <-- Envia para o e-mail fixo da empresa
            subject: 'Cadastro realizado com sucesso', 
            text: `Olá ${s_nome_pessoa}! Seu cadastro foi realizado e sua senha temporária é: ${senha}. No seu primeiro acesso você pode trocar sua senha.`, 
            html: `<p>Olá ${s_nome_pessoa}!</p><p>Seu cadastro foi realizado e sua senha temporária é: <b>${senha}</b>. No seu primeiro acesso você pode trocar sua senha.</p>`, 
        });

        try {
            await pool.query<ResultSetHeader>(`
                INSERT INTO
                    pessoa (n_id_tipoPessoa, s_nome_pessoa, s_cpf_pessoa, s_email_pessoa, s_telefone_pessoa, s_senha_pessoa)
                VALUES
                    (?,?,?,?,?,?);
            `,[n_id_tipoPessoa, s_nome_pessoa, s_cpf_pessoa, s_email_pessoa, s_telefone_pessoa, senha]
            )
            return res.status(200).json({ 
                message: 'Candidato cadastrado com sucesso!',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message:"Internal Server Error: erro 500"})
        }
    }else if(req.method === 'PUT'){
        const { id_pessoa, id_avaliacao, idsCandidatos } = req.body;

        if (!id_pessoa || !id_avaliacao || !idsCandidatos || !Array.isArray(idsCandidatos)) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        try {
            await pool.query<ResultSetHeader>(`
                UPDATE 
                    avaCanFap
                SET 
                    n_id_pessoa = ?
                WHERE 
                    n_id_avaliacao = ? 
                    AND n_id_candidato IN (?);
            `,[id_pessoa, id_avaliacao, idsCandidatos]
            )

            return res.status(200).json({ 
            message: 'Candidatos vinculados à pessoa com sucesso!',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message:"Internal Server Error: erro 500"})
        }
    }
    

}