import styles from "@/styles/PopupMovimentacaoAvancada.module.css";
import Load from "../Load/Load";
import Image from "next/image";
import { tCandidato, tAvaliacao, tCandidatoFap, tCandidatoAvaliacao } from "@/utils/Types";
import { useState, useEffect } from "react";
import PopupMessage, { PopupMessageProps } from "./PopupMessage";
import { formatDateToText } from "@/utils/Utils";
import { pop } from "echarts/types/src/component/dataZoom/history.js";

interface popupProps {
    comandoFechar: (b: boolean) => void;
}

export default function PopupMovimentacaoAvancada(props: popupProps) {
    const [candidatos, setCandidatos] = useState<tCandidatoAvaliacao[]>([]);
    const [avaliacoes, setAvaliacoes] = useState<tAvaliacao[]>([]);
    
    const [candidatosAvaliacao1, setCandidatosAvaliacao1] = useState<tCandidato[]>([]);
    const [candidatosAvaliacao2, setCandidatosAvaliacao2] = useState<tCandidato[]>([]);
    
    const [candidatosFiltrados1, setCandidatosFiltrados1] = useState<tCandidatoAvaliacao[]>([]);
    const [candidatosFiltrados2, setCandidatosFiltrados2] = useState<tCandidatoAvaliacao[]>([]);

    const [avaliacoesFiltradas1, setAvaliacoesFiltradas1] = useState<tAvaliacao[]>([]);
    const [avaliacoesFiltradas2, setAvaliacoesFiltradas2] = useState<tAvaliacao[]>([]);

    const [filtroCandidato1, setFiltroCandidato1] = useState<string>('');
    const [filtroCandidato2, setFiltroCandidato2] = useState<string>('');

    const [filtroAvaliacao1, setFiltroAvaliacao1] = useState<string>('');
    const [filtroAvaliacao2, setFiltroAvaliacao2] = useState<string>('');

    const [avaliacaoSelecionada1, setAvaliacaoSelecionada1] = useState<tAvaliacao | null>(null);
    const [avaliacaoSelecionada2, setAvaliacaoSelecionada2] = useState<tAvaliacao | null>(null);

    const [candidatoSelecionado1, setCandidatoSelecionado1] = useState<tCandidato | null>(null);
    const [candidatoSelecionado2, setCandidatoSelecionado2] = useState<tCandidato | null>(null);
  
    const [popupMessage, setPopupMessage] = useState<PopupMessageProps | null>(null);
    const [showPopupMessage, setShowPopupMessage] = useState(false);
    const [load, setLoad] = useState(false);

    useEffect(() => {
        obterDadosIniciais();
    }, []);

    // =======================================================================
    // FILTROS DA ÁREA 1 (CIMA)
    // =======================================================================
    useEffect(() => {
        let resultado = avaliacoes;

        // Filtro de Nome
        if (filtroCandidato1.trim() !== '') {
            resultado = resultado.filter(a => 
                (a.s_nome_avaliacao || "").toLowerCase().includes(filtroCandidato1.toLowerCase())
            );
        }

        // Filtro Blindado de Data
        if (filtroAvaliacao1.trim() !== '') {
            resultado = resultado.filter(a => {
                if (!a.dt_data_avaliacao) return false;
                
                const strData = String(a.dt_data_avaliacao);
                
                // Tenta extrair formato de banco de dados (ex: "2030-12-09T00:00:00" -> "2030-12-09")
                const matchISO = strData.match(/(\d{4}-\d{2}-\d{2})/);
                if (matchISO && matchISO[1] === filtroAvaliacao1) return true;

                // Tenta extrair formato brasileiro (ex: "09/12/2030 00:00" -> inverte para "2030-12-09")
                const matchBR = strData.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                if (matchBR) {
                    const dataInvertida = `${matchBR[3]}-${matchBR[2]}-${matchBR[1]}`;
                    if (dataInvertida === filtroAvaliacao1) return true;
                }

                return false; // Se a data não bater com nada, oculta o registro
            });
        }

        setAvaliacoesFiltradas1(resultado);

        // Limpeza de segurança se o item selecionado sumir
        if (avaliacaoSelecionada1 && !resultado.some(a => a.n_id_avaliacao === avaliacaoSelecionada1.n_id_avaliacao)) {
            setAvaliacaoSelecionada1(null);
            setCandidatosFiltrados1([]); 
            setCandidatoSelecionado1(null);
        }
    }, [filtroCandidato1, filtroAvaliacao1, avaliacoes]); 

    // =======================================================================
    // FILTROS DA ÁREA 2 (BAIXO)
    // =======================================================================
    useEffect(() => {
        let resultado = avaliacoes;

        // Filtro de Nome
        if (filtroCandidato2.trim() !== '') {
            resultado = resultado.filter(a => 
                (a.s_nome_avaliacao || "").toLowerCase().includes(filtroCandidato2.toLowerCase())
            );
        }

        // Filtro Blindado de Data
        if (filtroAvaliacao2.trim() !== '') {
            resultado = resultado.filter(a => {
                if (!a.dt_data_avaliacao) return false;
                
                const strData = String(a.dt_data_avaliacao);
                
                // Tenta extrair formato de banco de dados
                const matchISO = strData.match(/(\d{4}-\d{2}-\d{2})/);
                if (matchISO && matchISO[1] === filtroAvaliacao2) return true;

                // Tenta extrair formato brasileiro
                const matchBR = strData.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                if (matchBR) {
                    const dataInvertida = `${matchBR[3]}-${matchBR[2]}-${matchBR[1]}`;
                    if (dataInvertida === filtroAvaliacao2) return true;
                }

                return false;
            });
        }

        setAvaliacoesFiltradas2(resultado);

        // Limpeza de segurança se o item selecionado sumir
        if (avaliacaoSelecionada2 && !resultado.some(a => a.n_id_avaliacao === avaliacaoSelecionada2.n_id_avaliacao)) {
            setAvaliacaoSelecionada2(null);
            setCandidatosFiltrados2([]); 
            setCandidatoSelecionado2(null);
        }
    }, [filtroCandidato2, filtroAvaliacao2, avaliacoes]); 


    // =======================================================================
    // FUNÇÕES DE API E AÇÕES
    // =======================================================================
    const obterDadosIniciais = async () => {
        setLoad(true);
        try {
            const endpoint = `/api/apiMovimentacaoAvancada?action=getIni&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
            const response = await fetch(endpoint);
            const data = await response.json();
            setCandidatos(data.candidatos);
            setCandidatosFiltrados1(data.candidatos);
            setCandidatosFiltrados2(data.candidatos);
            setAvaliacoes(data.avaliacoes);
            setAvaliacoesFiltradas1(data.avaliacoes);
            setAvaliacoesFiltradas2(data.avaliacoes);
        } catch (error) {
            console.error("Erro ao obter dados iniciais:", error);
        } finally {
            setLoad(false);
        }
    };

    const obterCandidatosAvaliacao = async (origem: number, idAvaliacao: number, inverte: boolean) => {
        let av = 0;
        if (idAvaliacao > -1) {
            av = idAvaliacao;
        } else {
            av = origem == 1 ? avaliacaoSelecionada1?.n_id_avaliacao || 0 : avaliacaoSelecionada2?.n_id_avaliacao || 0;
        }
        
        setLoad(true);
        try {
            const endpoint = `/api/apiMovimentacaoAvancada?action=getCandidatosAvaliacao&apiKey=${process.env.NEXT_PUBLIC_API_KEY}&idAvaliacao=${av}`;
            const response = await fetch(endpoint);
            const data = await response.json();
            if (origem == 1) {
                inverte == true ? setCandidatosFiltrados2(data) : setCandidatosFiltrados1(data);
            } else if (origem == 2) {
                inverte == true ? setCandidatosFiltrados1(data) : setCandidatosFiltrados2(data);
            }
        } catch (error) {
            console.error("Erro ao obter candidatos da avaliação:", error);
        } finally {
            setLoad(false);
        }
    };

    const obterCandidatosAvaliacao1 = async (idAvaliacao: number) => {
        setLoad(true);
        try {
            const endpoint = `/api/apiMovimentacaoAvancada?action=getCandidatosAvaliacao&apiKey=${process.env.NEXT_PUBLIC_API_KEY}&idAvaliacao=${idAvaliacao}`;
            const response = await fetch(endpoint);
            const data = await response.json();
            setCandidatosFiltrados1(data);
        } catch (error) {
            console.error("Erro ao obter candidatos 1:", error);
        } finally {
            setLoad(false);
        }
    };
    
    const obterCandidatosAvaliacao2 = async (idAvaliacao: number) => {
        setLoad(true);
        try {
            const endpoint = `/api/apiMovimentacaoAvancada?action=getCandidatosAvaliacao&apiKey=${process.env.NEXT_PUBLIC_API_KEY}&idAvaliacao=${idAvaliacao}`;
            const response = await fetch(endpoint);
            const data = await response.json();
            setCandidatosFiltrados2(data);
        } catch (error) {
            console.error("Erro ao obter candidatos 2:", error);
        } finally {
            setLoad(false);
        }
    };

    const moverCandidatoParaAvaliacao_1to2 = async (idAvaliacao: number) => {
        if (candidatoSelecionado1 == null) {
            alert('Selecione um candidato na lista de cima para mover para a avaliação selecionada na lista de baixo.');
            return;
        }
        if (avaliacaoSelecionada2 == null) {
            alert('Selecione uma avaliação na lista de baixo para mover o candidato selecionado na lista de cima.');
            return;
        }
        try {
            setLoad(true);
            const endpoint = `/api/apiMovimentacaoAvancada`;
            const dados = {
                apiKey: process.env.NEXT_PUBLIC_API_KEY,
                action: "moverCandidato",
                idCandidato: candidatoSelecionado1?.n_id_candidato,
                idAvaliacaoCandidato: candidatoSelecionado1?.n_id_avaliacao,
                idNovaAvaliacao: avaliacaoSelecionada2?.n_id_avaliacao
            };
            const response = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });
            const data = await response.json();
            obterCandidatosAvaliacao2(idAvaliacao);
            obterCandidatosAvaliacao1(avaliacaoSelecionada1?.n_id_avaliacao || 0);
        } catch (error) {
            console.error("Erro ao mover candidato:", error);
        } finally {
            setLoad(false);
        }
    }

    const moverCandidatoParaAvaliacao_2to1 = async (idAvaliacao: number) => {
        if (candidatoSelecionado2 == null) {
            alert('Selecione um candidato na lista de baixo para mover para a avaliação selecionada na lista de cima.');
            return;
        }
        if (avaliacaoSelecionada1 == null) {
            alert('Selecione uma avaliação na lista de cima para mover o candidato selecionado na lista de baixo.');
            return;
        }
        try {
            setLoad(true);
            const endpoint = `/api/apiMovimentacaoAvancada`;
            const dados = {
                apiKey: process.env.NEXT_PUBLIC_API_KEY,
                action: "moverCandidato",
                idCandidato: candidatoSelecionado2?.n_id_candidato,
                idAvaliacaoCandidato: candidatoSelecionado2?.n_id_avaliacao,
                idNovaAvaliacao: avaliacaoSelecionada1?.n_id_avaliacao
            };
            const response = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });
            const data = await response.json();
            obterCandidatosAvaliacao1(idAvaliacao);
            obterCandidatosAvaliacao2(avaliacaoSelecionada2?.n_id_avaliacao || 0);
        } catch (error) {
            console.error("Erro ao mover candidato:", error);
        } finally {
            setLoad(false);
        }
    }    

    // =======================================================================
    // RENDERIZAÇÃO (JSX)
    // =======================================================================
    return (
        <>
            {load && <Load />}
            {showPopupMessage && <PopupMessage {...popupMessage!} />}
            <div className={styles.popup}>
                <div className={styles.popup_conteudo}>
                    <div className={styles.popup_conteudo_titulo}>
                        Movimentação Avançada de Candidatos
                    </div>
                    <div className={styles.popup_conteudo_corpo}>
                        
                        {/* ZONA 1: CIMA */}
                        <div className={styles.popup_conteudo_corpo_linha}>
                            <div className={styles.lista}>
                                
                                <div className={styles.lista_1}>
                                    <div className={styles.popup_conteudo_filtros}>
                                        <div className={styles.popup_conteudo_filtroArea_100}>
                                            <div className={styles.popup_conteudo_filtroArea_field}>
                                                <label htmlFor="nome1">Nome Avaliação:</label>
                                                <input 
                                                    id="nome1" 
                                                    type="text" 
                                                    value={filtroCandidato1} 
                                                    onChange={(e) => setFiltroCandidato1(e.target.value)} 
                                                    placeholder="Digite para filtrar..."
                                                />
                                            </div>
                                            <div className={styles.popup_conteudo_filtroArea_field}>
                                                <label htmlFor="dtAva1">Avaliação Data:</label>
                                                <input id="dtAva1" title='dtAva1' type="date" value={filtroAvaliacao1} onChange={(evt) => setFiltroAvaliacao1(evt.target.value)} />
                                            </div>
                                        </div>
                                    </div>                               
                                    <div className={styles.lista_titulos}>
                                        <div className={`${styles.lista_titulo} ${styles.lista_titulo_c1}`}>ID</div>
                                        <div className={`${styles.lista_titulo} ${styles.lista_titulo_c2}`}>Data Avaliação</div>
                                        <div className={`${styles.lista_titulo} ${styles.lista_titulo_c3}`}>Nome</div>
                                    </div>
                                    <div className={styles.lista_dados}>
                                        {avaliacoesFiltradas1.length > 0 ? (
                                            avaliacoesFiltradas1.map((a, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`${styles.lista_dados_linha} ${avaliacaoSelecionada1?.n_id_avaliacao === a.n_id_avaliacao ? styles.lista_dado_selecionado : ""}`} 
                                                    onClick={() => {obterCandidatosAvaliacao(1, a.n_id_avaliacao, false); setAvaliacaoSelecionada1(a)}}
                                                >
                                                    <div className={`${styles.lista_dado_c1}`}>{a.n_id_avaliacao}</div>
                                                    <div className={`${styles.lista_dado_c2}`}>{formatDateToText(a.dt_data_avaliacao)}</div>
                                                    <div className={`${styles.lista_dado_c3}`}>{a.s_nome_avaliacao || formatDateToText(a.dt_data_avaliacao)}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: "15px", color: "#666" }}>Nenhum candidato encontrado com estes filtros.</div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className={styles.lista_1}>
                                    <div className={styles.lista_titulos}>
                                        <div className={`${styles.lista_titulo} ${styles.lista_titulo_c1}`}>ID</div>
                                        <div className={`${styles.lista_titulo} ${styles.lista_titulo_c2}`}>Nome</div>
                                        <div className={`${styles.lista_titulo} ${styles.lista_titulo_c3}`}>CPF</div>
                                    </div>
                                    <div className={styles.lista_dados}>
                                        {candidatosFiltrados1.length > 0 ? (
                                            candidatosFiltrados1.map((c, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`${styles.lista_dados_linha} ${candidatoSelecionado1?.n_id_candidato === c.n_id_candidato ? styles.lista_dado_selecionado : ""}`} 
                                                    onClick={() => {setCandidatoSelecionado1(c)}}
                                                >
                                                    <div className={`${styles.lista_dado_c1}`}>{c.n_id_candidato}</div>
                                                    <div className={`${styles.lista_dado_c2}`}>{c.s_nome_candidato}</div>
                                                    <div className={`${styles.lista_dado_c3}`}>{c.s_cpf_candidato}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: "15px", color: "#666" }}>Nenhum candidato encontrado, selecione uma avaliação.</div>
                                        )}
                                    </div>
                                </div>                               
                            </div>

                            {/* ZONA CENTRAL: BOTÕES */}
                            <div className={styles.lista_semBordas_row}>
                                <button title="Mover para Baixo" className={styles.popup_btn_auto} onClick={() => {moverCandidatoParaAvaliacao_1to2(avaliacaoSelecionada2?.n_id_avaliacao || 0)}}>
                                    <Image src="/assets/icons/double_arrow_down_w.svg" alt="Mover para Avaliação" width={20} height={20} />
                                </button>
                                <button title="Mover para Cima" className={styles.popup_btn_auto} onClick={() => {moverCandidatoParaAvaliacao_2to1(avaliacaoSelecionada1?.n_id_avaliacao || 0)}}>
                                    <Image src="/assets/icons/double_arrow_up_w.svg" alt="Mover para Avaliação" width={20} height={20} />
                                </button>                                
                            </div>

                            {/* ZONA 2: BAIXO */}
                            <div className={styles.lista}>
                                <div className={styles.lista_1}>
                                    <div className={styles.popup_conteudo_filtros}>
                                        <div className={styles.popup_conteudo_filtroArea_100}>
                                            <div className={styles.popup_conteudo_filtroArea_field}>
                                                <label htmlFor="nome2">Nome Avaliação:</label>
                                                <input 
                                                    id="nome2" 
                                                    type="text" 
                                                    value={filtroCandidato2} 
                                                    onChange={(e) => setFiltroCandidato2(e.target.value)} 
                                                    placeholder="Digite para filtrar..."
                                                />
                                            </div>
                                            <div className={styles.popup_conteudo_filtroArea_field}>
                                                <label htmlFor="dtAva2">Avaliação Data:</label>
                                                <input id="dtAva2" title='dtAva2' type="date" value={filtroAvaliacao2} onChange={(evt) => setFiltroAvaliacao2(evt.target.value)} />
                                            </div>
                                        </div>
                                    </div>                               
                                    <div className={styles.lista_titulos}>
                                        <div className={`${styles.lista_titulo} ${styles.lista_titulo_c1}`}>ID</div>
                                        <div className={`${styles.lista_titulo} ${styles.lista_titulo_c2}`}>Data Avaliação</div>
                                        <div className={`${styles.lista_titulo} ${styles.lista_titulo_c3}`}>Nome</div>
                                    </div>
                                    <div className={styles.lista_dados}>
                                        {avaliacoesFiltradas2.length > 0 ? (
                                            avaliacoesFiltradas2.map((a, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`${styles.lista_dados_linha} ${avaliacaoSelecionada2?.n_id_avaliacao === a.n_id_avaliacao ? styles.lista_dado_selecionado : ""}`} 
                                                    onClick={() => {obterCandidatosAvaliacao(2, a.n_id_avaliacao, false); setAvaliacaoSelecionada2(a)}}
                                                >
                                                    <div className={`${styles.lista_dado_c1}`}>{a.n_id_avaliacao}</div>
                                                    <div className={`${styles.lista_dado_c2}`}>{formatDateToText(a.dt_data_avaliacao)}</div>
                                                    <div className={`${styles.lista_dado_c3}`}>{a.s_nome_avaliacao || formatDateToText(a.dt_data_avaliacao)}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: "15px", color: "#666" }}>Nenhum candidato encontrado com estes filtros.</div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className={styles.lista_1}>
                                    <div className={styles.lista_titulos}>
                                        <div className={`${styles.lista_titulo} ${styles.lista_titulo_c1}`}>ID</div>
                                        <div className={`${styles.lista_titulo} ${styles.lista_titulo_c2}`}>Nome</div>
                                        <div className={`${styles.lista_titulo} ${styles.lista_titulo_c3}`}>CPF</div>
                                    </div>
                                    <div className={styles.lista_dados}>
                                        {candidatosFiltrados2.length > 0 ? (
                                            candidatosFiltrados2.map((c, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`${styles.lista_dados_linha} ${candidatoSelecionado2?.n_id_candidato === c.n_id_candidato ? styles.lista_dado_selecionado : ""}`} 
                                                    onClick={() => {setCandidatoSelecionado2(c)}}
                                                >
                                                    <div className={`${styles.lista_dado_c1}`}>{c.n_id_candidato}</div>
                                                    <div className={`${styles.lista_dado_c2}`}>{c.s_nome_candidato}</div>
                                                    <div className={`${styles.lista_dado_c3}`}>{c.s_cpf_candidato}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: "15px", color: "#666" }}>Nenhum candidato encontrado, selecione uma avaliação.</div>
                                        )}
                                    </div>
                                </div>                               
                            </div>
                        </div>                        
                    </div>
                    
                    <div className={styles.popup_conteudo_rodape}>
                        <button title="Fechar" className={styles.popup_btn} onClick={() => props.comandoFechar(false)}>
                            Fechar
                        </button>
                        <button 
                            title="Selecionar" 
                            className={styles.popup_btn} 
                            onClick={() => {
                            }}
                        >
                            Movimentar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}