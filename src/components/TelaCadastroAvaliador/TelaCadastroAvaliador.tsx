import styles from "@/styles/CadastroAvaliador.module.css"
import Image from "next/image"
import { useState, useEffect, useEffectEvent } from "react"
import { tAvaliador } from "@/utils/Types"
import { useRouter } from "next/router"

export default function TelaCadastroAvaliador(){
    const router=useRouter()
    const [nome,setNome]=useState<string>("")
    const [avaliadores,setAvaliadores]=useState<tAvaliador[]>([])
    const [avaliadoresFiltrados,setAvaliadoresFiltrados]=useState<tAvaliador[]>([])
    const [filtroAvaliadores,setFiltroAvaliadores]=useState("")

    useEffect(()=>{
        obterAvaliadores()
    },[])

    const obterAvaliadores=async()=>{
        const endpoint=`/api/apiPessoa?action=getPessoas`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            setAvaliadores(res)
            setAvaliadoresFiltrados(res)
        })
    }

    const filtrar=(filtro:string)=>{
        setFiltroAvaliadores(filtro)
        const resFiltro=avaliadores.filter((a,i)=>{
            return a.s_nome_pessoa.toLowerCase().includes(filtro.toLowerCase())
        })
        setAvaliadoresFiltrados(resFiltro)
    }

    return(
        <div className={styles.telaCadastroCandidatos}>
            <div className={styles.telaCadastroCandidatos_topo}>
                <Image src='/assets/icons/novo_avaliador.svg' alt='Cadastro de Candidatos' width={129} height={129}/>
                <h1>Novo Avaliador</h1>
            </div>
            <div className={styles.telaCadastroCandidatos_form}>
                <div className={styles.fieldForm}>
                    <label htmlFor={`nome`}>Nome Completo<span className={styles.obrigatorio}>*</span></label>
                    <input type="text" id={`nome`} value={nome} onChange={(e)=>setNome(e.target.value)} />
                </div>
                <div className={styles.fieldForm}>
                    <label htmlFor={`cpf`}>CPF<span className={styles.obrigatorio}>*</span></label>
                    <input type="text" id={`cpf`} value={nome} onChange={(e)=>setNome(e.target.value)} />
                </div>
                <div className={styles.fieldForm}>
                    <label htmlFor={`telefone`}>Telefone<span className={styles.obrigatorio}>*</span></label>
                    <input type="text" id={`telefone`} value={nome} onChange={(e)=>setNome(e.target.value)} />
                </div>
                <div className={styles.fieldForm}>
                    <label htmlFor={`email`}>E-Mail<span className={styles.obrigatorio}>*</span></label>
                    <input type="text" id={`email`} value={nome} onChange={(e)=>setNome(e.target.value)} />
                </div>
                <div className={styles.fieldForm_center}>
                    <button className="btnPadrao">cadastrar novo</button>
                </div>
            </div>
            <div className={styles.telaCadastroCandidatos_lista}>
                <div className={styles.telaCadastroCandidatos_lista_filtro}>
                    <div className={styles.fieldForm}>
                        <input type="text" placeholder="pesquise pelo nome do avaliador" id={`filtro`} value={filtroAvaliadores} onChange={(e)=>filtrar(e.target.value)} />
                    </div>
                </div>                
                <div className={styles.telaCadastroCandidatos_lista_titulos}>
                    <div className={styles.c1}>Nome</div>
                    <div className={styles.c2}>E-Mail</div>
                    <div className={styles.c3}>Telefone</div>
                </div>
                <div className={styles.telaCadastroCandidatos_lista_linhas}>
                    {avaliadoresFiltrados.map((av,index)=>(
                        <div key={index} className={styles.telaCadastroCandidatos_lista_l}>
                            <div className={styles.c1}>{av.s_nome_pessoa}</div>
                            <div className={styles.c2}>{av.s_email_pessoa}</div>
                            <div className={styles.c3}>{av.s_telefone_pessoa}</div>
                        </div>
                    ))}
                </div>
            </div>            
            <div className={styles.telaCadastroCandidatos_rodape}>
                <button className="btnPadrao_claro" onClick={()=>router.replace('/')}>Sair</button>
            </div>
        </div>
    )
}