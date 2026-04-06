// import styles from "@/styles/CadastroAvaliador.module.css"
import styles from "@/styles/Cadastros.module.css"
import Image from "next/image"
import { useState, useEffect, useEffectEvent } from "react"
import { tAvaliador } from "@/utils/Types"
import { useRouter } from "next/router"
import Load from "../Load/Load"

export default function TelaCadastroAvaliador(){
    const router=useRouter()
    const [nome,setNome]=useState<string>("")
    const [cpf,setCpf]=useState<string>("")
    const [telefone,setTelefone]=useState<string>("")
    const [email,setEmail]=useState<string>("")
    const [avaliadores,setAvaliadores]=useState<tAvaliador[]>([])
    const [avaliadoresFiltrados,setAvaliadoresFiltrados]=useState<tAvaliador[]>([])
    const [filtroAvaliadores,setFiltroAvaliadores]=useState("")
    const [screenWidth, setScreenWidth]=useState<number>()
    const [loading, setLoading]=useState<boolean>(false)

    useEffect(()=>{
        const viewportWidth: number = window.innerWidth;
        setScreenWidth(viewportWidth)
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

    const validarEmail=(vemail:string)=>{
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(vemail)) {
            alert("Digite um e-mail válido")
            return false
        }
        return true
    }

    const validarCampos=()=>{
        console.log(nome,cpf,telefone,email)
        if(nome=="" || cpf=="" || telefone=="" || !validarEmail(email)){
            alert("Preencha todos os campos obrigatórios")
            return false
        }
        return true
    }

    const cadastrarAvaliador=async()=>{
        try{
            setLoading(true)
            if(validarCampos()){
                const endpoint=`/api/apiPessoa`
                fetch(endpoint,{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        n_id_tipoPessoa:1,
                        s_nome_pessoa:nome,
                        s_cpf_pessoa:cpf,
                        s_email_pessoa:email,
                        s_telefone_pessoa:telefone
                    })
                })
                .then(res=>{
                    if(res.status==200){
                        setLoading(false)
                        alert('Avaliador cadastrado com sucesso!')
                        obterAvaliadores()
                    }else if(res.status==400){
                        setLoading(false)
                        alert('Cadastro não efetuado, já existe este email cadastrado')
                    }
                })
            }
        }catch(error){
            setLoading(false)
            console.error(error)
            alert("Ocorreu um erro ao cadastrar o avaliador")
        }
        finally{
            setLoading(false)
            obterAvaliadores()
        }
    }

    return(                         
        <div className={styles.telaCadastroAvaliador}>
            {loading && <Load/>}
            <div className={styles.telaCadastroAvaliador_esquerda}>
                <div className={styles.telaCadastroCandidatos_topo}>
                    <Image src='/assets/icons/novo_avaliador.svg' alt='Cadastro de Candidatos' width={40} height={-1}/>
                    <h1>NOVO AVALIADOR</h1>
                </div>
                <div className={styles.telaCadastroCandidatos_form}>
                    <div className={styles.fieldForm}>
                        <label htmlFor={`nome`}>Nome Completo<span className={styles.obrigatorio}>*</span></label>
                        <input type="text" id={`nome`} value={nome} onChange={(e)=>setNome(e.target.value)} />
                    </div>
                    <div className={styles.fieldForm}>
                        <label htmlFor={`cpf`}>CPF<span className={styles.obrigatorio}>*</span></label>
                        <input type="text" id={`cpf`} value={cpf} onChange={(e)=>setCpf(e.target.value)} />
                    </div>
                    <div className={styles.fieldForm}>
                        <label htmlFor={`telefone`}>Telefone<span className={styles.obrigatorio}>*</span></label>
                        <input type="text" id={`telefone`} value={telefone} onChange={(e)=>setTelefone(e.target.value)} />
                    </div>
                    <div className={styles.fieldForm}>
                        <label htmlFor={`email`}>E-Mail<span className={styles.obrigatorio}>*</span></label>
                        <input type="text" id={`email`} value={email} onChange={(e)=>setEmail(e.target.value)} />
                    </div>
                    <div className={styles.fieldForm_center}>
                        <button className="btnPadrao" onClick={()=>cadastrarAvaliador()}>cadastrar novo</button>
                    </div>
                </div>
            </div>
            <div className={styles.telaCadastroAvaliador_direita}>
                <div className={styles.telaCadastroCandidatos_lista}>
                    <div className={styles.telaCadastroCandidatos_lista_filtro}>
                        <div className={styles.fieldForm}>
                            <input type="text" placeholder="Pesquise pelo nome do avaliador" id={`filtro`} value={filtroAvaliadores} onChange={(e)=>filtrar(e.target.value)} />
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
            </div>
        </div>
    )
}