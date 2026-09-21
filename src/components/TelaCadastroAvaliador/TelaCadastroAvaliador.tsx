// import styles from "@/styles/CadastroAvaliador.module.css"
import styles from "@/styles/Cadastros.module.css"
import Image from "next/image"
import PopupConfirmation, {PopupConfirmationProps} from "../Popup/PopupConfirmation"
import PopupMessage, { PopupMessageProps } from "../Popup/PopupMessage"
import { verifyIsTablet } from "@/utils/Utils"
import { useState, useEffect } from "react"
import { tAvaliador } from "@/utils/Types"
import { useRouter } from "next/router"
import {formatarTelefone, formatarCPF} from "@/utils/Utils"
import Load from "../Load/Load"

export default function TelaCadastroAvaliador(){
    const router=useRouter()
    const [id,setId]=useState<string>("")
    const [nome,setNome]=useState<string>("")
    const [cpf,setCpf]=useState<string>("")
    const [telefone,setTelefone]=useState<string>("")
    const [email,setEmail]=useState<string>("")
    const [tipo,setTipo]=useState<string>("")
    const [avaliadores,setAvaliadores]=useState<tAvaliador[]>([])
    const [avaliadoresFiltrados,setAvaliadoresFiltrados]=useState<tAvaliador[]>([])
    const [filtroAvaliadores,setFiltroAvaliadores]=useState("")
    const [isTablet, setIsTablet]=useState<boolean>()
    const [popupMessage,setPopupMessage]=useState<boolean>(false)
    const [popupConfirmation,setPopupConfirmation]=useState<boolean>(false)
    const [load, setLoad]=useState<boolean>(false)
    const [dadosPopupMessage,setDadosPopupMessage]=useState<PopupMessageProps>(
        {
            tipo:0,
            titulo:"",
            mensagem:"",
            comandoOK:() => setPopupMessage(false)
        }
    )
    const [dadosPopupConfirmation,setDadosPopupConfirmation]=useState<PopupConfirmationProps>(
        {
            titulo:"",
            mensagem:"",
            pergunta:"",
            comandoSim:() => setPopupMessage(false),
            comandoNao:() => setPopupMessage(false)
        }
    )

    useEffect(()=>{
        setIsTablet(verifyIsTablet())
        obterAvaliadores()
    },[])

    const obterAvaliadores=async()=>{
        try{
            setLoad(true)
            const endpoint=`/api/apiPessoa?action=getPessoas&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`
            fetch(endpoint)
            .then(res=>res.json())
            .then(res=>{
                setAvaliadores(res)
                setAvaliadoresFiltrados(res)
            })
            .finally(()=>{
                setLoad(false)
            })
        }catch(error){
            setLoad(false)
            console.error(error)
            setDadosPopupMessage({
                tipo:3,
                titulo:"Erro",
                mensagem:"Ocorreu um erro ao obter os avaliadores",
                comandoOK:() => setPopupMessage(false)
            })
            setPopupMessage(true)                        
        }
    }

    const excluirPessoa=async(idPessoa:number)=>{
        setDadosPopupConfirmation({
            titulo:"Confirmação de Exclusão",
            mensagem:"Esta ação não poderá ser desfeita.",
            pergunta:"Tem certeza que deseja remover este colaborador?",
            comandoSim:()=>rotinaExcluirPessoa(idPessoa.toString()),
            comandoNao:()=>setPopupConfirmation(false)
        })
        setPopupConfirmation(true)
    }

    const rotinaExcluirPessoa=(idPessoa:string)=>{
        try{
            setLoad(true)
            const endpoint=`/api/apiPessoa`
            fetch(endpoint,{
                method:"DELETE",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    n_id_pessoa:idPessoa,
                    apiKey:process.env.NEXT_PUBLIC_API_KEY
                })
            })
            .then(res=>{
                if(res.status==200){
                    setLoad(false)
                    setDadosPopupMessage({
                        tipo:1,
                        titulo:"Sucesso",
                        mensagem:"Colaborador removido com sucesso!",
                        comandoOK:() => setPopupMessage(false)
                    })
                    setPopupConfirmation(false)
                    setPopupMessage(true)                        
                    obterAvaliadores()
                }else{
                    setLoad(false)
                    setPopupConfirmation(false)
                    setDadosPopupMessage({
                        tipo:3,
                        titulo:"Erro",
                        mensagem:"Erro ao remover colaborador",
                        comandoOK:() => setPopupMessage(false)
                    })
                    setPopupMessage(true)                        
                }
            })
        }catch(error){
            setLoad(false)
            setPopupConfirmation(false)
            console.error(error)
            setDadosPopupMessage({
                tipo:3,
                titulo:"Erro",
                mensagem:"Ocorreu um erro ao remover o colaborador",
                comandoOK:() => setPopupMessage(false)
            })
            setPopupMessage(true)                        
        }
        finally{
            setPopupConfirmation(false)
        }        
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
        if(nome=="" || cpf=="" || telefone=="" || tipo=="" || !validarEmail(email)){
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

    const limparCampos=()=>{
        setNome("")
        setCpf("")
        setTelefone("")
        setEmail("")
        setTipo("")
    }

    // =========================================================================
    // MÁSCARAS DE INPUT
    // =========================================================================
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, ""); // Remove tudo o que não é dígito
        if (v.length > 11) v = v.slice(0, 11); // Limita a 11 dígitos numéricos
        
        // Aplica a máscara: 000.000.000-00
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        
        setCpf(v);
    }

    const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, ""); // Remove tudo o que não é dígito
        if (v.length > 11) v = v.slice(0, 11); // Limita a 11 dígitos numéricos (DDD + 9 dígitos)

        // Aplica a máscara: (31)90000-0000
        v = v.replace(/^(\d{2})(\d)/g, "($1)$2"); 
        v = v.replace(/(\d)(\d{4})$/, "$1-$2");
        
        setTelefone(v);
    }

    const cadastrarAvaliador = async () => {
        if (!validarCampos()) return;

        setLoad(true)
        try {
            const endpoint = `/api/apiPessoa`
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    n_id_tipoPessoa: tipo,
                    s_nome_pessoa: nome,
                    s_cpf_pessoa: cpf.replace(/\D/g, ""),
                    s_email_pessoa: email,
                    s_telefone_pessoa: telefone.replace(/\D/g, ""),
                    apiKey: process.env.NEXT_PUBLIC_API_KEY
                })
            })

            const data = await res.json().catch(() => null);

            if (res.status === 200) {
                limparCampos()
                setDadosPopupMessage({
                    tipo: 1,
                    titulo: "Sucesso",
                    mensagem: data?.message || "Colaborador cadastrado com sucesso!",
                    comandoOK: () => setPopupMessage(false)
                })
                setPopupMessage(true)                        
                obterAvaliadores()
            } else {
                setDadosPopupMessage({
                    tipo: 3,
                    titulo: "Erro",
                    mensagem: data?.message || "Erro ao cadastrar o colaborador.",
                    comandoOK: () => setPopupMessage(false)
                })
                setPopupMessage(true)                        
            }
        } catch (error) {
            console.error(error)
            setDadosPopupMessage({
                tipo: 3,
                titulo: "Erro",
                mensagem: "Ocorreu um erro de conexão ao cadastrar o colaborador",
                comandoOK: () => setPopupMessage(false)
            })
            setPopupMessage(true)                        
        } finally {
            setLoad(false)
        }
    }

    return(            
        <>
            {load&&<Load/>}
            {popupConfirmation&&<PopupConfirmation titulo={dadosPopupConfirmation.titulo} mensagem={dadosPopupConfirmation.mensagem} pergunta={dadosPopupConfirmation.pergunta} comandoSim={dadosPopupConfirmation.comandoSim} comandoNao={dadosPopupConfirmation.comandoNao}/>}
            {popupMessage&&<PopupMessage tipo={dadosPopupMessage.tipo} titulo={dadosPopupMessage.titulo} mensagem={dadosPopupMessage.mensagem} comandoOK={dadosPopupMessage.comandoOK}/>}      
            <div className={styles.telaCadastro}>
                <div className={styles.telaCadastro_sessao1}>
                    <div className={styles.telaCadastro_topo}>
                        <Image src='/assets/icons/novo_avaliador.svg' alt='Cadastro de Candidatos' width={30} height={-1}/>
                        <h1>NOVO COLABORADOR</h1>
                    </div>
                    <div className={styles.telaCadastro_form}>
                        <div className={styles.telaCadastro_form_ladoAlado}>
                            <div className={styles.fieldForm}>
                                <label htmlFor={`nome`}>Nome Completo<span className={styles.obrigatorio}>*</span></label>
                                <input type="text" id={`nome`} value={nome} onChange={(e)=>setNome(e.target.value)} />
                            </div>
                            <div className={styles.fieldForm}>
                                <label htmlFor={`cpf`}>CPF<span className={styles.obrigatorio}>*</span></label>
                                <input 
                                    type="text" 
                                    id={`cpf`} 
                                    value={cpf} 
                                    onChange={handleCpfChange} 
                                    maxLength={14} 
                                    placeholder="000.000.000-00" 
                                />
                            </div>
                            <div className={styles.fieldForm}>
                                <label htmlFor={`telefone`}>Telefone<span className={styles.obrigatorio}>*</span></label>
                                <input 
                                    type="text" 
                                    id={`telefone`} 
                                    value={telefone} 
                                    onChange={handleTelefoneChange} 
                                    maxLength={14} 
                                    placeholder="(00)00000-0000" 
                                />
                            </div>
                        </div>
                        <div className={styles.telaCadastro_form_ladoAlado}>
                            <div className={styles.fieldForm}>
                                <label htmlFor={`email`}>E-Mail<span className={styles.obrigatorio}>*</span></label>
                                <input type="text" id={`email`} value={email} onChange={(e)=>setEmail(e.target.value)} />
                            </div>
                            <div className={styles.fieldForm}>
                                <label htmlFor={`tipo`}>Tipo Colaborador<span className={styles.obrigatorio}>*</span></label>
                                <select id={`tipo`} value={tipo} onChange={(e)=>setTipo(e.target.value)}>
                                    <option value="">Selecione o tipo</option>
                                    <option value="1">Avaliador</option>
                                    <option value="2">Gestor</option>
                                </select>
                            </div>
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
                            <div className={`${styles.c_titulo} ${styles.c4_avalidador}`}>Tipo</div>
                            <div className={`${styles.c_titulo} ${styles.c5_avalidador} ${styles.c_comandos}`}>
                                <Image src='/assets/icons/delete_w.svg' alt='Excluir Avaliação' width={20} height={20}/>
                            </div>
                            {!isTablet&&<div className={`${styles.c_titulo} ${styles.espacoBarraRolagem}`}></div>}
                        </div>
                        <div className={styles.telaCadastro_lista_dados}>
                            {avaliadoresFiltrados.map((av,index)=>(
                                <div key={index} className={styles.telaCadastro_lista_dados_linha}>
                                    <div className={`${styles.c_dado} ${styles.c1_avalidador}`}>{av.s_nome_pessoa}</div>
                                    <div className={`${styles.c_dado} ${styles.c2_avalidador}`}>{av.s_email_pessoa}</div>
                                    <div className={`${styles.c_dado} ${styles.c3_avalidador}`}>{formatarTelefone(av.s_telefone_pessoa)}</div>
                                    <div className={`${styles.c_dado} ${styles.c4_avalidador}`}>{av.n_id_tipoPessoa==1?'Avaliador':av.n_id_tipoPessoa==2?'Gestor':'Root'}</div>
                                    <div className={`${styles.c_dado} ${styles.c5_avalidador} ${styles.c_comandos}`} onClick={()=>av.n_id_tipoPessoa!=3&&excluirPessoa(av.n_id_pessoa)}>
                                        {av.n_id_tipoPessoa!=3?
                                            <Image src='/assets/icons/delete.svg' alt='Excluir Avaliação' width={20} height={20} style={{cursor:"pointer"}}/>:
                                            <Image src='/assets/icons/nodelete.svg' alt='Não Excluir Avaliação' width={20} height={20} style={{opacity:0.5}}/>
                                        }
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