import styles from "@/styles/Cadastros.module.css"
import Image from "next/image"
import PopupConfirmation from "../Popup/PopupConfirmation"
import PopupMessage, { PopupMessageProps } from "../Popup/PopupMessage"
import InfoAvaliacao from "../InfoAvaliacao/InfoAvaliacao"
import { verifyIsTablet } from "@/utils/Utils"
import { useState, useEffect } from "react"
import { tAvaliacao, tInfoAva, tFap } from "@/utils/Types"
import {formatDateToText} from  "@/utils/Utils"
import { useRouter } from "next/router"
import EditarFapCandidato from "../EditarFapCandidato/EditarFapCandidato"
import Load from "../Load/Load"
import { get } from "http"

export default function telaCadastro(){
    const router=useRouter()
    const [nome,setNome]=useState<string>("")
    const [data,setData]=useState<string>("")
    const [avaliacoes,setAvaliacoes]=useState<tAvaliacao[]>([])
    const [avaliacoesFiltradas,setAvaliacoesFiltradas]=useState<tAvaliacao[]>([])
    const [filtroAvaliacoes,setFiltroAvaliacoes]=useState("")
    const [filtroDataIniAvaliacoes,setFiltroDataIniAvaliacoes]=useState("")
    const [filtroDataFimAvaliacoes,setFiltroDataFimAvaliacoes]=useState("")
    const [popupConfirmation,setPopupConfirmation]=useState<boolean>(false)
    const [popupMessage,setPopupMessage]=useState<boolean>(false)
    const [showInfoAvaliacao,setShowInfoAvaliacao]=useState<boolean>(false)
    const [isTablet, setIsTablet]=useState<boolean>()
    const [load,setLoad]=useState(true)
    const [mostrarHistorico,setMostrarHistorico]=useState(false)
    const [dadosPopupMessage,setDadosPopupMessage]=useState<PopupMessageProps>(
        {
            tipo:0,
            titulo:"",
            mensagem:"",
            comandoOK:() => setPopupMessage(false)
        }
    )
    const [idAvaliacaoExcluir,setIdAvaliacaoExcluir]=useState<number>(0)
    const [infoAva,setInfoAva]=useState<tInfoAva>()

    useEffect(()=>{
        setIsTablet(verifyIsTablet())
        obterAvaliacoes(mostrarHistorico)
    },[])

    const obterAvaliacoes=(historico:boolean)=>{
        setLoad(true)
        const endpoint=`/api/apiAvaliacao?action=getAvaliacoes&historico=${historico}`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            setAvaliacoes(res)
            setAvaliacoesFiltradas(res)
            setLoad(false)
        })
    }

    const getInfoAvaliacao=async(idAvaliacao:number)=>{
        setLoad(true)
        const endpoint=`/api/apiAvaliacao?action=getInfoAvaliacao&n_id_avaliacao=${idAvaliacao}`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            setInfoAva(res)
            setLoad(false)
            setShowInfoAvaliacao(true)
        })
        .finally(()=>{
            setLoad(false)
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
                obterAvaliacoes(mostrarHistorico)
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
                obterAvaliacoes(mostrarHistorico)
            }
        })
    }

    const executarFiltros = (nomeBusca: string, dataIni: string, dataFim: string) => {
        let resFiltro = avaliacoes;
        if (nomeBusca.trim() !== "") {
            resFiltro = resFiltro.filter(a => 
                a.s_nome_avaliacao.toLowerCase().includes(nomeBusca.toLowerCase())
            );
        }
        if (dataIni.trim() !== "") {
            const dataInicioObjeto = new Date(dataIni);
            resFiltro = resFiltro.filter(a => {
                const dataAvaliacao = new Date(a.dt_data_avaliacao);
                return dataAvaliacao >= dataInicioObjeto;
            });
        }
        if (dataFim.trim() !== "") {
            const dataFimObjeto = new Date(dataFim);
            resFiltro = resFiltro.filter(a => {
                const dataAvaliacao = new Date(a.dt_data_avaliacao);
                return dataAvaliacao <= dataFimObjeto;
            });
        }
        setAvaliacoesFiltradas(resFiltro);
    }

    const filtrar = (filtro: string) => {
        setFiltroAvaliacoes(filtro);
        executarFiltros(filtro, filtroDataIniAvaliacoes, filtroDataFimAvaliacoes);
    }

    const filtrarDatas = () => {
        executarFiltros(filtroAvaliacoes, filtroDataIniAvaliacoes, filtroDataFimAvaliacoes);
    }

    const limparFiltros = () => {
        setFiltroAvaliacoes("");
        setFiltroDataIniAvaliacoes("");
        setFiltroDataFimAvaliacoes("");
        setAvaliacoesFiltradas(avaliacoes);
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

    // const obterCheckboxSelecionados=()=>{
    //     const cb=document.querySelectorAll("input[type='checkbox']:checked")
    //     return Array.from(cb).slice(1);
    // }

    const obterCheckboxSelecionados=()=>{
        const cb=document.querySelectorAll<HTMLInputElement>("input[type='checkbox']:checked");
        const tcb=Array.from(cb)
        if(tcb.length==0)
            return []
        const tcbfix=tcb[0].id=='checkboxTodos'?tcb.slice(1):tcb
        return tcbfix
    }

    const obterTodosCheckbox=()=>{
        const cb=document.querySelectorAll<HTMLInputElement>("input[type='checkbox']");
        const tcb=Array.from(cb)
        const tcbfix=tcb[0].id=='checkboxTodos'?tcb.slice(1):tcb
        return tcbfix
    }

    const selecionarTodos=(cb:HTMLInputElement)=>{
        if(cb.checked){
            const todosCb=obterTodosCheckbox()
            todosCb.forEach((c)=>{
                c.checked=true
            })
        }else{
            const todosCb=obterTodosCheckbox()
            todosCb.forEach((c)=>{
                c.checked=false
            })
        }
    }

    const obterIdsAvaliacoesSelecionadas=()=>{
        const cbSelecionados=obterCheckboxSelecionados()
        const idsSelecionados=cbSelecionados.map((cb)=>{
            return parseInt(cb.id)
        })
        return idsSelecionados
    }

    // const gerarEnviarRelatoriosEmail=()=>{
    //     const ids=obterIdsAvaliacoesSelecionadas()
    //     console.log(ids)
    // }

    const gerarEnviarRelatoriosEmail = async () => {
        const ids = obterIdsAvaliacoesSelecionadas();
        
        if (ids.length === 0) {
            setDadosPopupMessage({
                tipo: 3,
                titulo: "Aviso",
                mensagem: "Selecione pelo menos uma avaliação na lista.",
                comandoOK: () => setPopupMessage(false)
            });
            setPopupMessage(true);
            return;
        }

        setLoad(true);
        try {
            const endpoint = `/api/apiGerarRelatoriosTurma`;
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids_avaliacoes: ids })
            });

            if (response.status !== 200) {
                throw new Error("Falha ao gerar relatórios");
            }

            setDadosPopupMessage({
                tipo: 1, // Sucesso
                titulo: "Sucesso",
                mensagem: "Os relatórios foram gerados, compactados e enviados por e-mail com sucesso!",
                comandoOK: () => setPopupMessage(false)
            });
        } catch (error) {
            console.error(error);
            setDadosPopupMessage({
                tipo: 3, // Erro
                titulo: "Erro",
                mensagem: "Ocorreu um erro no servidor ao gerar e enviar os relatórios.",
                comandoOK: () => setPopupMessage(false)
            });
        } finally {
            obterAvaliacoes(mostrarHistorico)
            setLoad(false); // Desliga o loading
            setPopupMessage(true); // Mostra o popup de sucesso ou erro
        }
    }

    const controleMostrarHistorico=(evt:boolean)=>{
        setMostrarHistorico(evt)
        obterAvaliacoes(evt)
    }

    return(
        <>
            {load&&<Load/>}
            {popupMessage&&<PopupMessage tipo={dadosPopupMessage.tipo} titulo={dadosPopupMessage.titulo} mensagem={dadosPopupMessage.mensagem} comandoOK={dadosPopupMessage.comandoOK}/>}
            {popupConfirmation&&<PopupConfirmation titulo="Excluir" mensagem="Esta avaliação será excluída!" pergunta="Confirma exclusão da avaliação?" comandoSim={comandoSim} comandoNao={comandoNao}/>}
            {showInfoAvaliacao&&<InfoAvaliacao comandoFechar={setShowInfoAvaliacao} infoAva={infoAva}/>}
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
                        <div className={styles.telaCadastro_lista_comandos}>
                            <div className={styles.telaCadastro_lista_comandos_field}>
                                Mostrar Avaliações já realizadas
                                <input type="checkbox" id={`checkboxTodos`} onChange={(e)=>{controleMostrarHistorico(e.target.checked)}} />
                            </div>
                        </div>
                        <div className={styles.telaCadastro_lista_filtro}>
                            <div className={styles.telaCadastro_area_filtro_c1}>
                                <input type="text" placeholder="Pesquise pelo nome da avaliação" id={`filtro`} value={filtroAvaliacoes} onChange={(e)=>filtrar(e.target.value)} />
                            </div>
                            <div className={styles.telaCadastro_area_filtro_c2}>
                                <input type="datetime-local" id={`filtroDataIni`} value={filtroDataIniAvaliacoes} onChange={(e)=>setFiltroDataIniAvaliacoes(e.target.value)} />
                                <input type="datetime-local" id={`filtroDataFim`} value={filtroDataFimAvaliacoes} onChange={(e)=>setFiltroDataFimAvaliacoes(e.target.value)} />
                                <div className={styles.btnPesquisa} onClick={()=>filtrarDatas()} title="Filtrar por Datas">
                                    <Image src='/assets/icons/search_w.svg' alt='Excluir Avaliação' width={20} height={-1}/>
                                </div>
                                <div className={styles.btnPesquisa} onClick={()=>limparFiltros()} title="Limpar Filtros">
                                    <Image src='/assets/icons/search_off_w.svg' alt='Excluir Avaliação' width={20} height={-1}/>
                                </div>
                                <div className={styles.btnPesquisa} onClick={()=>gerarEnviarRelatoriosEmail()} title="Gerar relatórios e enviar por email">
                                    <Image src='/assets/icons/report_w.svg' alt='Gerar relatórios' width={20} height={-1}/>
                                    <Image src='/assets/icons/mail_w.svg' alt='Enviar relatórios por email' width={20} height={-1}/>
                                </div>                                                               
                            </div>
                        </div>
                        <div className={styles.telaCadastro_lista_titulos}>
                            <div className={`${styles.c_titulo} ${styles.c1} ${styles.c_center}`}>
                                <input type="checkbox" id={`checkboxTodos`} onChange={(e)=>{selecionarTodos(e.target)}} />
                            </div>
                            <div className={`${styles.c_titulo} ${styles.c2}`}>Nome Avaliação</div>
                            <div className={`${styles.c_titulo} ${styles.c3}`}>Data Avaliação</div>
                            <div className={`${styles.c_titulo} ${styles.c4} ${styles.c_center}`}>
                                <div>st</div>
                                <Image src='/assets/icons/delete_w.svg' alt='Excluir Avaliação' width={20} height={-1}/>
                                <Image src='/assets/icons/info_w.svg' alt='Informações Avaliação' width={20} height={-1}/>
                            </div>
                            {!isTablet&&<div className={`${styles.c_titulo} ${styles.espacoBarraRolagem}`}></div>}
                        </div>
                        <div className={styles.telaCadastro_lista_dados}>
                            {avaliacoesFiltradas.map((avaliacao,index)=>(
                                <div key={index} className={styles.telaCadastro_lista_dados_linha}>
                                    <div className={`${styles.c_dado} ${styles.c1} ${styles.c_center}`}>
                                        {avaliacao.n_status_avaliacao==1&&<input type="checkbox" id={`${avaliacao.n_id_avaliacao}`} onChange={(e)=>{}} />}
                                    </div>
                                    <div className={styles.c2}>{avaliacao.s_nome_avaliacao}</div>
                                    <div className={styles.c3}>{formatDateToText(avaliacao.dt_data_avaliacao)}</div>
                                    <div className={`${styles.c_dado} ${styles.c4} ${styles.c_center} ${styles.cursorPointer}`}>
                                        <Image src={
                                            avaliacao.n_status_avaliacao==0?'/assets/icons/wait.svg':
                                            avaliacao.n_status_avaliacao==1?'/assets/icons/check.svg':'/assets/icons/done_b.svg'
                                        } alt='Status da Avaliação' title={
                                            avaliacao.n_status_avaliacao==0?'Avaliação ainda não foi realizada':
                                            avaliacao.n_status_avaliacao==1?'Avaliação realizada, porém relatórios ainda não foram gerados e enviados':'Relatórios gerados e enviados'
                                        } width={20} height={20} className={styles.iconEditar}/>
                                        <Image src='/assets/icons/delete.svg' alt='Excluir Avaliação' width={20} height={20} className={styles.iconEditar} onClick={()=>comandoExcluir(avaliacao.n_id_avaliacao)}/>
                                        <Image src='/assets/icons/info.svg' alt='Mostrar Informações' width={20} height={20} className={styles.iconEditar} onClick={()=>getInfoAvaliacao(avaliacao.n_id_avaliacao)}/>
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