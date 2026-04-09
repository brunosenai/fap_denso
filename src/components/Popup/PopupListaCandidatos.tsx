import styles from "@/styles/PopupListaCandidatos.module.css";
import Image from "next/image";
import {tCandidato,tAvaliacao} from "@/components/Types/Types";

interface popupProps {
    dadosAvaliacao:tAvaliacao,
    listaCandidatos:tCandidato[],
    comandoFechar:()=>void
    comandoAbrirAvaliacao:(n_id_candidato:number)=>void
}

export default function PopupListaCandidatos(props:popupProps) {
    return (
        <div className={styles.popup}>
            <div className={styles.popup_conteudo}>
                <div className={styles.popup_conteudo_titulo}>
                    Lista de Candidatos
                </div>
                <div className={styles.popup_conteudo_corpo}>
                    <div><b>Avaliação:</b> {`${props.dadosAvaliacao.s_nome_avaliacao} | ${props.dadosAvaliacao.dt_data_avaliacao}`}</div>
                    <div className={styles.lista}>
                        <div className={styles.lista_titulos}>
                            <div className={styles.lista_titulo_c1}>id</div>
                            <div className={styles.lista_titulo_c2}>nome</div>
                            <div className={styles.lista_titulo_c3}>cpf</div>
                            <div className={styles.lista_titulo_c4}>email</div>
                            <div className={styles.lista_titulo_c5}></div>
                        </div>
                        <div className={styles.lista_dados}>
                            {props.listaCandidatos.length>0&&props.listaCandidatos.map((c:tCandidato, i:number)=>(
                                <div className={styles.lista_dados_linha}>
                                    <div className={styles.lista_dado_c1}>{c.n_id_candidato}</div>
                                    <div className={styles.lista_dado_c2}>{c.s_nome_candidato}</div>
                                    <div className={styles.lista_dado_c3}>{c.s_cpf_candidato}</div>
                                    <div className={styles.lista_dado_c4}>{c.s_email_candidato}</div>
                                    <div className={styles.lista_dado_c5}>
                                        <Image src="/assets/icons/report.svg" alt="ver avaliação" width={20} height={-1} onClick={()=>props.comandoAbrirAvaliacao(c.n_id_candidato)}/>
                                    </div>
                                </div>
                            ))}
                        </div>                        
                    </div>
                </div>
                <div className={styles.popup_conteudo_rodape}>
                    <button title="nao" className={styles.popup_btn} onClick={()=>props.comandoFechar()}>Fechar</button>
                </div>
            </div>
        </div>
    );
}