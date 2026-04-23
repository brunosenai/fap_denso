import styles from "@/styles/PopupTrazerCandidato.module.css";
import Load from "../Load/Load";
import Image from "next/image";
import { tTrazerCandidato, tAvaliacao } from "@/utils/Types";
import { useState, useEffect } from "react";
import { formatDateToText } from "@/utils/Utils";

interface popupProps {
    setMostrarTelaFrazerCandidato: (b: boolean) => void;
    avaliacaoSelecionada: number;
    trazerCandidato: (c: number, avnova: number) => void;
}

export default function PopupTrazerCandidato(props: popupProps) {
    const [candidatos, setCandidatos] = useState<tTrazerCandidato[]>([]);
    const [candidatosFiltrados, setCandidatosFiltrados] = useState<tTrazerCandidato[]>([]);
    const [candidatoSelecionado, setCandidatoSelecionado] = useState<tTrazerCandidato | null>(null);
    const [avaliacoes, setAvaliacoes] = useState<tAvaliacao[]>([]);
    
    // Mudei o nome para 'filtroAvaliacao' para não conflitar com a 'props.avaliacaoSelecionada'
    const [filtroAvaliacao, setFiltroAvaliacao] = useState<number>(-1); 
    const [filtroNome, setFiltroNome] = useState("");
    const [load, setLoad] = useState(false);

    useEffect(() => {
        if(props.avaliacaoSelecionada == -1)
            props.setMostrarTelaFrazerCandidato(false)
        else
            obterDadosIniciais();
    }, []);

    const obterDadosIniciais = async () => {
        setLoad(true);
        try {
            const endpoint = `/api/apiCandidato?action=getTrazerCandidato&n_id_avaliacao=${props.avaliacaoSelecionada}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
            const response = await fetch(endpoint);
            const data = await response.json();
            setCandidatos(data.candidatos || data); // Ajuste caso a API retorne o array direto ou dentro de um objeto
            setCandidatosFiltrados(data.candidatos || data);
            
            // Se a API também devolver a lista de turmas para o select
            if(data.avaliacoes) {
                setAvaliacoes(data.avaliacoes);
            }
        } catch (error) {
            console.error("Erro ao obter candidatos:", error);
        } finally {
            setLoad(false);
        }
    };

    const selecionar = (c: tTrazerCandidato) => {
        setCandidatoSelecionado(c);
        console.log(c);
    };

    // =========================================================================
    // MAGIA DOS FILTROS COMBINADOS: Executa sempre que o Nome OU a Turma mudar
    // =========================================================================
    useEffect(() => {
        let resultado = candidatos;

        // 1. Aplica o filtro de Texto (se não estiver vazio)
        if (filtroNome.trim() !== "") {
            resultado = resultado.filter(c => 
                c.s_nome_candidato.toLowerCase().includes(filtroNome.toLowerCase())
            );
        }

        // 2. Aplica o filtro de Avaliação (se não for -1 "Todas")
        if (filtroAvaliacao !== -1) {
            resultado = resultado.filter(c => 
                c.n_id_avaliacao === filtroAvaliacao
            );
        }

        // Atualiza a lista na tela com o resultado dos dois filtros
        setCandidatosFiltrados(resultado);
        
        // Opcional: Desmarca o candidato se ele sumir da lista por causa do filtro
        if (candidatoSelecionado && !resultado.some(c => c.n_id_candidato === candidatoSelecionado.n_id_candidato)) {
            setCandidatoSelecionado(null);
        }
        
    }, [filtroNome, filtroAvaliacao, candidatos]); // <- As dependências que acionam este useEffect


    return (
        <>
            {load && <Load />}
            <div className={styles.popup}>
                <div className={styles.popup_conteudo}>
                    <div className={styles.popup_conteudo_titulo}>
                        Pesquisar Candidatos
                    </div>
                    <div className={styles.popup_conteudo_corpo}>
                        <div className={styles.popup_conteudo_filtros}>
                            <div className={styles.popup_conteudo_filtroArea_100}>
                                <div className={styles.popup_conteudo_filtroArea_field}>
                                    <label htmlFor="nome">Nome Candidato:</label>
                                    <input 
                                        id="nome" 
                                        type="text" 
                                        value={filtroNome} 
                                        onChange={(e) => setFiltroNome(e.target.value)} 
                                        placeholder="Digite para filtrar..."
                                    />
                                </div>
                                <div className={styles.popup_conteudo_filtroArea_field}>
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
                                </div>
                            </div>
                        </div>
                        <div className={styles.lista}>
                            <div className={styles.lista_titulos}>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c1}`}>ID</div>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c2}`}>Nome</div>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c3}`}>CPF</div>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c4}`}>Avaliação Original</div>
                            </div>
                            <div className={styles.lista_dados}>
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
                            </div>
                        </div>
                    </div>
                    <div className={styles.popup_conteudo_rodape}>
                        <button title="Fechar" className={styles.popup_btn} onClick={() => props.setMostrarTelaFrazerCandidato(false)}>
                            Fechar
                        </button>
                        <button 
                            title="Selecionar" 
                            className={styles.popup_btn} 
                            onClick={() => {
                                if(candidatoSelecionado) {
                                    props.trazerCandidato(candidatoSelecionado.n_id_candidato, candidatoSelecionado.n_id_avaliacao);
                                    props.setMostrarTelaFrazerCandidato(false);
                                } else {
                                    alert("Selecione um candidato na lista.");
                                }
                            }}
                        >
                            Trazer
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}