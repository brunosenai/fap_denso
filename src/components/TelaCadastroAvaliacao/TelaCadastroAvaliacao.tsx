import styles from "@/styles/CadastroAvaliacao.module.css"
import Image from "next/image"
import { useState, useEffect } from "react"
import { tAvaliacao } from "@/utils/Types"
import {formatDateToText} from  "@/utils/Utils"
import { useRouter } from "next/router"

export default function TelaCadastroAvaliacao(){
    const router=useRouter()
    const [nome,setNome]=useState<string>("")
    const [data,setData]=useState<string>("")
    const [avaliacoes,setAvaliacoes]=useState<tAvaliacao[]>([])
    const [avaliacoesFiltradas,setAvaliacoesFiltradas]=useState<tAvaliacao[]>([])
    const [filtroAvaliacoes,setFiltroAvaliacoes]=useState("")
    const [screenWidth, setScreenWidth]=useState<number>()

    useEffect(()=>{
        const viewportWidth: number = window.innerWidth;
        setScreenWidth(viewportWidth)
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
                alert("Erro ao excluir avaliação!")
            }else{
                obterAvaliacoes()
            }
        })
    }

    const cadastrarAvaliacao=()=>{
        if(nome.trim()=="" || data.trim()==""){
            alert("Preencha todos os campos obrigatórios!")
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
                alert("Erro ao gravar avaliação!")
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

    return(
        <div className={styles.telaCadastroCandidatos}>
            <div className={styles.telaCadastroCandidatos_main}>
                <div className={styles.telaCadastroCandidatos_esquerda}>
                    <div className={styles.telaCadastroCandidatos_topo}>
                        <Image src='/assets/icons/nova_avaliacao.svg' alt='Cadastro de Candidatos' width={40} height={-1}/>
                        <h1>NOVA AVALIAÇÃO</h1>
                    </div>
                    <div className={styles.telaCadastroCandidatos_form}>
                        <div className={styles.fieldForm}>
                            <label htmlFor={`nome`}>Nome Avaliação<span className={styles.obrigatorio}>*</span></label>
                            <input type="text" id={`nome`} value={nome} onChange={(e)=>setNome(e.target.value)} />
                        </div>
                        <div className={styles.fieldForm}>
                            <label htmlFor={`data`}>Data e Hora<span className={styles.obrigatorio}>*</span></label>
                            <input type="datetime-local" id={`data`} value={data} onChange={(e)=>setData(e.target.value)} />
                        </div>
                        <div className={styles.fieldForm_center}>
                            <button className="btnPadrao" onClick={()=>cadastrarAvaliacao()}>cadastrar nova</button>
                        </div>
                    </div>
                </div>
                <div className={styles.telaCadastroCandidatos_direita}>
                    <div className={styles.telaCadastroCandidatos_lista}>
                        <div className={styles.telaCadastroCandidatos_lista_filtro}>
                            <div className={styles.fieldForm}>
                                <input type="text" placeholder="Pesquise pelo nome da avaliação" id={`filtro`} value={filtroAvaliacoes} onChange={(e)=>filtrar(e.target.value)} />
                            </div>
                        </div>
                        <div className={styles.telaCadastroCandidatos_lista_titulos}>
                            <div className={styles.c1}>Nome Avaliação</div>
                            <div className={styles.c2}>Data Avaliação</div>
                            <div className={styles.c3}></div>
                        </div>
                        <div className={styles.telaCadastroCandidatos_lista_linhas}>
                            {avaliacoesFiltradas.map((avaliacao,index)=>(
                                <div key={index} className={styles.telaCadastroCandidatos_lista_l}>
                                    <div className={styles.c1}>{avaliacao.s_nome_avaliacao}</div>
                                    <div className={styles.c2}>{formatDateToText(avaliacao.dt_data_avaliacao)}</div>
                                    <div className={styles.c3}>
                                        <Image src='/assets/icons/delete.svg' alt='Excluir Avaliação' width={20} height={20} className={styles.iconEditar} onClick={()=>excluirAvaliacao(avaliacao.n_id_avaliacao)}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
           
            <div className={styles.telaCadastroCandidatos_rodape}>
                <button className="btnPadrao_claro" onClick={()=>router.replace('/')}>Sair</button>
            </div>
        </div>
    )
}