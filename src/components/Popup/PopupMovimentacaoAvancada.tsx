import styles from "@/styles/PopupMovimentacaoAvancada.module.css";
import Load from "../Load/Load";
import Image from "next/image";
import { tCandidato, tAvaliacao } from "@/utils/Types";
import { useState, useEffect } from "react";
import { formatDateToText } from "@/utils/Utils";

interface popupProps {
    comandoFechar: (b:boolean) => void;
}

export default function PopupMovimentacaoAvancada(props: popupProps) {
    const [candidatos, setCandidatos] = useState<tAvaliacao[]>([]);
    const [candidatosFiltrados, setCandidatosFiltrados] = useState<tAvaliacao[]>([]);
    const [candidatoSelecionado, setCandidatoSelecionado] = useState<tAvaliacao | null>(null);
    const [avaliacoes, setAvaliacoes] = useState<tAvaliacao[]>([]);
    const [avaliacoesFiltradas, setAvaliacoesFiltradas] = useState<tAvaliacao[]>([]);
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<tAvaliacao | null>(null);   
    const [load, setLoad] = useState(false);

    useEffect(() => {
        obterDadosIniciais()
    }, []);

    const obterDadosIniciais = async () => {
        setLoad(true);
        try {
            const endpoint = `/api/apiMovimentacaoAvancada?action=getIni&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
            const response = await fetch(endpoint);
            const data = await response.json();
            setCandidatos(data.candidatos);
            setCandidatosFiltrados(data.candidatos);
            setAvaliacoes(data.avaliacoes);
            setAvaliacoesFiltradas(data.avaliacoes);
        } catch (error) {
            console.error("Erro ao obter candidatos:", error);
        } finally {
            setLoad(false);
        }
    };

    return (
        <>
            {load && <Load />}
            <div className={styles.popup}>
                <div className={styles.popup_conteudo}>
                    <div className={styles.popup_conteudo_titulo}>
                        Movimentação Avançada de Candidatos
                    </div>
                    <div className={styles.popup_conteudo_corpo}>
                        <div className={styles.popup_conteudo_filtros}>
                            <div className={styles.popup_conteudo_filtroArea_100}>
                                <h1>Recurso em Construção</h1>
                                {/* <div className={styles.popup_conteudo_filtroArea_field}>
                                    <label htmlFor="nome">Nome Candidato:</label>
                                    <input 
                                        id="nome" 
                                        type="text" 
                                        value={filtroNome} 
                                        onChange={(e) => setFiltroNome(e.target.value)} 
                                        placeholder="Digite para filtrar..."
                                    />
                                </div> */}
                                {/* <div className={styles.popup_conteudo_filtroArea_field}>
                                    <label htmlFor="selecao">Avaliação (Origem):</label>
                                    <select 
                                        title="selAva" 
                                        name="selecao" 
                                        id="selecao" 
                                        value={filtroAvaliacao}
                                        onChange={(evt) => setFiltroAvaliacao(Number(evt.target.value))}
                                    >
                                        <option value={-1}>Todas</option>
                                        {avaliacoes.length > 0 && avaliacoes.map((item, index) =>
                                            <option key={index} value={item.n_id_avaliacao}>{item.s_nome_avaliacao}</option>
                                        )}
                                    </select>
                                </div> */}
                            </div>
                        </div>
                        <div className={styles.lista}>
                            {/* <div className={styles.lista_titulos}>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c1}`}>ID</div>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c2}`}>Nome</div>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c3}`}>CPF</div>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c4}`}>Avaliação Original</div>
                            </div> */}
                            {/* <div className={styles.lista_dados}>
                                {candidatosFiltrados.length > 0 ? (
                                    candidatosFiltrados.map((c) => (
                                        <div 
                                            key={c.n_id_candidato} 
                                            className={`${styles.lista_dados_linha} ${candidatoSelecionado?.n_id_candidato === c.n_id_candidato ? styles.lista_dado_selecionado : ""}`} 
                                            onClick={() => selecionar(c)}
                                        >
                                            <div className={`${styles.lista_dado_c1}`}>{c.n_id_candidato}</div>
                                            <div className={`${styles.lista_dado_c2}`}>{c.s_nome_candidato}</div>
                                            <div className={`${styles.lista_dado_c3}`}>{c.s_cpf_candidato}</div>
                                            <div className={`${styles.lista_dado_c4}`}>{c.s_nome_avaliacao || formatDateToText(c.dt_data_avaliacao)}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: "15px", color: "#666" }}>Nenhum candidato encontrado com estes filtros.</div>
                                )}
                            </div> */}
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
                                // if(candidatoSelecionado) {
                                //     props.trazerCandidato(candidatoSelecionado.n_id_candidato, candidatoSelecionado.n_id_avaliacao);
                                //     props.setMostrarTelaFrazerCandidato(false);
                                // } else {
                                //     alert("Selecione um candidato na lista.");
                                // }
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