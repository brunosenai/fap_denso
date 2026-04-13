import styles from "@/styles/InfoAvaliacao.module.css"
import { tInfoAva } from "@/utils/Types";
import Image from "next/image";
import {formatDateToText} from  "@/utils/Utils"

export interface InfoAvaliacaoProps {
    comandoFechar: (f:boolean) => void;
    infoAva:tInfoAva | undefined;
}

export default function InfoAvaliacao(props:InfoAvaliacaoProps) {
    return (
        <>
            <div className={styles.infoAva}>
                <div className={styles.infoAva_conteudo}>
                    <div className={styles.infoAva_conteudo_titulo}style={{ position: 'relative' }}>
                        Informações sobre a avaliação
                    </div>
                    <div className={styles.infoAva_conteudo_corpo}>
                        <div className={styles.infoAva_conteudo_corpo_area}>
                            <h1>Informações da Avaliação</h1>
                            <div className={styles.infoAva_conteudo_corpo_area_linhas}>
                                <div className={styles.infoAva_conteudo_corpo_area_field_spaceBetween}>
                                    <div><span>Id:</span>{props.infoAva?.infoAvaliacao[0].n_id_avaliacao}</div>
                                    <div><span>Avaliação:</span>{props.infoAva?.infoAvaliacao[0].s_nome_avaliacao}</div>
                                    <div><span>Data:</span>{formatDateToText(props.infoAva?.infoAvaliacao[0].dt_data_avaliacao)}</div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.infoAva_conteudo_corpo_area}>
                            <h1>Avaliadores</h1>
                            <div className={styles.infoAva_conteudo_corpo_area_linhas}>
                                {props.infoAva?.infoAvaliadores.map((a, i) => (
                                    <div key={i} className={styles.infoAva_conteudo_corpo_area_field}>
                                        <div><span>Id:</span>{a.n_id_pessoa}</div>
                                        <div><span>Nome:</span>{a.s_nome_pessoa}</div>
                                    </div>                                
                                ))}
                            </div>
                        </div>
                        <div className={styles.infoAva_conteudo_corpo_area}>
                            <h1>Candidatos</h1>
                            <div className={styles.infoAva_conteudo_corpo_area_linhas}>
                                {props.infoAva?.infoCandidatos.map((c, i) => (
                                    <div key={i} className={styles.infoAva_conteudo_corpo_area_field_spaceBetween_3}>
                                        <div className={styles.infoAva_conteudo_corpo_area_field_spaceBetween_3_c1}><span>Id: </span>{c.n_id_candidato}</div>
                                        <div className={styles.infoAva_conteudo_corpo_area_field_spaceBetween_3_c2}><span>Nome: </span>{c.s_nome_candidato}</div>
                                        <div className={styles.infoAva_conteudo_corpo_area_field_spaceBetween_3_c3}><span>Status: </span><span className={`${c.n_resultado_fap == 0?styles.corReprovado:styles.corAprovado}`}>{c.n_resultado_fap == 0?'Reprovado':'Aprovado'}</span></div>
                                        <div className={styles.infoAva_conteudo_corpo_area_field_spaceBetween_3_c4}>
                                            <Image src='/assets/icons/edit_document.svg' alt='Editar Avaliação' width={20} height={-1}/>
                                        </div>
                                    </div>                                
                                ))}
                            </div>
                        </div>                        
                    </div>
                    <div className={styles.infoAva_conteudo_rodape}>
                        <button className={styles.infoAva_btn} onClick={()=>props.comandoFechar(false)}>fechar</button>
                    </div>
                </div>
            </div>
        </>
    );
}