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
            // PASSO 1: CADASTRAR OU OBTER O CANDIDATO
            // =========================================================================
            // Tenta inserir o candidato. Se o CPF já existir (s_cpf_candidato é UNIQUE), 
            // o IGNORE evita que o MySQL dê erro e apenas pula a inserção.
            await pool.query<ResultSetHeader>(
                `INSERT IGNORE INTO candidato (s_nome_candidato, s_cpf_candidato, s_email_candidato) VALUES (?, ?, ?)`,
                [c.nome, c.cpf, c.email]
            );

            // Agora precisamos resgatar o ID do candidato (seja o recém-criado ou o que já existia)
            const [resCandidato] = await pool.query<RowDataPacket[]>(
                `SELECT n_id_candidato FROM candidato WHERE s_cpf_candidato = ?`,
                [c.cpf]
            );
            
            // Se por algum motivo bizarro não achou, pula para o próximo registro
            if (resCandidato.length === 0) continue; 
            const idCandidato = resCandidato[0].n_id_candidato;


            // =========================================================================
            // PASSO 2: CRIAR OU OBTER A AVALIAÇÃO
            // =========================================================================
            // Monta o formato DATETIME do MySQL (YYYY-MM-DD HH:MM:SS)
            let combinedDateTime = null;
            if (c.data && c.hora) {
                combinedDateTime = `${c.data} ${c.hora}`; 
            } else if (c.data) {
                combinedDateTime = `${c.data} 00:00:00`; // Caso venha sem hora
            }

            // Define o título: Usa o que veio no CSV. Se vier vazio, concatena data e hora.
            let tituloAvaliacao = c.titulo_avaliacao;
            if (!tituloAvaliacao || tituloAvaliacao.trim() === '') {
                tituloAvaliacao = combinedDateTime ? combinedDateTime : `Avaliação do CPF ${c.cpf}`; 
            }

            let idAvaliacao = null;

            if (combinedDateTime) {
                // Verifica se já existe uma avaliação idêntica
                const [resAvExistente] = await pool.query<RowDataPacket[]>(
                    `SELECT n_id_avaliacao FROM avaliacao WHERE dt_data_avaliacao = ? AND s_nome_avaliacao = ?`,
                    [combinedDateTime, tituloAvaliacao]
                );

                if (resAvExistente.length > 0) {
                    // Avaliação já existe, pega o ID dela
                    idAvaliacao = resAvExistente[0].n_id_avaliacao;
                } else {
                    // Avaliação não existe, vamos criar
                    const [resNovaAv] = await pool.query<ResultSetHeader>(
                        `INSERT INTO avaliacao (s_nome_avaliacao, dt_data_avaliacao, n_status_avaliacao) VALUES (?, ?, 0)`,
                        [tituloAvaliacao, combinedDateTime]
                    );
                    idAvaliacao = resNovaAv.insertId; // Pega o ID gerado pelo AUTO_INCREMENT
                }
            }


            // =========================================================================
            // PASSO 3: RELACIONAR NA TABELA FAP (FICHA DE AVALIAÇÃO PESSOAL)
            // =========================================================================
            // A PK da FAP é (n_id_avaliacao, n_id_candidato). O INSERT IGNORE garante que 
            // se o relacionamento já existir (ex: você importou a planilha 2x), ele não duplica.
            if (idAvaliacao && idCandidato) {
                await pool.query<ResultSetHeader>(
                    `INSERT IGNORE INTO fap (n_id_avaliacao, n_id_candidato, dt_date_fap) VALUES (?, ?, ?)`,
                    [idAvaliacao, idCandidato, combinedDateTime]
                );
            }
        }

        return res.status(200).json({ message: 'Importação e relacionamentos concluídos com sucesso!' });

    } catch (error) {
        console.error("Erro na importação:", error);
        return res.status(500).json({ error: 'Erro interno ao processar a importação' });
    }
}