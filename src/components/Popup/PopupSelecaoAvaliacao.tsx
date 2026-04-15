import styles from "@/styles/PopupSelecaoAvaliacao.module.css";
import Load from "../Load/Load";
import Image from "next/image";
import { tAvaliacao } from "@/utils/Types";
import { useState, useEffect } from "react";

interface popupProps {
    comandoFechar: () => void;
    setFiltroAvaliacoes: (f: string) => void;
}

export default function PopupSelecaoAvaliacao(props: popupProps) {
    const [avaliacoes, setAvaliacoes] = useState<tAvaliacao[]>([]);
    const [avaliacoesFiltradas, setAvaliacoesFiltradas] = useState<tAvaliacao[]>([]);
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<tAvaliacao | null>(null);
    const [load, setLoad] = useState(false);

    // Estados para os filtros
    const [filtroNome, setFiltroNome] = useState("");
    const [filtroDtIni, setFiltroDtIni] = useState("");
    const [filtroDtFim, setFiltroDtFim] = useState("");

    useEffect(() => {
        obterAvaliacoes();
    }, []);

    // =========================================================================
    // NOVO: useEffect "Vigia" os filtros e aplica dinamicamente a cada digitação
    // =========================================================================
    useEffect(() => {
        let resultado = [...avaliacoes];

        // Filtro Dinâmico por Nome
        if (filtroNome.trim() !== "") {
            resultado = resultado.filter(a => 
                a.s_nome_avaliacao.toLowerCase().includes(filtroNome.toLowerCase())
            );
        }

        // Filtro Dinâmico por Data Inicial
        if (filtroDtIni !== "") {
            const dataIniTimestamp = new Date(filtroDtIni).getTime();
            resultado = resultado.filter(a => 
                new Date(a.dt_data_avaliacao).getTime() >= dataIniTimestamp
            );
        }

        // Filtro Dinâmico por Data Final
        if (filtroDtFim !== "") {
            const dataFimTimestamp = new Date(filtroDtFim).getTime();
            resultado = resultado.filter(a => 
                new Date(a.dt_data_avaliacao).getTime() <= dataFimTimestamp
            );
        }

        setAvaliacoesFiltradas(resultado);
        // Não resetamos a seleção aqui para não irritar o usuário caso ele digite depois de selecionar
    }, [filtroNome, filtroDtIni, filtroDtFim, avaliacoes]); 
    // ^ Esse array de dependências faz a mágica acontecer!

    const obterAvaliacoes = async () => {
        setLoad(true);
        try {
            const endpoint = `/api/apiAvaliacao?action=getAvaliacoes`;
            const response = await fetch(endpoint);
            const data = await response.json();
            
            setAvaliacoes(data);
            setAvaliacoesFiltradas(data);
        } catch (error) {
            console.error("Erro ao obter avaliações:", error);
        } finally {
            setLoad(false);
        }
    };

    const selecionar = () => {
        if (!avaliacaoSelecionada) {
            alert("Selecione uma avaliação na lista primeiro.");
            return;
        }
        const filtro = avaliacaoSelecionada.s_nome_avaliacao || "";
        props.setFiltroAvaliacoes(filtro);
        props.comandoFechar();
    };

    const limparFiltros = () => {
        setFiltroNome("");
        setFiltroDtIni("");
        setFiltroDtFim("");
        setAvaliacoesFiltradas(avaliacoes);
    }

    return (
        <>
            {load && <Load />}
            <div className={styles.popup}>
                <div className={styles.popup_conteudo}>
                    <div className={styles.popup_conteudo_titulo}>
                        Pesquisar Avaliações
                    </div>
                    <div className={styles.popup_conteudo_corpo}>
                        <div className={styles.popup_conteudo_filtros}>
                            <div className={styles.popup_conteudo_filtroArea_100}>
                                <div className={styles.popup_conteudo_filtroArea_field}>
                                    <label htmlFor="nome">Avaliação:</label>
                                    <input 
                                        id="nome" 
                                        type="text" 
                                        value={filtroNome} 
                                        onChange={(e) => setFiltroNome(e.target.value)} 
                                        placeholder="Digite para filtrar..."
                                    />
                                </div>
                            </div>
                            <div className={styles.popup_conteudo_filtroArea_100}>
                                <div className={styles.popup_conteudo_filtroArea_field}>
                                    <label htmlFor="dtini">Data Ini:</label>
                                    <input 
                                        id="dtini" 
                                        type="datetime-local" 
                                        value={filtroDtIni} 
                                        onChange={(e) => setFiltroDtIni(e.target.value)} 
                                    />
                                </div>
                                <div className={styles.popup_conteudo_filtroArea_field}>
                                    <label htmlFor="dtfim">Data Fim</label>
                                    <input 
                                        id="dtfim" 
                                        type="datetime-local" 
                                        value={filtroDtFim} 
                                        onChange={(e) => setFiltroDtFim(e.target.value)} 
                                    />
                                </div>
                            </div>
                            <div className={styles.popup_conteudo_filtroArea}>
                                <div className={styles.popup_conteudo_filtroArea_field}>
                                    <label>&nbsp;</label>
                                    {/* Botão mantido para visual, mas a pesquisa já é instantânea */}
                                    <button type="button" title="limpar Filtros" className={styles.btnPesquisa} onClick={()=>limparFiltros()}>
                                        <Image src='/assets/icons/search_off_w.svg' alt="Pesquisar" width={20} height={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.lista}>
                            <div className={styles.lista_titulos}>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c1}`}>ID</div>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c2}`}>Avaliação</div>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c3}`}>Data</div>
                            </div>
                            <div className={styles.lista_dados}>
                                {avaliacoesFiltradas.length > 0 ? (
                                    avaliacoesFiltradas.map((avaliacao) => (
                                        <div 
                                            key={avaliacao.n_id_avaliacao} 
                                            className={`${styles.lista_dados_linha} ${avaliacaoSelecionada?.n_id_avaliacao === avaliacao.n_id_avaliacao ? styles.lista_dado_selecionado : ""}`} 
                                            onClick={() => setAvaliacaoSelecionada(avaliacao)}
                                        >
                                            <div className={`${styles.lista_dado_c1}`}>{avaliacao.n_id_avaliacao}</div>
                                            <div className={`${styles.lista_dado_c2}`}>{avaliacao.s_nome_avaliacao}</div>
                                            <div className={`${styles.lista_dado_c3}`}>{new Date(avaliacao.dt_data_avaliacao).toLocaleString('pt-BR')}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: "15px", color: "#666" }}>Nenhuma avaliação encontrada.</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.popup_conteudo_rodape}>
                        <button title="Fechar" className={styles.popup_btn} onClick={() => props.comandoFechar()}>
                            Fechar
                        </button>
                        <button title="Selecionar" className={styles.popup_btn} onClick={selecionar}>
                            Selecionar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}