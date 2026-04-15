// import styles from "@/styles/CadastroAvaliador.module.css"
import styles from "@/styles/Cadastros.module.css"
import Image from "next/image"
import PopupConfirmation from "../Popup/PopupConfirmation"
import PopupMessage, { PopupMessageProps } from "../Popup/PopupMessage"
import { verifyIsTablet } from "@/utils/Utils"
import { useState, useEffect } from "react"
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
    const [isTablet, setIsTablet]=useState<boolean>()
    const [loading, setLoading]=useState<boolean>(false)
    const [popupMessage,setPopupMessage]=useState<boolean>(false)
    const [dadosPopupMessage,setDadosPopupMessage]=useState<PopupMessageProps>(
        {
            tipo:0,
            titulo:"",
            mensagem:"",
            comandoOK:() => setPopupMessage(false)
        }
    )

    useEffect(()=>{
        setIsTablet(verifyIsTablet())
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
            setDadosPopupMessage({
                tipo:2,
                titulo:"Alerta",
                mensagem:"Digite um e-mail válido",
                comandoOK:() => setPopupMessage(false)
            })
            setPopupMessage(true)            
            return false
        }
        return true
    }

    const validarCampos=()=>{
        console.log(nome,cpf,telefone,email)
        if(nome=="" || cpf=="" || telefone=="" || !validarEmail(email)){
            setDadosPopupMessage({
                tipo:2,
                titulo:"Alerta",
                mensagem:"Preencha todos os campos obrigatórios",
                comandoOK:() => setPopupMessage(false)
            })
            setPopupMessage(true)            
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
                        setDadosPopupMessage({
                            tipo:1,
                            titulo:"Sucesso",
                            mensagem:"Avaliador cadastrado com sucesso!",
                            comandoOK:() => setPopupMessage(false)
                        })
                        setPopupMessage(true)                        
                        obterAvaliadores()
                    }else if(res.status==400){
                        setLoading(false)
                        setDadosPopupMessage({
                            tipo:3,
                            titulo:"Erro",
                            mensagem:"Cadastro não efetuado, já existe este email cadastrado",
                            comandoOK:() => setPopupMessage(false)
                        })
                        setPopupMessage(true)                        
                    }
                })
            }
        }catch(error){
            setLoading(false)
            console.error(error)
            setDadosPopupMessage({
                tipo:3,
                titulo:"Erro",
                mensagem:"Ocorreu um erro ao cadastrar o avaliador",
                comandoOK:() => setPopupMessage(false)
            })
            setPopupMessage(true)                        

        }
        finally{
            setLoading(false)
            obterAvaliadores()
        }
    }

    return(            
        <>       
            {popupMessage&&<PopupMessage tipo={dadosPopupMessage.tipo} titulo={dadosPopupMessage.titulo} mensagem={dadosPopupMessage.mensagem} comandoOK={dadosPopupMessage.comandoOK}/>}      
            <div className={styles.telaCadastro}>
                {loading && <Load/>}
                <div className={styles.telaCadastro_sessao1}>
                    <div className={styles.telaCadastro_topo}>
                        <Image src='/assets/icons/novo_avaliador.svg' alt='Cadastro de Candidatos' width={40} height={-1}/>
                        <h1>NOVO AVALIADOR</h1>
                    </div>
                    <div className={styles.telaCadastro_form}>
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
                            <button className={styles.btnPadrao} onClick={()=>cadastrarAvaliador()}>cadastrar novo</button>
                        </div>
                    </div>
                </div>
                <div className={styles.telaCadastro_sessao2}>
                    <div className={styles.telaCadastro_lista}>
                        <div className={styles.telaCadastro_lista_filtro}>
                            <div className={styles.fieldForm}>
                                <input type="text" placeholder="Pesquise pelo nome do avaliador" id={`filtro`} value={filtroAvaliadores} onChange={(e)=>filtrar(e.target.value)} />
                            </div>
                        </div>                
                        <div className={styles.telaCadastro_lista_titulos}>
                            <div className={`${styles.c_titulo} ${styles.c1_avalidador}`}>Nome</div>
                            <div className={`${styles.c_titulo} ${styles.c2_avalidador}`}>E-Mail</div>
                            <div className={`${styles.c_titulo} ${styles.c3_avalidador}`}>Telefone</div>
                            <div className={`${styles.c_titulo} ${styles.c4_avalidador} ${styles.c_comandos}`}>
                                <Image src='/assets/icons/delete_w.svg' alt='Excluir Avaliação' width={20} height={-1}/>
                            </div>
                            {!isTablet&&<div className={`${styles.c_titulo} ${styles.espacoBarraRolagem}`}></div>}
                        </div>
                        <div className={styles.telaCadastro_lista_dados}>
                            {avaliadoresFiltrados.map((av,index)=>(
                                <div key={index} className={styles.telaCadastro_lista_dados_linha}>
                                    <div className={`${styles.c_dado} ${styles.c1_avalidador}`}>{av.s_nome_pessoa}</div>
                                    <div className={`${styles.c_dado} ${styles.c2_avalidador}`}>{av.s_email_pessoa}</div>
                                    <div className={`${styles.c_dado} ${styles.c3_avalidador}`}>{av.s_telefone_pessoa}</div>
                                    <div className={`${styles.c_dado} ${styles.c4_avalidador} ${styles.c_comandos}`}>
                                        <Image src='/assets/icons/delete.svg' alt='Excluir Avaliação' width={20} height={-1}/>
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