import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/services/Banco"
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const apiKey = req.headers['x-api-key'];

    if(req.method === 'GET'){
        const {
            action,
        } = req.query

        if(action == "getConfis"){
            try {
                const [rows] = await pool.query<RowDataPacket[]>(`
                    SELECT
                        *
                    FROM
                        config
                    `,[]
                )
                res.status(200).json(rows)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    }else if(req.method === 'DELETE'){
        const {
            action,
        } = req.body;
        if(action == "getConfis"){
            try {
                
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    }else if(req.method === 'POST'){
        const {
            action,
        } = req.body;
        if(action == "getConfis"){
            try {
                
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }
    }else if(req.method === 'PUT'){
        const {
            action,
            n_emailDestino_config
        } = req.body;
        if(action == "updateConfig"){
            try {
                const [rows] = await pool.query<RowDataPacket[]>(`
                    UPDATE
                        config
                    SET
                        n_emailDestino_config=?;
                    `,[n_emailDestino_config]
                )
                res.status(200).json(rows)
            } catch (error) {
                console.error(error);
                res.status(500).json({message:"Internal Server Error: erro 500"})
            }
        }       
    }    
}