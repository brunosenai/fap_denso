// import styles from "@/styles/CadastroCandidado.module.css"
import styles from "@/styles/Cadastros.module.css"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { tCandidatoFap } from "@/utils/Types"
import Load from "../Load/Load"

export default function TelaCadastroCandidatos(){
    const router=useRouter()
    const [nome,setNome]=useState<string>("")
    const [cpf,setCpf]=useState<string>("")
    const [email,setEmail]=useState<string>("")
    const [candidatos,setCandidatos]=useState<tCandidatoFap[]>([])
    const [candidatosFiltrados,setCandidatosFiltrados]=useState<tCandidatoFap[]>([])
    const [filtroAvaliadores,setFiltroAvaliadores]=useState("")
    const [screenWidth, setScreenWidth]=useState<number>()
    const [load, setLoad]=useState<boolean>(false)
    
    useEffect(()=>{
        const viewportWidth: number = window.innerWidth;
        setScreenWidth(viewportWidth)
        obterCandidatos()
    },[])

    const obterCandidatos=async()=>{
        const endpoint=`/api/apiFap?action=getAllCandidatosFap_cad`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            console.log(res)
            setCandidatos(res)
            setCandidatosFiltrados(res)
        })
    }

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
                obterCandidatos()
            }
        })
    }

    // const baixaRelatorios=async(relatorios: any)=>{
    //     const listaArquivos = Array.isArray(relatorios) ? relatorios : [relatorios];
    //     console.log(listaArquivos)

    //     listaArquivos.forEach((nomeArquivo) => {
    //         if(nomeArquivo!=null){
    //             const url = `${nomeArquivo}`;
    //             console.log(url)

    //             const link = document.createElement('a');
    //             link.href = url;
    //             link.setAttribute('download', nomeArquivo);
                
    //             document.body.appendChild(link);
    //             link.click();

    //             document.body.removeChild(link);
    //         }
    //     });
    // }

    const baixaRelatorios = async (relatorios: any) => {
        const listaArquivos = Array.isArray(relatorios) ? relatorios : [relatorios];
        console.log("Arquivos originais do banco:", listaArquivos);
    
        // 1. Tira todo o "lixo" da lista (null, undefined, string vazia)
        const relatoriosValidos = listaArquivos.filter(arquivo => arquivo !== null && arquivo !== undefined && arquivo !== "");
    
        // 2. Se depois de limpar a lista não sobrar nada, avisa o usuário e para a função
        if (relatoriosValidos.length === 0) {
          alert("Ainda não há relatórios em PDF gerados para este candidato.");
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
    
            console.log("Baixando pela API:", urlCorreta);
    
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
                alert("E-mail enviado com sucesso!")
            }
        }catch(error){
            console.error("Erro ao enviar o e-mail:", error);
            alert("Ocorreu um erro ao tentar enviar o e-mail para a empresa.");
            return; 
        }finally{
            setLoad(false)
        }
    }

    return(
        <div className={styles.telaCadastroCandidatos}>
            {load == true ? (<Load></Load>) : (
                <>
                    <div className={styles.telaCadastroCandidatos_esquerda}>
                        <div className={styles.telaCadastroCandidatos_topo}>
                            <Image src='/assets/icons/novo_candidato.svg' alt='Cadastro de Candidatos' width={40} height={-1}/>
                            <h1>NOVO CANDIDATO</h1><br />
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
                                <label htmlFor={`email`}>E-Mail<span className={styles.obrigatorio}>*</span></label>
                                <input type="text" id={`email`} value={email} onChange={(e)=>setEmail(e.target.value)} />
                            </div>
                            <div className={styles.fieldForm_center}>
                                <button className="btnPadrao" onClick={()=>cadastrarCandidato()}>cadastrar novo</button>
                            </div>
                        </div>
                    </div> 
                    <div className={styles.telaCadastroCandidatos_direita}>
                        <div className={styles.telaCadastroCandidatos_lista}>
                            <div className={styles.telaCadastroCandidatos_lista_filtro}>
                                <div className={styles.fieldForm}>
                                    <input type="text" placeholder="Pesquise pelo nome do candidato" id={`filtro`}  value={filtroAvaliadores} onChange={(e)=>filtrar(e.target.value)} />
                                </div>
                            </div>                
                            <div className={styles.telaCadastroCandidatos_lista_titulos}>
                                <div className={styles.c1}>Nome</div>
                                <div className={styles.c2}>E-Mail</div>
                                <div className={styles.c3}>Relatórios</div>
                            </div>
                            <div className={styles.telaCadastroCandidatos_lista_linhas}>
                                {candidatosFiltrados.map((av,index)=>(
                                    <div key={index} className={styles.telaCadastroCandidatos_lista_l}>
                                        <div className={styles.c1}>{av.s_nome_candidato}</div>
                                        <div className={styles.c2}>{av.s_email_candidato}</div>
                                        <div className={styles.c3}>
                                            <Image src='/assets/icons/file_export.svg' alt={""} width={25} height={25} onClick={()=>{baixaRelatorios(av.relatorios)}}></Image>
                                            <Image src='/assets/icons/send_email.svg' alt={""} width={25} height={25} onClick={()=>{enviarEmail(av.relatorios)}}></Image>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div> 
                    </div>
                </>
            )}
            
            
        </div>
    )
}