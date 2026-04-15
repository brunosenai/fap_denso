// import styles from "@/styles/Cadastrocandidato.module.css"
import styles from "@/styles/Cadastros.module.css"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { tCandidatoFap } from "@/utils/Types"
import { verifyIsTablet } from "@/utils/Utils"
import Load from "../Load/Load"
import PopupMessage, { PopupMessageProps } from "../Popup/PopupMessage"

export default function TelaCadastroCandidatos(){
    const router=useRouter()
    const [nome,setNome]=useState<string>("")
    const [cpf,setCpf]=useState<string>("")
    const [email,setEmail]=useState<string>("")
    const [candidatos,setCandidatos]=useState<tCandidatoFap[]>([])
    const [candidatosFiltrados,setCandidatosFiltrados]=useState<tCandidatoFap[]>([])
    const [filtroAvaliadores,setFiltroAvaliadores]=useState("")
    const [isTablet, setIsTablet]=useState<boolean>()
    const [load, setLoad]=useState<boolean>(false)
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
        obterCandidatos()
    },[])

    const obterCandidatos=async()=>{
        const endpoint=`/api/apiFap?action=getAllCandidatosFap_cad`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            setCandidatos(res)
            setCandidatosFiltrados(res)
        })
    }

    const cadastrarCandidato=async()=>{
        if(nome.trim()=="" || cpf.trim()=="" || email.trim()==""){
            setDadosPopupMessage({
                tipo:3,
                titulo:"Erro",
                mensagem:"Preencha todos os campos obrigatórios!",
                comandoOK:() => setPopupMessage(false)
            })
            setPopupMessage(true)
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
                setDadosPopupMessage({
                    tipo:3,
                    titulo:"Erro",
                    mensagem:"Erro ao gravar avaliação!",
                    comandoOK:() => setPopupMessage(false)
                })
                setPopupMessage(true)
            }else{
                setDadosPopupMessage({
                    tipo:1,
                    titulo:"Sucesso",
                    mensagem:"Candidato Cadastrado com sucesso",
                    comandoOK:() => setPopupMessage(false)
                })
                setPopupMessage(true)
                setNome("")
                setCpf("")
                setEmail("")
                obterCandidatos()
            }
        })
    }

    const baixaRelatorios = async (relatorios: any) => {
        const listaArquivos = Array.isArray(relatorios) ? relatorios : [relatorios];

        const relatoriosValidos = listaArquivos.filter(arquivo => arquivo !== null && arquivo !== undefined && arquivo !== "");
        if (relatoriosValidos.length === 0) {
          setDadosPopupMessage({
            tipo:2,
            titulo:"Alerta",
            mensagem:"Ainda não há relatórios em PDF gerados para este candidato.",
            comandoOK:() => setPopupMessage(false)
        })
        setPopupMessage(true)
          return;
        }
    
        // 3. Se passou pela trava, baixa os relatórios válidos
        relatoriosValidos.forEach((nomeArquivo) => {
            let urlCorreta = nomeArquivo;
    
            if (urlCorreta.includes('/relatorios/')) {
                urlCorreta = urlCorreta.replace('/relatorios/', '/api/downloadPdf?file=');
            } else if (!urlCorreta.includes('/api/downloadPdf')) {
                urlCorreta = `/api/downloadPdf?file=${urlCorreta}`;
            }
       
            const nomePuroParaDownload = urlCorreta.split('file=')[1] || 'relatorio_fap.pdf';
    
            const link = document.createElement('a');
            link.href = urlCorreta;
            link.setAttribute('target', '_blank'); 
            link.setAttribute('download', nomePuroParaDownload);
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }  

    const filtrar=(filtro:string)=>{
        setFiltroAvaliadores(filtro)
        const resFiltro=candidatos.filter((a,i)=>{
            return a.s_nome_candidato.toLowerCase().includes(filtro.toLowerCase())
        })
        setCandidatosFiltrados(resFiltro)
    }

    const enviarEmail=async (relatorios: any)=>{
        const listaArquivos = Array.isArray(relatorios) ? relatorios : [relatorios];
        const relatoriosValidos = listaArquivos.filter(arquivo => arquivo !== null && arquivo !== undefined && arquivo !== "");
        if (relatoriosValidos.length === 0) {
          setDadosPopupMessage({
            tipo:2,
            titulo:"Alerta",
            mensagem:"Ainda não há relatórios em PDF gerados para este candidato.",
            comandoOK:() => setPopupMessage(false)
            })
            setPopupMessage(true)
            return;
        }

        try{
            setLoad(true)
            const emailEndpoint = `/api/apiEnviarEmail`;
            const responseEmail = await fetch(emailEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assunto: `Relatórios FAP - Avaliação Concluída (${new Date().toLocaleDateString()})`,
                    arquivos: relatorios
                })
            })
            if (!responseEmail.ok) {
                throw new Error("Falha na resposta da API de e-mail");
            }else{
                setDadosPopupMessage({
                    tipo:1,
                    titulo:"Sucesso",
                    mensagem:"E-mail enviado com sucesso!",
                    comandoOK:() => setPopupMessage(false)
                })
                setPopupMessage(true)
            }
        }catch(error){
            console.error("Erro ao enviar o e-mail:", error);
            setDadosPopupMessage({
                tipo:3,
                titulo:"Erro",
                mensagem:"Ocorreu um erro ao tentar enviar o e-mail para a empresa.",
                comandoOK:() => setPopupMessage(false)
            })
            setPopupMessage(true)            
            return; 
        }finally{
            setLoad(false)
        }
    }

    return(
        <>
            {load&&<Load/>}
            {popupMessage&&<PopupMessage tipo={dadosPopupMessage.tipo} titulo={dadosPopupMessage.titulo} mensagem={dadosPopupMessage.mensagem} comandoOK={dadosPopupMessage.comandoOK}/>}
            <div className={styles.telaCadastro}>
                <div className={styles.telaCadastro_sessao1}>
                    <div className={styles.telaCadastro_topo}>
                        <Image src='/assets/icons/novo_candidato.svg' alt='Cadastro de Candidatos' width={40} height={-1}/>
                        <h1>NOVO CANDIDATO</h1><br />
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
                            <label htmlFor={`email`}>E-Mail<span className={styles.obrigatorio}>*</span></label>
                            <input type="text" id={`email`} value={email} onChange={(e)=>setEmail(e.target.value)} />
                        </div>
                        <div className={styles.fieldForm_center}>
                            <button className={styles.btnPadrao} onClick={()=>cadastrarCandidato()}>cadastrar novo</button>
                        </div>
                    </div>
                </div> 
                <div className={styles.telaCadastro_sessao2}>
                    <div className={styles.telaCadastro_lista}>
                        <div className={styles.telaCadastro_lista_filtro}>
                            <div className={styles.fieldForm}>
                                <input type="text" placeholder="Pesquise pelo nome do candidato" id={`filtro`}  value={filtroAvaliadores} onChange={(e)=>filtrar(e.target.value)} />
                            </div>
                        </div>                
                        <div className={styles.telaCadastro_lista_titulos}>
                            <div className={`${styles.c_titulo} ${styles.c1_candidato}`}>Nome</div>
                            <div className={`${styles.c_titulo} ${styles.c2_candidato}`}>E-Mail</div>
                            <div className={`${styles.c_titulo} ${styles.c3_candidato} ${styles.c_comandos}`}>
                                <Image src='/assets/icons/file_export_w.svg' alt={""} width={25} height={25}></Image>
                                <Image src='/assets/icons/mail_w.svg' alt={""} width={25} height={25}></Image>
                            </div>
                            {!isTablet&&<div className={`${styles.c_titulo} ${styles.espacoBarraRolagem}`}></div>}
                        </div>
                        <div className={styles.telaCadastro_lista_dados}>
                            {candidatosFiltrados.map((av,index)=>(
                                <div key={index} className={styles.telaCadastro_lista_dados_linha}>
                                    <div className={`${styles.c_dado} ${styles.c1_candidato}`}>{av.s_nome_candidato}</div>
                                    <div className={`${styles.c_dado} ${styles.c2_candidato}`}>{av.s_email_candidato}</div>
                                    <div className={`${styles.c_dado} ${styles.c3_candidato} ${styles.c_comandos}`}>
                                        <Image src={`${Array.isArray(av.relatorios) && av.relatorios.length > 0 && av.relatorios[0] !== 'null' && av.relatorios[0] !== null?'/assets/icons/file_export.svg':'/assets/icons/nofile_r.svg'}`} alt={""} width={25} height={25} onClick={()=>{baixaRelatorios(av.relatorios)}}></Image>
                                        <Image src={`${Array.isArray(av.relatorios) && av.relatorios.length > 0 && av.relatorios[0] !== 'null' && av.relatorios[0] !== null?'/assets/icons/mail.svg':'/assets/icons/nomail_r.svg'}`} alt={""} width={25} height={25} onClick={()=>{enviarEmail(av.relatorios)}}></Image>
                                        {/* <Image src='/assets/icons/mail.svg' alt={""} width={25} height={25} onClick={()=>{enviarEmail(av.relatorios)}}></Image> */}
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