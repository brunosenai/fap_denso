import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { formatDateToText, formatarCPF } from '@/utils/Utils'; // Ajuste o caminho se necessário
import Head from 'next/head';

// Tipagem local para organizar os dados
interface tPresencaData {
    n_id_avaliacao: number;
    s_nome_avaliacao: string;
    dt_data_avaliacao: string;
    candidatos: {
        n_id_candidato: number;
        s_nome_candidato: string;
        s_cpf_candidato: string;
        s_email_candidato: string;
    }[];
}

export default function ImprimirPresenca() {
    const router = useRouter();
    const { ids } = router.query;
    const [turmas, setTurmas] = useState<tPresencaData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ids) return;

        const buscarDados = async () => {
            try {
                const res = await fetch(`/api/apiAvaliacao?action=getListaPresenca&ids=${ids}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`);
                const data = await res.json();

                // 🛡️ BLINDAGEM: Verifica se 'data' é realmente um Array antes de usar o reduce
                if (!Array.isArray(data)) {
                    console.error("A API não devolveu uma lista. Veja o que chegou:", data);
                    setLoading(false);
                    return; // Para a execução aqui para não quebrar a tela
                }

                // Agrupa o resultado plano (flat) do SQL por Avaliação (Turma)
                const agrupado = data.reduce((acc: any, curr: any) => {
                    if (!acc[curr.n_id_avaliacao]) {
                        acc[curr.n_id_avaliacao] = {
                            n_id_avaliacao: curr.n_id_avaliacao,
                            s_nome_avaliacao: curr.s_nome_avaliacao,
                            dt_data_avaliacao: curr.dt_data_avaliacao,
                            candidatos: []
                        };
                    }
                    acc[curr.n_id_avaliacao].candidatos.push({
                        n_id_candidato: curr.n_id_candidato,
                        s_nome_candidato: curr.s_nome_candidato,
                        s_cpf_candidato: curr.s_cpf_candidato,
                        s_email_candidato: curr.s_email_candidato
                    });
                    return acc;
                }, {});

                setTurmas(Object.values(agrupado));
                setLoading(false);

                // Espera o React renderizar a tabela e aciona a impressão do navegador
                setTimeout(() => {
                    window.print();
                }, 800);

            } catch (error) {
                console.error("Erro ao buscar lista:", error);
                setLoading(false);
            }
        };

        buscarDados();
    }, [ids]);

    if (loading) {
        return <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>Gerando lista de presença...</div>;
    }

    if (turmas.length === 0) {
        return <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>Nenhum candidato encontrado nestas avaliações.</div>;
    }

    return (
        <>
            <Head>
                <title>Lista de Presença</title>
                <style>{`
                    /* ========================================================= */
                    /* CONFIGURAÇÕES DE IMPRESSÃO - MODO PAISAGEM                */
                    /* ========================================================= */
                    @media print {
                        @page { 
                            size: A4 landscape; /* FORÇA A ORIENTAÇÃO HORIZONTAL */
                            margin: 10mm; 
                        }
                        
                        .no-print { display: none !important; }

                        /* RESET CRÍTICO PARA QUEBRAS DE PÁGINA */
                        html, body, #__next, div {
                            display: block !important;
                            height: auto !important;
                            overflow: visible !important;
                        }

                        .quebra-pagina {
                            page-break-before: always !important;
                            break-before: page !important;
                        }
                    }

                    /* Estilos Visuais */
                    body { font-family: Arial, sans-serif; color: #333; background: #fff; }
                    
                    /* Ajuste da Tabela para modo Horizontal (mais larga) */
                    .table-container { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 15px; 
                        font-size: 13px; /* Aumentei um pouco a fonte já que temos mais espaço */
                    }
                    
                    .table-container th, .table-container td { border: 1px solid #444; padding: 10px; text-align: left; }
                    .table-container th { background-color: #f2f2f2; font-weight: bold; text-transform: uppercase; }
                    
                    .header-turma { margin-bottom: 20px; border-bottom: 2px solid #003366; padding-bottom: 10px; }
                    
                    /* Espaço maior para a assinatura na horizontal */
                    .signature-box { width: 350px; } 
                `}</style>
            </Head>

            <div style={{ padding: '20px' }}>
                <button className="no-print" onClick={() => window.print()} style={{ padding: '10px 20px', marginBottom: '20px', cursor: 'pointer' }}>
                    🖨️ Imprimir / Salvar PDF
                </button>

                {turmas.map((turma, index) => (
                    <div key={turma.n_id_avaliacao}>
                        
                        {/* O SEGREDO ESTÁ AQUI: 
                            Apenas adiciona a div de quebra se NÃO for a primeira turma.
                            Como é um elemento em bloco solto, o Chrome respeita sempre.
                        */}
                        {index > 0 && <div className="quebra-pagina"></div>}

                        <div style={{ marginBottom: '50px' }}>
                            <div className="header-turma">
                                <h2 style={{ margin: '0 0 5px 0', color: '#003366' }}>LISTA DE PRESENÇA - TESTE DE APTIDÃO PRÁTICA - STELLANTIS</h2>
                                <p style={{ margin: '2px 0', fontSize: '14px' }}><strong>Turma/Avaliação:</strong> {turma.s_nome_avaliacao}</p>
                                <p style={{ margin: '2px 0', fontSize: '14px' }}><strong>Data/Hora:</strong> {formatDateToText(turma.dt_data_avaliacao)}</p>
                                <p style={{ margin: '2px 0', fontSize: '14px' }}><strong>Instrutor/Avaliador:</strong> ___________________________________________________</p>
                            </div>

                            <table className="table-container">
                                <thead>
                                    <tr>
                                        <th style={{ width: '5%', textAlign: 'center' }}>ID</th>
                                        <th style={{ width: '30%' }}>NOME DO CANDIDATO</th>
                                        <th style={{ width: '15%' }}>CPF</th>
                                        <th style={{ width: '25%' }}>E-MAIL</th>
                                        <th className="signature-box">ASSINATURA DO CANDIDATO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {turma.candidatos.map((cand) => (
                                        <tr key={cand.n_id_candidato}>
                                            <td style={{ textAlign: 'center' }}>{cand.n_id_candidato}</td>
                                            <td>{cand.s_nome_candidato}</td>
                                            <td>{cand.s_cpf_candidato ? formatarCPF(cand.s_cpf_candidato) : '-'}</td>
                                            <td>{cand.s_email_candidato}</td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                    </div>
                ))}
            </div>
        </>
    );
}