import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/services/Banco";
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { candidatos } = req.body;

    if (!candidatos || !Array.isArray(candidatos) || candidatos.length === 0) {
        return res.status(400).json({ error: 'Nenhum dado válido encontrado no CSV' });
    }

    try {
        for (const c of candidatos) {
            // =========================================================================
            // PASSO 1: TRATAMENTO DO CANDIDATO (VERIFICAR POR CPF)
            // =========================================================================
            // O CPF é único. Usamos INSERT IGNORE para não duplicar.
            await pool.query<ResultSetHeader>(
                `INSERT IGNORE INTO candidato (s_nome_candidato, s_cpf_candidato, s_email_candidato) VALUES (?, ?, ?)`,
                [c.nome, c.cpf, c.email]
            );

            // Buscamos o ID do candidato existente ou recém-criado pelo CPF
            const [resCandidato] = await pool.query<RowDataPacket[]>(
                `SELECT n_id_candidato FROM candidato WHERE s_cpf_candidato = ?`,
                [c.cpf]
            );
            
            if (resCandidato.length === 0) continue; 
            const idCandidato = resCandidato[0].n_id_candidato;


            // =========================================================================
            // PASSO 2: TRATAMENTO DA AVALIAÇÃO (VERIFICAR POR NOME)
            // =========================================================================
            let combinedDateTime = null;
            if (c.data && c.hora) {
                combinedDateTime = `${c.data} ${c.hora}`; 
            } else if (c.data) {
                combinedDateTime = `${c.data} 00:00:00`;
            }

            // Define o título: prioriza o CSV, caso contrário usa a data/hora concatenada
            let tituloAvaliacao = c.titulo_avaliacao;
            if (!tituloAvaliacao || tituloAvaliacao.trim() === '') {
                tituloAvaliacao = combinedDateTime ? combinedDateTime : `Avaliação do CPF ${c.cpf}`; 
            }

            let idAvaliacao = null;

            // Verificação por Nome (conforme solicitado: se houver mesmo nome, usa a existente)
            const [resAvPorNome] = await pool.query<RowDataPacket[]>(
                `SELECT n_id_avaliacao FROM avaliacao WHERE s_nome_avaliacao = ?`,
                [tituloAvaliacao]
            );

            if (resAvPorNome.length > 0) {
                // Avaliação já existe com este nome, pegamos o ID dela
                idAvaliacao = resAvPorNome[0].n_id_avaliacao;
            } else {
                // Não existe avaliação com esse nome, então criamos uma nova
                const [resNovaAv] = await pool.query<ResultSetHeader>(
                    `INSERT INTO avaliacao (s_nome_avaliacao, dt_data_avaliacao, n_status_avaliacao) VALUES (?, ?, 0)`,
                    [tituloAvaliacao, combinedDateTime]
                );
                idAvaliacao = resNovaAv.insertId;
            }


            // =========================================================================
            // PASSO 3: RELACIONAR NA TABELA FAP (VINCULAR CANDIDATO À AVALIAÇÃO)
            // =========================================================================
            // O INSERT IGNORE aqui evita erro caso o candidato já esteja vinculado a esta avaliação específica
            if (idAvaliacao && idCandidato) {
                await pool.query<ResultSetHeader>(
                    `INSERT IGNORE INTO fap (n_id_avaliacao, n_id_candidato, dt_date_fap) VALUES (?, ?, ?)`,
                    [idAvaliacao, idCandidato, combinedDateTime]
                );
            }
        }

        return res.status(200).json({ message: 'Importação processada com sucesso!' });

    } catch (error) {
        console.error("Erro na importação:", error);
        return res.status(500).json({ error: 'Erro interno ao processar a importação' });
    }
}