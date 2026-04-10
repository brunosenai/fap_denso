import styles from "@/styles/Cadastros.module.css"
import Image from "next/image"
import PopupConfirmation from "../Popup/PopupConfirmation"
import PopupMessage, { PopupMessageProps } from "../Popup/PopupMessage"
import { verifyIsTablet } from "@/utils/Utils"
import { useState, useEffect } from "react"
import { tAvaliacao } from "@/utils/Types"
import {formatDateToText} from  "@/utils/Utils"
import { useRouter } from "next/router"

export default function telaCadastro(){
    const router=useRouter()
    const [nome,setNome]=useState<string>("")
    const [data,setData]=useState<string>("")
    const [avaliacoes,setAvaliacoes]=useState<tAvaliacao[]>([])
    const [avaliacoesFiltradas,setAvaliacoesFiltradas]=useState<tAvaliacao[]>([])
    const [filtroAvaliacoes,setFiltroAvaliacoes]=useState("")
    const [popupConfirmation,setPopupConfirmation]=useState<boolean>(false)
    const [popupMessage,setPopupMessage]=useState<boolean>(false)
    const [isTablet, setIsTablet]=useState<boolean>()
    const [dadosPopupMessage,setDadosPopupMessage]=useState<PopupMessageProps>(
        {
            tipo:0,
            titulo:"",
            mensagem:"",
            comandoOK:() => setPopupMessage(false)
        }
    )
    const [idAvaliacaoExcluir,setIdAvaliacaoExcluir]=useState<number>(0)

    useEffect(()=>{
        const aux=localStorage.getItem('isTablet')
        setIsTablet(verifyIsTablet())
        obterAvaliacoes()
    },[])

    const obterAvaliacoes=()=>{
        const endpoint=`/api/apiAvaliacao?action=getAvaliacoes`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            setAvaliacoes(res)
            setAvaliacoesFiltradas(res)
        })
    }

    const excluirAvaliacao=(id:number)=>{
        const endpoint=`/api/apiAvaliacao`
        fetch(endpoint,{
            method:"DELETE",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                id_avaliacao:id
            })
        })
        .then(res=>{
            if(res.status!=200){
                setDadosPopupMessage({
                    tipo:3,
                    titulo:"Erro",
                    mensagem:"Erro ao excluir avaliação!",
                    comandoOK:() => setPopupMessage(false)
                })
                setPopupMessage(true)
            }else{
                obterAvaliacoes()
            }
        })
    }

    const cadastrarAvaliacao=()=>{
        if(nome.trim()=="" || data.trim()==""){
            setDadosPopupMessage({
                tipo:3,
                titulo:"Erro",
                mensagem:"Preencha todos os campos obrigatórios!",
                comandoOK:() => setPopupMessage(false)
            })
            setPopupMessage(true)
            return
        }
        const endpoint=`/api/apiAvaliacao`
        fetch(endpoint,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                s_nome_avaliacao:nome,
                dt_data_avaliacao:data
            })
        })
        .then(res=>{
            if(res.status!=200){
                setDadosPopupMessage({
                    tipo:3,
                    titulo:"Erro",
                    mensagem:"Erro ao gravar avaliação!",
                    comandoOK:() => setPopupMessage(false)
                })
                setPopupMessage(true)
            }else{
                obterAvaliacoes()
            }
        })
    }

    const filtrar=(filtro:string)=>{
        setFiltroAvaliacoes(filtro)
        const resFiltro=avaliacoes.filter((a,i)=>{
            return a.s_nome_avaliacao.toLowerCase().includes(filtro.toLowerCase())
        })
        setAvaliacoesFiltradas(resFiltro)
    }

    const comandoExcluir=(id:number)=>{
        setIdAvaliacaoExcluir(id)
        setPopupConfirmation(true)
    }

    const comandoSim=()=>{
        excluirAvaliacao(idAvaliacaoExcluir)
        setPopupConfirmation(false)
    }

    const comandoNao=()=>{setPopupConfirmation(false)}

    return(
        <>
            {popupMessage&&<PopupMessage tipo={dadosPopupMessage.tipo} titulo={dadosPopupMessage.titulo} mensagem={dadosPopupMessage.mensagem} comandoOK={dadosPopupMessage.comandoOK}/>}
            {popupConfirmation&&<PopupConfirmation titulo="Excluir" mensagem="Esta avaliação será excluída!" pergunta="Confirma exclusão da avaliação?" comandoSim={comandoSim} comandoNao={comandoNao}/>}
            <div className={styles.telaCadastro}>
                <div className={styles.telaCadastro_sessao1}>
                    <div className={styles.telaCadastro_topo}>
                        <Image src='/assets/icons/nova_avaliacao.svg' alt='Cadastro de Candidatos' width={30} height={-1}/>
                        <h1>NOVA AVALIAÇÃO</h1>
                    </div>
                    <div className={styles.telaCadastro_form}>
                        <div className={styles.fieldForm}>
                            <label htmlFor={`nome`}>Nome Avaliação<span className={styles.obrigatorio}>*</span></label>
                            <input type="text" id={`nome`} value={nome} onChange={(e)=>setNome(e.target.value)} />
                        </div>
                        <div className={styles.fieldForm}>
                            <label htmlFor={`data`}>Data e Hora<span className={styles.obrigatorio}>*</span></label>
                            <input type="datetime-local" id={`data`} value={data} onChange={(e)=>setData(e.target.value)} />
                        </div>
                        <div className={styles.fieldForm_center}>
                            <button className={styles.btnPadrao} onClick={()=>cadastrarAvaliacao()}>cadastrar nova</button>
                        </div>
                    </div>
                </div>

                <div className={styles.telaCadastro_sessao2}>
                    <div className={styles.telaCadastro_lista}>
                        <div className={styles.telaCadastro_lista_filtro}>
                            <input type="text" placeholder="Pesquise pelo nome da avaliação" id={`filtro`} value={filtroAvaliacoes} onChange={(e)=>filtrar(e.target.value)} />
                        </div>
                        <div className={styles.telaCadastro_lista_titulos}>
                            <div className={`${styles.c_titulo} ${styles.c1}`}>Nome Avaliação</div>
                            <div className={`${styles.c_titulo} ${styles.c2}`}>Data Avaliação</div>
                            <div className={`${styles.c_titulo} ${styles.c3} ${styles.c_center}`}>
                                <Image src='/assets/icons/delete_w.svg' alt='Excluir Avaliação' width={20} height={-1}/>
                            </div>
                            {!isTablet&&<div className={`${styles.c_titulo} ${styles.espacoBarraRolagem}`}></div>}
                        </div>
                        <div className={styles.telaCadastro_lista_dados}>
                            {avaliacoesFiltradas.map((avaliacao,index)=>(
                                <div key={index} className={styles.telaCadastro_lista_dados_linha}>
                                    <div className={styles.c1}>{avaliacao.s_nome_avaliacao}</div>
                                    <div className={styles.c2}>{formatDateToText(avaliacao.dt_data_avaliacao)}</div>
                                    <div className={`${styles.c_dado} ${styles.c3} ${styles.c_center}`}>
                                        <Image src='/assets/icons/delete.svg' alt='Excluir Avaliação' width={20} height={20} className={styles.iconEditar} onClick={()=>comandoExcluir(avaliacao.n_id_avaliacao)}/>
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