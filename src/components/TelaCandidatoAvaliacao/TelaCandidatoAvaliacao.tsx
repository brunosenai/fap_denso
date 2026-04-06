// import styles from "@/styles/CandicadoAvaliacao.module.css"
import styles from "@/styles/Cadastros.module.css"
import Image from "next/image"
import { useState, useEffect } from "react"
import { tCandidado,tAvaliacao } from "@/utils/Types"
import {formatDateToText} from  "@/utils/Utils"
import { useRouter } from "next/router"

export default function TelaCandidatoAvaliacao(){
    const router=useRouter()
    const [candidatoSel,setCandidatoSel]=useState<number>(-1)
    const [avaliacaoSel,setAvaliacaoSel]=useState<number>(-1)
    const [avaliacoes,setAvaliacoes]=useState<tAvaliacao[]>([])
    const [avaliacoesFiltrados,setAvaliacoesFiltrados]=useState<tAvaliacao[]>([])
    const [filtroAvaliacoes,setFiltroAvaliacoes]=useState("")
    const [candidatos,setCandidatos]=useState<tCandidado[]>([])
    const [candidatosFiltrados,setCandidatosFiltrados]=useState<tCandidado[]>([])
    const [filtroCandidatos,setFiltroCandidatos]=useState("")
    const [candidatosAva,setCandidatosAva]=useState<tCandidado[]>([])
    const [screenWidth, setScreenWidth]=useState<number>()
    
    useEffect(()=>{
        const viewportWidth: number = window.innerWidth;
        setScreenWidth(viewportWidth)
        obterDadosIniciais()
    },[])

    const obterDadosIniciais=()=>{
        const endpoint=`/api/apiCandidatoAvaliacao?action=getIniData`
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
        const endpoint=`/api/apiCandidatoAvaliacao?action=CandidatosPorAvaliacao&idAvaliacao=${id}`
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
                n_id_avaliacao:avaliacaoSel
            })
        })
        .then(res=>{
            if(res.status!=200){
                alert("Erro ao associar candidado à avaliação!")
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
                n_id_avaliacao:idAvaliacao
            })
        })
        .then(res=>{
            if(res.status!=200){
                alert("Erro ao desassociar candidado à avaliação!")
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

    return(
        <div className={styles.telaCadastroCandidatos}>
            <div className={styles.telaCadastroCandidatos_esquerda}>
                <div className={styles.telaCadastroCandidatos_topo}>
                    <Image src='/assets/icons/merge.svg' alt='Cadastro de Candidatos' width={40} height={-1}/>
                    <h1>RELACIONAR CANDIDATO/AVALIAÇÃO</h1>
                </div>
                <div className={styles.telaCadastroCandidatos_form}>
                    <div className={styles.areaLista}>
                        <div className={styles.telaCadastroCandidatos_lista_filtro}>
                            <div className={styles.fieldForm}>
                                <input type="text" placeholder="Pesquise pelo nome do candidato" id={`filtro`} value={filtroCandidatos} onChange={(e)=>filtrarCandidatos(e.target.value)} />
                            </div>
                        </div>
                        <div className={styles.telaCadastroCandidatos_lista}>
                            <div className={styles.telaCadastroCandidatos_lista_titulos}>
                                <div className={styles.c1_c}>id</div>
                                <div className={styles.c2_c}>Candidato</div>
                                <div className={styles.c3_c}>cpf</div>
                            </div>
                        </div>
                        <div className={styles.telaCadastroCandidatos_lista_linhas}>
                            {candidatosFiltrados.length>0 && candidatosFiltrados.map((c,i)=>(
                                <div key={i} className={`${candidatoSel==c.n_id_candidato&&styles.telaCadastroCandidatos_lista_l_selecionada} ${styles.telaCadastroCandidatos_lista_l}`} onClick={(evt)=>selecionarCandidato(c.n_id_candidato)}>
                                    <div className={styles.c1_c}>{c.n_id_candidato}</div>
                                    <div className={styles.c2_c}>{c.s_nome_candidato}</div>
                                    <div className={styles.c3_c}>{c.s_cpf_candidato}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.btnMove} onClick={()=>associarCandidato()}>
                        <Image src='/assets/icons/move_w.svg' alt='Cadastro de Candidatos' width={35} height={35}/>
                    </div>
                    <div className={styles.areaLista}>
                        <div className={styles.telaCadastroCandidatos_lista_filtro}>
                            <div className={styles.fieldForm}>
                                <input type="text" placeholder="pesquise pela avaliação" id={`filtro`} value={filtroAvaliacoes} onChange={(e)=>filtrarAvaliacoes(e.target.value)} />
                            </div>
                        </div>                    
                        <div className={styles.telaCadastroCandidatos_lista}>
                            <div className={styles.telaCadastroCandidatos_lista_titulos}>
                                <div className={styles.c1_a}>id</div>
                                <div className={styles.c2_a}>avaliacao</div>
                                <div className={styles.c3_a}>data</div>
                            </div>
                            <div className={styles.telaCadastroCandidatos_lista_linhas}>
                                {avaliacoesFiltrados.length>0 && avaliacoesFiltrados.map((a,i)=>(
                                    <div key={i} className={`${avaliacaoSel==a.n_id_avaliacao&&styles.telaCadastroCandidatos_lista_l_selecionada} ${styles.telaCadastroCandidatos_lista_l}`} onClick={(evt)=>selecionarAvaliacao(a.n_id_avaliacao)}>
                                        <div className={styles.c1_a}>{a.n_id_avaliacao}</div>
                                        <div className={styles.c2_a}>{a.s_nome_avaliacao}</div>
                                        <div className={styles.c3_a}>{formatDateToText(a.dt_data_avaliacao)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className={styles.telaCadastroCandidatos_direita}>
                <div className={styles.telaCadastroCandidatos_topo}>
                    <h1>LISTA DE ASSOCIADOS</h1>
                </div>

                <div className={styles.telaCadastroCandidatos_candidatosAvaliacao}>
                    <div className={styles.telaCadastroCandidatos_lista}>
                        <div className={styles.telaCadastroCandidatos_lista_titulos}>
                            <div className={styles.c1_ca}>id</div>
                            <div className={styles.c2_ca}>nome</div>
                            <div className={styles.c3_ca}>cpf</div>
                            <div className={styles.c4_ca}></div>
                        </div>
                        <div className={styles.telaCadastroCandidatos_lista_linhas}>
                            {candidatosAva.length>0 && candidatosAva.map((c,i)=>(
                                <div key={i} className={styles.telaCadastroCandidatos_lista_l}>
                                    <div className={styles.c1_ca}>{c.n_id_candidato}</div>
                                    <div className={styles.c2_ca}>{c.s_nome_candidato}</div>
                                    <div className={styles.c3_ca}>{c.s_cpf_candidato}</div>
                                    <div className={styles.c4_ca} onClick={()=>desassociarCandidato(c.n_id_candidato,avaliacaoSel)}>
                                        <Image src='/assets/icons/delete.svg' alt='Cadastro de Candidatos' width={25} height={25}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}