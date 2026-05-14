import styles from "@/styles/Analytics.module.css"
import Image from "next/image";
import Load from "../Load/Load";
import { useState } from "react";

export interface AnalyticsProps {
    comandoFechar: (f:boolean) => void;
}

interface AnalyticsData {
    data_evento:string
    total_avaliados:number
    total_aprovados:number
    total_reprovados:number
}

interface DadosSemana {
    total_avaliados: number;
    total_aprovados: number;
    total_reprovados: number;
}

export default function Analytics(props:AnalyticsProps) {
    const [load,setLoad]=useState(true)
    const [dtini,setDtini]=useState('')
    const [dtfim,setDtfim]=useState('')
    const [analyticsData,setAnalyticsData]=useState<AnalyticsData[]>([])
    const [totalCandidatos,setTotalCandidatos]=useState(0)
    const [totalAprovados,setTotalAprovados]=useState(0)
    const [totalReprovados,setTotalReprovados]=useState(0)
    const [lisagemSemanas, setListagemSemanas] = useState<{[key: string]: DadosSemana}>({});
    const [aprovacoesMasculinas,setAprovacoesMasculinas]=useState(0)
    const [aprovacoesFemininas,setAprovacoesFemininas]=useState(0)
    const [aprovadosMasculinos,setAprovadosMasculinos]=useState(0)
    const [aprovadosFemininos,setAprovadosFemininos]=useState(0)
    const [diaSemanaMaisAprova,setDiaSemanaMaisAprova]=useState('-')
    const [faixaEtariaMaiorAprova,setFaixaEtariaMaiorAprova]=useState('-')

    const getAnalytics = async (dtini: string, dtfim: string) => {
        try {
            const endpoint = `/api/apiAvaliacao?action=getAnalyticsEntreDatas&dtini=${dtini}&dtfim=${dtfim}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
            const res = await fetch(endpoint);
            const data = await res.json();
    
            // Como a query retorna sempre 1 linha, pegamos o índice [0]
            if (data && data.length > 0) {
                console.log(data)
                setAprovacoesMasculinas(data[0].composicao_aprovados_masculina || 0);
                setAprovacoesFemininas(data[0].composicao_aprovados_feminina || 0);
                setAprovadosFemininos(data[0].taxa_sucesso_feminina || 0);
                setAprovadosMasculinos(data[0].taxa_sucesso_masculina || 0);
                setDiaSemanaMaisAprova(data[0].melhor_dia_semana || "N/A");
                setFaixaEtariaMaiorAprova(data[0].melhor_faixa_etaria || "N/A");
            }
        } catch (err) {
            console.error("Erro ao buscar analytics avançado:", err);
        }
    }

    const getAvaliacoes=async(dtini:string,dtfim:string)=>{
        setLoad(true)
        getAnalytics(dtini,dtfim)
        const endpoint=`/api/apiAvaliacao?action=getAvaliacoesEntreDatas&dtini=${dtini}&dtfim=${dtfim}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            setAnalyticsData(res)
            setTotalCandidatos(totalCandidatosAvalidados(res))
            setTotalAprovados(totalCandidatosAprovados(res))
            setTotalReprovados(totalCandidatosReprovados(res))
            setListagemSemanas(listarPorSemana(res))
            console.log(listarPorSemana(res))
            setLoad(false)
        })
        .finally(()=>{
            setLoad(false)
        })
    }

    const totalCandidatosAvalidados=(ad: AnalyticsData[])=>{
        let total=0
        ad.forEach((item)=>{
            total+=Number(item.total_avaliados)
        })
        return total
    }

    const totalCandidatosAprovados=(ad: AnalyticsData[])=>{
        let total=0
        ad.forEach((item)=>{
            total+=Number(item.total_aprovados)
        })
        return total
    }

    const totalCandidatosReprovados=(ad: AnalyticsData[])=>{
        let total=0
        ad.forEach((item)=>{
            total+=Number(item.total_reprovados)
        })
        return total
    }

    const getWeekNumber=(date:Date)=>{
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    const listarPorSemana = (ad: AnalyticsData[]) => {
        const semanas: { [key: string]: DadosSemana } = {}
        
        ad.forEach((item) => {
            const data = new Date(item.data_evento)
            const ano = data.getFullYear()
            const semana = getWeekNumber(data)
            const chave = `${ano}-S${semana}`
    
            // Converter para número uma única vez para evitar repetição
            const avaliados = Number(item.total_avaliados)
            const aprovados = Number(item.total_aprovados)
            const reprovados = Number(item.total_reprovados)
    
            if (semanas[chave]) {
                semanas[chave].total_avaliados += avaliados
                semanas[chave].total_aprovados += aprovados
                semanas[chave].total_reprovados += reprovados
            } else {
                semanas[chave] = {
                    total_avaliados: avaliados,
                    total_aprovados: aprovados,
                    total_reprovados: reprovados
                }
            }
        })
        return semanas
    }

    return (
        <>
            <div className={styles.analytics}>
                <div className={styles.analytics_conteudo}>
                    <div className={styles.analytics_conteudo_titulo}style={{ position: 'relative' }}>
                        Analytics - Avaliações
                    </div>
                    <div className={styles.analytics_conteudo_corpo}>
                        <div className={styles.analytics_conteudo_corpo_area}>
                            <h1>Seleção de período</h1>
                            <div className={styles.analytics_conteudo_corpo_area_col}>
                                <div className={styles.analytics_conteudo_corpo_area_field}>
                                    <label>De:</label>
                                    <input className={styles.input} type="date" title="Data de início" name="data_inicio" id="data_inicio" onChange={(e)=>{setDtini(e.target.value)}}/>
                                </div>
                                <div className={styles.analytics_conteudo_corpo_area_field}>
                                    <label>Até:</label>
                                    <input className={styles.input} type="date" title="Data de fim" name="data_fim" id="data_fim"  onChange={(e)=>{setDtfim(e.target.value)}}/>
                                </div>   
                                <button className={styles.btnFiltro} title="Filtrar" onClick={()=>{getAvaliacoes(dtini,dtfim)}}>
                                    <Image src='/assets/icons/filter_w.svg' alt='Pesquisar Avaliação' width={20} height={20}/>
                                </button>
                            </div>
                        </div> 
                        <div className={styles.analytics_conteudo_corpo_area}>
                            <h1>Candidatos Avaliados</h1>
                            <div className={styles.analytics_conteudo_corpo_area_linhas}>
                                <div className={styles.analytics_conteudo_corpo_area_field_spaceBetween}>
                                    <div><span>Total: {totalCandidatos}</span></div>
                                    <div><span>Aprovados: {totalAprovados}</span></div>
                                    <div><span>Reprovados: {totalReprovados}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.analytics_conteudo_corpo_area}>
                            <h1>Analytics</h1>
                            <div className={styles.analytics_conteudo_corpo_area_linhas}>
                                <div className={styles.analytics_conteudo_corpo_area_field_spaceBetween_analytics}>
                                    <div><span>Aprovações masculinas: {aprovacoesMasculinas}%</span></div>
                                    <div><span>Aprovações femininas: {aprovacoesFemininas}%</span></div>
                                    <div><span>Composição Aprovação masculino: {aprovadosMasculinos}%</span></div>
                                    <div><span>Composição Aprovação feminina: {aprovadosFemininos}%</span></div>
                                </div>
                                <div className={styles.analytics_conteudo_corpo_area_field_spaceBetween_analytics}>
                                    <div><span>Dia da semana que mais aprova: {diaSemanaMaisAprova}</span></div>
                                    <div><span>Faixa Etária com maior aprovação: {faixaEtariaMaiorAprova}</span></div>
                                </div>                                
                            </div>
                        </div>                        
                        <div className={styles.analytics_conteudo_corpo_area2}>
                            <h1>Listagem por semanas</h1>
                            <div className={styles.analytics_conteudo_corpo_area_linhas}>
                                {Object.keys(lisagemSemanas).map((semana) => (
                                    <div key={semana} className={styles.analytics_conteudo_corpo_area_field_spaceBetween}>
                                        <div style={{fontWeight: 'bold'}}>{semana}</div>
                                        <div>Total: {lisagemSemanas[semana].total_avaliados}</div>
                                        <div>Aprovados: {lisagemSemanas[semana].total_aprovados}</div>
                                        <div>Reprovados: {lisagemSemanas[semana].total_reprovados}</div>
                                    </div>
                                ))}
                            </div>
                        </div>                        
                    </div>
                    <div className={styles.analytics_conteudo_rodape}>
                        <button className={styles.analytics_btn} onClick={()=>props.comandoFechar(false)}>fechar</button>
                    </div>
                </div>
            </div>
        </>
    );
}