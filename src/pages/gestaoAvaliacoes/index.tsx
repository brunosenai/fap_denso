import styles from "@/styles/GestaoAvaliacoes.module.css";
import Topo from "@/components/Topo/Topo";
import Load from "@/components/Load/Load";
import Image from "next/image";
import PopupListaCandidatos from "@/components/Popup/PopupListaCandidatos";
import {tAvaliacao, tCandidato} from "@/components/Types/Types";
import { useState, useEffect } from "react";

export default function GestaoAvaliacoes() {
    const [avaliacoes,setAvaliacoes] = useState<tAvaliacao[]>([]);
    const [avaliacao,setAvaliacao] = useState<tAvaliacao>({
        n_id_avaliacao:0,
        s_nome_avaliacao:"",
        dt_data_avaliacao:"",
    });
    const [avaliacoesFiltradas,setAvaliacoesFiltradas] = useState<tAvaliacao[]>([]);
    const [candidatos,setCandidatos] = useState<tCandidato[]>([]);
    const [load,setLoad]=useState(false);
    const [showCandidatos,setShowCandidatos]=useState(false);

    useEffect(() => {
        setLoad(true);
        const idAvaliador=localStorage.getItem("n_id_pessoa")
        const endpoint=`/api/apiAvaliacao?action=getAvaliacoesPorAvaliador&n_id_pessoa=${idAvaliador}`
        fetch(endpoint)
        .then(res => res.json())
        .then(data => {
            setAvaliacoes(data);
            setAvaliacoesFiltradas(data);
        })
        .catch(err => console.error("Erro ao buscar avaliações: ", err))
        .finally(() => setLoad(false));
    },[])

    const getCandidatos=async (n_id_avaliacao:number) => {
        setLoad(true);
        setAvaliacao(avaliacoes.find(a => a.n_id_avaliacao===n_id_avaliacao) as tAvaliacao);
        const endpoint=`/api/apiCandidato?action=getCandidatosPorAvaliacao&n_id_avaliacao=${n_id_avaliacao}`
        fetch(endpoint)
        .then(res => res.json())
        .then(data => {
            setCandidatos(data);
            setShowCandidatos(true)
        })
        .catch(err => console.error("Erro ao buscar candidatos: ", err))
        .finally(() => setLoad(false));
    }

    const comandoAbrirAvaliacao=async(n_id_candidato:number) => {
        console.log(`Abrir avaliação do candidato ${n_id_candidato}`);
        // setShowCandidatos(false)
    }

    return (
        <div className={styles.page}>
            {load&&<Load/>}
            {showCandidatos&&<PopupListaCandidatos comandoFechar={()=>{setShowCandidatos(false)}} listaCandidatos={candidatos} dadosAvaliacao={avaliacao} comandoAbrirAvaliacao={comandoAbrirAvaliacao}/>}
            <Topo titulo="Gestão de Valiações"/>
            <main className={styles.main}>
                <div className={styles.dadosAvaliador}>
                    <div className={styles.dadosAvaliador_col}>
                        <div className={styles.dadosAvaliador_field}>
                            <div className={styles.dadosAvaliador_field_label}>Nome: </div>
                            <div className={styles.dadosAvaliador_field_input}>Bruno Pinho Campos</div>
                        </div>
                        <div className={styles.dadosAvaliador_field}>
                            <div className={styles.dadosAvaliador_field_label}>CPF: </div>
                            <div className={styles.dadosAvaliador_field_input}>000.000.000-00</div>
                        </div>
                    </div>
                    <div className={styles.dadosAvaliador_col}>
                        <div className={styles.dadosAvaliador_field}>
                            <div className={styles.dadosAvaliador_field_label}>Telefone: </div>
                            <div className={styles.dadosAvaliador_field_input}>(31)99999-9999</div>
                        </div>
                        <div className={styles.dadosAvaliador_field}>
                            <div className={styles.dadosAvaliador_field_label}>Email: </div>
                            <div className={styles.dadosAvaliador_field_input}>bpinho@fiemg.com.br</div>
                        </div>
                    </div>
                </div>
                <div className={styles.filtros}>
                    <div className={styles.filtros_col}>
                        <div className={styles.filtros_field}>
                            <label className={styles.filtros_field_label}>Data Início:</label>
                            <input type="date" title="dataini" className={styles.filtros_field_input}/>
                        </div>
                        <div className={styles.filtros_field}>
                            <label className={styles.filtros_field_label}>Data Fim:</label>
                            <input type="date" title="dataini" className={styles.filtros_field_input}/>
                        </div>
                    </div>
                    <div className={styles.filtros_col}>
                        <div className={styles.filtros_field}>
                            <label className={styles.filtros_field_label}>Nome Avaliação</label>
                            <input type="text" title="nomeava" className={styles.filtros_field_input}/>
                        </div>
                        <div className={styles.filtros_field_button}>
                            <button className={styles.filtros_button}>Pesquisar</button>
                        </div>                        
                    </div>
                </div>
                <div className={styles.lista}>
                    <div className={styles.lista_titulos}>
                        <div className={styles.lista_titulo_c1}>id</div>
                        <div className={styles.lista_titulo_c2}>nome</div>
                        <div className={styles.lista_titulo_c3}>data</div>
                        <div className={styles.lista_titulo_c4}>
                            <Image src="/assets/icons/candidatos_w.svg" alt="Ver Candidatos" width={20} height={-1} className={styles.lista_dado_c4_icon}/>
                        </div>
                    </div>
                    <div className={styles.lista_dados}>
                        {avaliacoesFiltradas.length>0&&avaliacoesFiltradas.map((a,i) => (
                            <div className={styles.lista_dados_linha} key={i}>
                                <div className={styles.lista_dado_c1}>{a.n_id_avaliacao}</div>
                                <div className={styles.lista_dado_c2}>{a.s_nome_avaliacao}</div>
                                <div className={styles.lista_dado_c3}>{a.dt_data_avaliacao}</div>
                                <div className={styles.lista_dado_c4}>
                                    <Image src="/assets/icons/candidatos.svg" alt="Ver Candidatos" width={20} height={-1} className={styles.lista_dado_c4_icon} onClick={()=>getCandidatos(a.n_id_avaliacao)}/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}