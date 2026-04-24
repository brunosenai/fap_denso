import styles from "@/styles/PopupMudarCandidatoTurma.module.css";
import Load from "../Load/Load";
import Image from "next/image";
import { tTrazerCandidato, tAvaliacao, tCandidato } from "@/utils/Types";
import { useState, useEffect } from "react";
import { formatDateToText } from "@/utils/Utils";

interface popupProps {
    setMostrarTelaMudarCandidato: (b: boolean) => void;
    candidatoSelecionado: tCandidato | null;
    avaliacaoAtual: number;
    moverCandidato: (c: number, avnova: number) => void;
}

export default function PopupMudarCandidatoTurma(props: popupProps) {
    const [candidatos, setCandidatos] = useState<tTrazerCandidato[]>([]);
    const [avaliacoes, setAvaliacoes] = useState<tAvaliacao[]>([]);   
    const [avaliacaoNova, setAvaliacaoNova] = useState<number>(-1); 
    const [load, setLoad] = useState(false);

    useEffect(() => {
        obterAvaliacoes();
    }, []);

    const obterAvaliacoes = async () => {
        setLoad(true);
        try {
            const endpoint = `/api/apiAvaliacao?action=getAvaliacoesHojeEmDiante&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
            const response = await fetch(endpoint);
            const data = await response.json();
            const fixData = data.filter((av: tAvaliacao) => {
                return av.n_id_avaliacao != props.avaliacaoAtual;
            })
            setAvaliacoes(fixData);
        } catch (error) {
            console.error("Erro ao obter dados iniciais:", error);
        } finally {
            setLoad(false);
        }
    };

    const candidatosAvaliacao = async (idAva:number) => {
        setLoad(true);
        setAvaliacaoNova(idAva)
        try {
            const endpoint = `/api/apiCandidato?action=getCandidatosPorAvaliacao&n_id_avaliacao=${idAva}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
            const response = await fetch(endpoint);
            const data = await response.json();
            setCandidatos(data);
        } catch (error) {
            console.error("Erro ao obter dados iniciais:", error);
        } finally {
            setLoad(false);
        }
    };

    const moverCandidato=async()=>{
        setLoad(true)
        try {
          const endpoint = `/api/apiFap?action=getTrazerCandidado&n_id_candidato=${props.candidatoSelecionado?.n_id_candidato}&n_id_avaliacao_atual=${props.avaliacaoAtual}&n_id_avaliacao_nova=${avaliacaoNova}&&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
          fetch(endpoint, {
            method: "GET"
          })
          .then(res => res.json())
          .then(data => {
            setLoad(false)
            candidatosAvaliacao(avaliacaoNova)
          })
        } catch (e) {
          console.error(`Erro:${e}`)
        } finally {
          setLoad(false)
        }
      }

    return (
        <>
            {load && <Load />}
            <div className={styles.popup}>
                <div className={styles.popup_conteudo}>
                    <div className={styles.popup_conteudo_titulo}>
                        Mover Rapidamente o Candidato para outra Avaliação/Turma
                    </div>
                    <div className={styles.popup_conteudo_corpo}>
                        <div className={styles.popup_conteudo_topo}>
                            Candidato Seleiconado:<b>{props.candidatoSelecionado?.s_nome_candidato} - {props.candidatoSelecionado?.s_cpf_candidato}</b>
                        </div>
                        <div className={styles.popup_conteudo_filtros}>
                            <div className={styles.popup_conteudo_filtroArea_100}>
                                <div className={styles.popup_conteudo_filtroArea_field}>
                                    <label htmlFor="selecao">Avaliação (Destino):</label>
                                    <select 
                                        title="selAva" 
                                        name="selecao" 
                                        id="selecao" 
                                        onChange={(evt) => candidatosAvaliacao(Number(evt.target.value))}
                                    >
                                        <option value={-1}>Selecione a avaliação/turma</option>
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
                            </div>
                            <div className={styles.lista_dados}>
                                {
                                    candidatos.length > 0 && candidatos.map((c, i) => 
                                    <div className={styles.lista_dados_linha}>
                                        <div className={`${styles.lista_dado_c1}`}>{c.n_id_candidato}</div>
                                        <div className={`${styles.lista_dado_c2}`}>{c.s_nome_candidato}</div>
                                        <div className={`${styles.lista_dado_c3}`}>{c.s_cpf_candidato}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.popup_conteudo_rodape}>
                        <button title="Fechar" className={styles.popup_btn} onClick={() => props.setMostrarTelaMudarCandidato(false)}>
                            Fechar
                        </button>
                        <button 
                            title="Selecionar" 
                            className={styles.popup_btn} 
                            onClick={() => moverCandidato()}
                        >
                            Mover
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}