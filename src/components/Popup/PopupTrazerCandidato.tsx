import styles from "@/styles/PopupTrazerCandidato.module.css";
import Load from "../Load/Load";
import Image from "next/image";
import { tTrazerCandidato } from "@/utils/Types";
import { useState, useEffect } from "react";
import { formatDateToText } from "@/utils/Utils";

interface popupProps {
    setMostrarTelaFrazerCandidato: (b: boolean) => void;
    avaliacaoSelecionada:number
    trazerCandidato:(c:number,avnova:number)=>void;
}

export default function PopupTrazerCandidato(props: popupProps) {
    const [candidatos, setCandidatos] = useState<tTrazerCandidato[]>([]);
    const [candidatosFiltrados, setCandidatosFiltrados] = useState<tTrazerCandidato[]>([]);
    const [candidatoSelecionado, setCandidatoSelecionado] = useState<tTrazerCandidato | null>(null);
    const [load,setLoad] = useState(false);
    const [filtroNome, setFiltroNome] = useState("");

    useEffect(() => {
        if(props.avaliacaoSelecionada == -1)
            props.setMostrarTelaFrazerCandidato(false)
        else
            obterCandidatos();
    }, []);

    const obterCandidatos = async () => {
        setLoad(true);
        try {
            const endpoint = `/api/apiCandidato?action=getTrazerCandidato&n_id_avaliacao=${props.avaliacaoSelecionada}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
            const response = await fetch(endpoint);
            const data = await response.json();
            setCandidatos(data);
            setCandidatosFiltrados(data);
        } catch (error) {
            console.error("Erro ao obter candidatos:", error);
        } finally {
            setLoad(false);
        }
    };

    const selecionar = (c:tTrazerCandidato) => {
        setCandidatoSelecionado(c)
        console.log(c)
    };

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
                            </div>
                        </div>
                        <div className={styles.lista}>
                            <div className={styles.lista_titulos}>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c1}`}>ID</div>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c2}`}>Nome</div>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c3}`}>CPF</div>
                                <div className={`${styles.lista_titulo} ${styles.lista_titulo_c4}`}>Avaliação</div>
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
                                            <div className={`${styles.lista_dado_c4}`}>{formatDateToText(c.dt_data_avaliacao)}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: "15px", color: "#666" }}>Nenhuma avaliação encontrada.</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.popup_conteudo_rodape}>
                        <button title="Fechar" className={styles.popup_btn} onClick={() => props.setMostrarTelaFrazerCandidato(false)}>
                            Fechar
                        </button>
                        <button title="Selecionar" className={styles.popup_btn} onClick={() => {props.trazerCandidato(candidatoSelecionado?.n_id_candidato ?? -1,candidatoSelecionado?.n_id_avaliacao ?? -1);props.setMostrarTelaFrazerCandidato(false)}}>
                            Trazer
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}