import styles from "@/styles/CandicadoAvaliacao.module.css"
import Image from "next/image"
import { verifyIsTablet } from "@/utils/Utils"
import { useState, useEffect } from "react"
import { tCandidato,tAvaliacao } from "@/utils/Types"
import {formatDateToText} from  "@/utils/Utils"
import { useRouter } from "next/router"
import PopupImportarDados from "../Popup/PopupImportarDados"

export default function TelaCandidatoAvaliacao(){
    const router=useRouter()
    const [candidatoSel,setCandidatoSel]=useState<number>(-1)
    const [avaliacaoSel,setAvaliacaoSel]=useState<number>(-1)
    const [avaliacoes,setAvaliacoes]=useState<tAvaliacao[]>([])
    const [avaliacoesFiltrados,setAvaliacoesFiltrados]=useState<tAvaliacao[]>([])
    const [filtroAvaliacoes,setFiltroAvaliacoes]=useState("")
    const [candidatos,setCandidatos]=useState<tCandidato[]>([])
    const [candidatosFiltrados,setCandidatosFiltrados]=useState<tCandidato[]>([])
    const [filtroCandidatos,setFiltroCandidatos]=useState("")
    const [candidatosAva,setCandidatosAva]=useState<tCandidato[]>([])
    const [isTablet, setIsTablet]=useState<boolean>()
    const [showImportarDados,setShowImportarDados]=useState<boolean>(false)
    
    useEffect(()=>{
        setIsTablet(verifyIsTablet())
        obterDadosIniciais()
    },[])

    const obterDadosIniciais=()=>{
        const endpoint=`/api/apiCandidatoAvaliacao?action=getIniData&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            setAvaliacoes(res.avaliacoes)
            setCandidatos(res.candidatos)
            setCandidatosFiltrados(res.candidatos)
            setAvaliacoesFiltrados(res.avaliacoes)
        })
    }

    const obterCandidatosAvaliacao=(id:number)=>{
        const endpoint=`/api/apiCandidatoAvaliacao?action=CandidatosPorAvaliacao&idAvaliacao=${id}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            setCandidatosAva(res)
        })
    }

    const selecionarCandidato=(id:number)=>{
        setCandidatoSel(id)
    }

    const selecionarAvaliacao=(id:number)=>{
        setAvaliacaoSel(id)
        obterCandidatosAvaliacao(id)
    }

    const associarCandidato=async()=>{
        if(candidatoSel==-1){
            alert("Selecione um candidato para associar na avaliação")
            return
        }
        if(avaliacaoSel==-1){
            alert("Selecione uma avaliação para associar o candidato")
            return
        }

        const endpoint=`/api/apiCandidatoAvaliacao`
        fetch(endpoint,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                n_id_candidato:candidatoSel,
                n_id_avaliacao:avaliacaoSel,
                apiKey:process.env.NEXT_PUBLIC_API_KEY
            })
        })
        .then(res=>{
            if(res.status!=200){
                alert("Erro ao associar candidato à avaliação!")
            }else{
                obterCandidatosAvaliacao(avaliacaoSel)
            }
        })
    }

    const desassociarCandidato=async(idCandidato:number,idAvaliacao:number)=>{
        const endpoint=`/api/apiCandidatoAvaliacao`
        fetch(endpoint,{
            method:"DELETE",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                n_id_candidato:idCandidato,
                n_id_avaliacao:idAvaliacao,
                apiKey:process.env.NEXT_PUBLIC_API_KEY
            })
        })
        .then(res=>{
            if(res.status!=200){
                alert("Erro ao desassociar candidato à avaliação!")
            }else{
                obterCandidatosAvaliacao(avaliacaoSel)
            }
        })
    }    

    const filtrarCandidatos=(filtro:string)=>{
        setFiltroCandidatos(filtro)
        const resFiltro=candidatos.filter((c,i)=>{
            return c.s_nome_candidato.toLowerCase().includes(filtro.toLowerCase())
        })
        setCandidatosFiltrados(resFiltro)
    }    

    const filtrarAvaliacoes=(filtro:string)=>{
        setFiltroAvaliacoes(filtro)
        const resFiltro=avaliacoes.filter((a,i)=>{
            return a.s_nome_avaliacao.toLowerCase().includes(filtro.toLowerCase())
        })
        setAvaliacoesFiltrados(resFiltro)
    }

    const iniciarImportacao=()=>{
        setShowImportarDados(true)
    }

    const comandoFecharPopupImportação=()=>{
        setShowImportarDados(false)
        obterDadosIniciais()
    }

    return(
        <>
            {showImportarDados&&<PopupImportarDados comandoFechar={comandoFecharPopupImportação}/>}
            <div className={styles.telaCadastro}>
                <div className={`${styles.telaCadastro_sessao1}`}>
                    <div className={styles.telaCadastro_topo}>
                        <Image src='/assets/icons/merge.svg' alt='Cadastro de Candidatos' width={40} height={-1}/>
                        <h1>RELACIONAR CANDIDATO/AVALIAÇÃO</h1>
                    </div>
                    <div className={styles.telaCadastro_topo}>
                        <button className={styles.btnPadrao} onClick={()=>iniciarImportacao()}>
                            <Image src='/assets/icons/upload_file_w.svg' alt='Upload' width={25} height={-1}/>
                            Importar dados
                        </button>
                    </div>
                    <div className={styles.telaCadastro_area_ladoLado}>
                        <div className={styles.area_lado}>
                            <div className={styles.telaCadastro_lista_filtro}>
                                <div className={styles.fieldForm}>
                                    <input type="text" placeholder="Pesquise pelo nome do candidato" id={`filtro`} value={filtroCandidatos} onChange={(e)=>filtrarCandidatos(e.target.value)} />
                                </div>
                            </div>
                            <div className={styles.telaCadastro_lista}>
                                <div className={styles.telaCadastro_lista_titulos}>
                                    <div className={`${styles.c_titulo} ${styles.c1_candidatoAvaliacao_cand}`}>id</div>
                                    <div className={`${styles.c_titulo} ${styles.c2_candidatoAvaliacao_cand}`}>Candidato</div>
                                    <div className={`${styles.c_titulo} ${styles.c3_candidatoAvaliacao_cand}`}>cpf</div>
                                    {!isTablet&&<div className={`${styles.c_titulo} ${styles.espacoBarraRolagem}`}></div>}
                                </div>
                                <div className={styles.telaCadastro_lista_dados}>
                                    {candidatosFiltrados.length > 0 && candidatosFiltrados.map((c, i) => (
                                        <div key={i} className={`${candidatoSel == c.n_id_candidato && styles.telaCadastro_lista_dados_linha_sel} ${styles.telaCadastro_lista_dados_linha}`} onClick={() => selecionarCandidato(c.n_id_candidato)}>
                                            <div className={`${styles.c_dado} ${styles.c1_candidatoAvaliacao_cand}`}>{c.n_id_candidato}</div>
                                            <div className={`${styles.c_dado} ${styles.c2_candidatoAvaliacao_cand}`}>{c.s_nome_candidato}</div>
                                            <div className={`${styles.c_dado} ${styles.c3_candidatoAvaliacao_cand}`}>{c.s_cpf_candidato}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={styles.btnMove} onClick={()=>associarCandidato()}>
                            <Image src='/assets/icons/move_w.svg' alt='Cadastro de Candidatos' width={30} height={30}/>
                        </div>
                        <div className={styles.area_lado}>
                            <div className={styles.telaCadastro_lista_filtro}>
                                <div className={styles.fieldForm}>
                                    <input type="text" placeholder="pesquise pela avaliação" id={`filtro`} value={filtroAvaliacoes} onChange={(e)=>filtrarAvaliacoes(e.target.value)} />
                                </div>
                            </div>                    
                            <div className={styles.telaCadastro_lista}>
                                <div className={styles.telaCadastro_lista_titulos}>
                                    <div className={`${styles.c_titulo} ${styles.c1_candidatoAvaliacao_ava}`}>id</div>
                                    <div className={`${styles.c_titulo} ${styles.c2_candidatoAvaliacao_ava}`}>avaliacao</div>
                                    <div className={`${styles.c_titulo} ${styles.c3_candidatoAvaliacao_ava}`}>data</div>
                                    {!isTablet&&<div className={`${styles.c_titulo} ${styles.espacoBarraRolagem}`}></div>}
                                </div>
                                <div className={styles.telaCadastro_lista_dados}>
                                    {avaliacoesFiltrados.length>0 && avaliacoesFiltrados.map((a,i)=>(
                                        <div key={i} className={`${avaliacaoSel==a.n_id_avaliacao&&styles.telaCadastro_lista_dados_linha_sel} ${styles.telaCadastro_lista_dados_linha}`} onClick={(evt)=>selecionarAvaliacao(a.n_id_avaliacao)}>
                                            <div className={`${styles.c_dado} ${styles.c1_candidatoAvaliacao_ava}`}>{a.n_id_avaliacao}</div>
                                            <div className={`${styles.c_dado} ${styles.c2_candidatoAvaliacao_ava}`}>{a.s_nome_avaliacao}</div>
                                            <div className={`${styles.c_dado} ${styles.c3_candidatoAvaliacao_ava}`}>{formatDateToText(a.dt_data_avaliacao)}</div>
                                        </div>
                                    ))}                                                                                                                                                                                                                              
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className={styles.telaCadastro_sessao2}>
                    <div className={styles.telaCadastro_topo}>
                        <h1>LISTA DE ASSOCIADOS</h1>
                    </div>
                    <div className={styles.telaCadastro_lista}>
                        <div className={styles.telaCadastro_lista_titulos}>
                            <div className={`${styles.c_titulo} ${styles.c1_listaCandidatos}`}>id</div>
                            <div className={`${styles.c_titulo} ${styles.c2_listaCandidatos}`}>nome</div>
                            <div className={`${styles.c_titulo} ${styles.c3_listaCandidatos}`}>cpf</div>
                            <div className={`${styles.c_titulo} ${styles.c4_listaCandidatos}`}>
                                <Image src='/assets/icons/delete_w.svg' alt='Excluir' width={25} height={-1} />
                            </div>
                            {!isTablet&&<div className={`${styles.c_titulo} ${styles.espacoBarraRolagem}`}></div>}
                        </div>
                        <div className={styles.telaCadastro_lista_dados}>
                            {candidatosAva.length > 0 && candidatosAva.map((c, i) => (
                                <div key={i} className={styles.telaCadastro_lista_dados_linha}>
                                    <div className={`${styles.c_dado} ${styles.c1_listaCandidatos}`}>{c.n_id_candidato}</div>
                                    <div className={`${styles.c_dado} ${styles.c2_listaCandidatos}`}>{c.s_nome_candidato}</div>
                                    <div className={`${styles.c_dado} ${styles.c3_listaCandidatos}`}>{c.s_cpf_candidato}</div>
                                    <div className={`${styles.c_dado} ${styles.c4_listaCandidatos}`} onClick={() => desassociarCandidato(c.n_id_candidato, avaliacaoSel)}>
                                        <Image src='/assets/icons/delete.svg' alt='Excluir' width={25} height={-1} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}