import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/services/Banco";
import { RowDataPacket } from "mysql2";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import nodemailer from 'nodemailer';
import { Global } from "@/services/Global";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'GET'){
        const {
            email,
            password,
            action
        } = req.query;

        if(action=="validarEmailAtual"){
            try {
                const [rows_user] = await pool.query<RowDataPacket[]>(`
                        SELECT
                            n_id_pessoa
                        FROM
                            pessoa
                        WHERE
                            s_email_pessoa=?;
                    `,[email]
                )
                if (rows_user.length > 0) {
                    res.status(200).json({message:"E-Mail Existe"})
                } else {
                    res.status(401).json({message:"E-Mail Não Existe"})
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else{
            res.status(401).json({message:"Unauthorized"})
        }
    }else if(req.method === 'POST'){
        const {
            email,
            password,
            action
        } = req.body;
        
        if(action=="login"){
            try {
                const [rows_user] = await pool.query<RowDataPacket[]>(`
                        SELECT
                            n_id_pessoa,
                            n_id_tipoPessoa
                        FROM
                            pessoa
                        WHERE
                            s_email_pessoa=? AND s_senha_pessoa=?;
                    `,[email, password]
                )
                if (rows_user.length > 0) {
                    const user = rows_user[0]
                    Global.n_id_pessoa=user.n_id_pessoa
                    const token=jwt.sign(
                        {
                            id:user.n_id_pessoa,
                            email:user.s_email_pessoa,
                            nome:user.s_nome_pessoa
                        },
                        process.env.JWT_SECRET as string,
                        {expiresIn:'8h'}
                    )
                    const serialized=serialize('auth_token', token, {
                        httpOnly:true,
                        secure:process.env.NODE_ENV === 'production',
                        sameSite:'strict',
                        maxAge:60*60*8, //8 horas
                        path:'/' // Disponível em todas as rotas
                    })
                    res.setHeader('Set-Cookie', serialized)
                    res.status(200).json({
                        message:"Login realizado com sucesso",
                        data:rows_user[0]
                    })
                } else {
                    res.status(401).json({message:"Unauthorized"})
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if(action=="validarEmailAtual"){
            try {
                const [rows_user] = await pool.query<RowDataPacket[]>(`
                        SELECT
                            n_id_pessoa
                        FROM
                            pessoa
                        WHERE
                            s_email_pessoa=?;
                    `,[email]
                )
                if (rows_user.length > 0) {
                    res.status(200).json({message:"E-Mail Existe"})
                } else {
                    res.status(401).json({message:"E-Mail Não Existe"})
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if(action=="validarSenha"){
            try {
                const [rows_user] = await pool.query<RowDataPacket[]>(`
                        SELECT
                            n_id_pessoa
                        FROM
                            pessoa
                        WHERE
                            s_email_pessoa=? AND s_senha_pessoa=?;
                    `,[email,password]
                )
                if (rows_user.length > 0) {
                    res.status(200).json({message:"E-Mail Existe"})
                } else {
                    res.status(401).json({message:"E-Mail Não Existe"})
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else{
            res.status(401).json({message:"Unauthorized"})
        }
    }else if(req.method === 'PUT'){
        const {
            email,
            password,
            action
        } = req.body;
        
        if(action=="trocarSenha"){
            try {
                await pool.query<RowDataPacket[]>(`
                        UPDATE pessoa
                        SET s_senha_pessoa=?
                        WHERE s_email_pessoa=?;
                    `,[password, email]
                )
                res.status(200).json({message:"Senha trocada com sucesso"})
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    }else{
        res.status(405).json({message:"Method Not Allowed"})
    }
}