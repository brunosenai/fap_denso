import styles from "@/styles/InfoAvaliacao.module.css"
import { tInfoAva, tFap } from "@/utils/Types";
import Image from "next/image";
import {formatDateToText} from  "@/utils/Utils"
import EditarFapCandidato from "../EditarFapCandidato/EditarFapCandidato";
import Load from "../Load/Load";
import { useState } from "react";

export interface InfoAvaliacaoProps {
    comandoFechar: (f:boolean) => void;
    infoAva:tInfoAva|undefined;
}

export default function InfoAvaliacao(props:InfoAvaliacaoProps) {
    const [showEditarFapCandidato,setShowEditarFapCandidato]=useState<boolean>(false)
    const [fapCandidato,setFapCandidato]=useState<tFap>()
    const [idCandidato,setIdCandidato]=useState<number>(-1)
    const [idAvaliacao,setIdAvaliacao]=useState<number>(-1)
    const [load,setLoad]=useState(true)

    const getFapCandidato=async(idAvaliacao:number,idCandidato:number)=>{
        setIdAvaliacao(idAvaliacao)
        setIdCandidato(idCandidato)
        setLoad(true)
        const endpoint=`/api/apiFap?action=getInfoFapCandidato&n_id_avaliacao=${idAvaliacao}&n_id_candidato=${idCandidato}`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            setFapCandidato(res)
            setLoad(false)
            setShowEditarFapCandidato(true)
        })
        .finally(()=>{
            setLoad(false)
        })
    }

    const comandoSalvarFapCandidato=(q13:string,q14:string,q15:string,q16:string)=>{
        const endpoint=`/api/apiFap`
        fetch(endpoint,{
            method:"PUT",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify({
                action:"editarFapCandidato",
                n_id_avaliacao:idAvaliacao,
                n_id_candidato:idCandidato,
                s_q13_fap:q13,
                s_q14_fap:q14,
                s_q15_fap:q15,
                s_q16_fap:q16
            })
        })
        .then(res=>res.json())
        .then(res=>{
            setShowEditarFapCandidato(false)
        })
    }

    return (
        <>
            {showEditarFapCandidato&&<EditarFapCandidato comandoFechar={setShowEditarFapCandidato} fapCandidato={fapCandidato} comandoSalvar={comandoSalvarFapCandidato}/>}
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
                                    <div><span>Id:</span>&nbsp;{props.infoAva?.infoAvaliacao[0].n_id_avaliacao}</div>
                                    <div><span>Nome:</span>&nbsp;{props.infoAva?.infoAvaliacao[0].s_nome_avaliacao}</div>
                                    <div><span>Data:</span>&nbsp;{formatDateToText(props.infoAva?.infoAvaliacao[0].dt_data_avaliacao)}</div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.infoAva_conteudo_corpo_area}>
                            <h1>Avaliadores</h1>
                            <div className={styles.infoAva_conteudo_corpo_area_linhas}>
                                {props.infoAva?.infoAvaliadores.map((a, i) => (
                                    <div key={i} className={styles.infoAva_conteudo_corpo_area_field}>
                                        <div><span>Id:</span>&nbsp;{a.n_id_pessoa}</div>
                                        <div><span>Nome:</span>&nbsp;{a.s_nome_pessoa}</div>
                                    </div>                                
                                ))}
                            </div>
                        </div>
                        <div className={styles.infoAva_conteudo_corpo_area}>
                            <h1>Candidatos</h1>
                            <div className={styles.infoAva_conteudo_corpo_area_linhas}>
                                {props.infoAva?.infoCandidatos.map((c, i) => (
                                    <div key={i} className={styles.infoAva_conteudo_corpo_area_field_spaceBetween_3}>
                                        <div className={styles.infoAva_conteudo_corpo_area_field_spaceBetween_3_c1}><span>Id: </span>&nbsp;{c.n_id_candidato}</div>
                                        <div className={styles.infoAva_conteudo_corpo_area_field_spaceBetween_3_c2}><span>Nome: </span>&nbsp;{c.s_nome_candidato}</div>
                                        <div className={styles.infoAva_conteudo_corpo_area_field_spaceBetween_3_c3}><span>Status: </span>&nbsp;<span className={`${c.n_resultado_fap == 0?styles.corReprovado:styles.corAprovado}`}>{c.n_resultado_fap == 0?'Reprovado':'Aprovado'}</span></div>
                                        <div className={styles.infoAva_conteudo_corpo_area_field_spaceBetween_3_c4}>
                                            <Image src='/assets/icons/edit_document.svg' alt='Editar Avaliação' width={20} height={-1} onClick={()=>getFapCandidato(props.infoAva?props.infoAva.infoAvaliacao[0].n_id_avaliacao:-1,c.n_id_candidato)}/>
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