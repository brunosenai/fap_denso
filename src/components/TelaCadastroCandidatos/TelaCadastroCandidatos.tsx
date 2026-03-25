import styles from "@/styles/CadastroCandidado.module.css"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

export default function TelaCadastroCandidatos(){
    const router=useRouter()
    const [nome,setNome]=useState<string>("")
    const [cpf,setCpf]=useState<string>("")
    const [email,setEmail]=useState<string>("")
    const [screenWidth, setScreenWidth]=useState<number>()
    
    useEffect(()=>{
        const viewportWidth: number = window.innerWidth;
        setScreenWidth(viewportWidth)
    },[])

    const cadastrarCandidato=async()=>{
        if(nome.trim()=="" || cpf.trim()=="" || email.trim()==""){
            alert("Preencha todos os campos obrigatórios!")
            return
        }
        const endpoint=`/api/apiCandidato`
        fetch(endpoint,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                s_nome_candidato:nome,
                s_cpf_candidato:cpf,
                s_email_candidato:email
            })
        })
        .then(res=>{
            if(res.status!=200){
                alert("Erro ao gravar avaliação!")
            }else{
                alert("Candidato Cadastrado com sucesso")
                setNome("")
                setCpf("")
                setEmail("")
            }
        })
    }

    return(
        <div className={styles.telaCadastroCandidatos}>
            <div className={styles.telaCadastroCandidatos_topo}>
                
                {screenWidth && screenWidth >= 1351 && (
                    <Image src='/assets/icons/novo_candidato.svg' alt='Cadastro de Candidatos' width={110} height={110}/>
                ) }
                {screenWidth && screenWidth <= 1350 && (
                    <Image src='/assets/icons/novo_candidato.svg' alt='Cadastro de Candidatos' width={133} height={133}/>
                ) }
            </div>
            <div className={styles.telaCadastroCandidatos_form}>
                <h1>NOVO CANDIDATO</h1><br />
                <div className={styles.fieldForm}>
                    <label htmlFor={`nome`}>Nome Completo<span className={styles.obrigatorio}>*</span></label>
                    <input type="text" id={`nome`} value={nome} onChange={(e)=>setNome(e.target.value)} />
                </div>
                <div className={styles.fieldForm}>
                    <label htmlFor={`cpf`}>CPF<span className={styles.obrigatorio}>*</span></label>
                    <input type="text" id={`cpf`} value={cpf} onChange={(e)=>setCpf(e.target.value)} />
                </div>
                <div className={styles.fieldForm}>
                    <label htmlFor={`email`}>E-Mail<span className={styles.obrigatorio}>*</span></label>
                    <input type="text" id={`email`} value={email} onChange={(e)=>setEmail(e.target.value)} />
                </div>
                {/* <div className={styles.fieldForm}>
                    <label htmlFor={`avaliacao`}>Avaliação<span className={styles.obrigatorio}>*</span></label>
                    <select title='avaliacoes' value={avaliacao} onChange={(evt)=>setAvaliacao(evt.target.value)}>
                        <option value="">Selecione a avaliação</option>
                        {avaliacoes.map((avaliacao:tAvaliacao,index)=>(
                            <option key={index} value={avaliacao.n_id_avaliacao}>{avaliacao.s_nome_avaliacao}</option>
                        ))}
                    </select>
                </div> */}
                <div className={styles.fieldForm_center}>
                    <button className="btnPadrao" onClick={()=>cadastrarCandidato()}>cadastrar novo</button>
                </div>
            </div>
            <div className={styles.telaCadastroCandidatos_rodape}>
                <button className="btnPadrao_claro" onClick={()=>router.replace('/')}>Sair</button>
            </div>
        </div>
    )
}