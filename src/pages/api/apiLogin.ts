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
            action,
            codigo
        } = req.body;
        
        if(action=="login"){
            try {
                const [rows_user] = await pool.query<RowDataPacket[]>(`
                        SELECT
                            n_id_pessoa,
                            n_id_tipoPessoa,
                            s_nome_pessoa
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
                        // secure:process.env.NODE_ENV === 'production',
                        secure: false,
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
        }else if(action=="enviarCodigoRedefinicao"){
            try {
                const gerarCodigoRedef=()=>{
                    let cod:string[] = [];
                    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    for (let i = 0; i < 6; i++) {
                        const indice = Math.floor(Math.random() * caracteres.length);
                        cod[i] = caracteres.charAt(indice);
                    }
                    return cod.join('');
                }

                const v_codigo=gerarCodigoRedef()

                await pool.query<RowDataPacket[]>(`
                    UPDATE
                        pessoa
                    SET
                        s_codredef_pessoa=?
                    WHERE
                        s_email_pessoa=?;
                    `,[v_codigo,email]
                )

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
                    subject: 'Código de redefinição - FAP Stellantis', 
                    text: `Olá! Este é seu código de redefinição de senha: ${v_codigo}`, 
                    html: `<p>Olá!</p><p>Este é seu código de redefinição de senha: <b>${v_codigo}</b></p>`, 
                });
                return res.status(200).json({ message: 'E-mail de redefinição se senha enviado com sucesso!' });
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }else if(action=="validarCodigo"){
            try {
                const [rows_user] =await pool.query<RowDataPacket[]>(`
                    SELECT
                        n_id_pessoa
                    FROM
                        pessoa
                    WHERE
                        s_codredef_pessoa=? AND s_email_pessoa=?;
                    `,[codigo,email]
                )
                if(rows_user.length > 0){
                    return res.status(200).json({ message: 'E-mail de redefinição se senha enviado com sucesso!' });
                }else{
                    return res.status(401).json({ message: 'Código de redefinição inválido!' });
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
        }else if(action=="redefinirSenha"){
            try {
                await pool.query<RowDataPacket[]>(`
                    UPDATE pessoa
                    SET s_senha_pessoa=?, s_codredef_pessoa=null
                    WHERE s_email_pessoa=?;
                    `,[password, email]
                )
                return res.status(200).json({ message: 'E-mail de redefinição se senha enviado com sucesso!' });
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    }else{
        res.status(405).json({message:"Method Not Allowed"})
    }
}