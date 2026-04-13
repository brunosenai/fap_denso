import styles from "@/styles/Dashboard.module.css"
import Image from "next/image"
import { useState, useEffect } from "react"
import {formatDateToText} from  "@/utils/Utils"
import router, { useRouter } from "next/router"
import CardTopo from "./CardTopo"
import GraficoPizza from "./Charts/GraficoPizza"
import GraficoBarraDicotomica from "./Charts/GraficoBarraDicotomica"
import GraficoBarraGradual from "./Charts/GraficoBarraGradual"
import { tCandidatoFap } from "@/utils/Types"

export default function TelaDashboard(){
    const [dadosDashboard,setDadosDashboard]=useState<any>('')
    const [dashboardFilter, setDashboardFilter]=useState<string>('geral')
    const [avaliacao,setAvaliacao]=useState<any>('todas')
    const [avaliacoes,setAvaliacoes]=useState<any>('Todas')
    const [dataInicio,setDataInicio]=useState<any>('')
    const [dataFim,setDataFim]=useState<any>('')
    const [candidatos,setCandidatos]=useState<any[]>([])
    const [candidatosFiltrados,setCandidatosFiltrados]=useState<any[]>([])
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(()=>{
        obterDadosIniciais()
        obterAvaliacoes()
    },[])

    useEffect(() => {
        obterCandidatosFiltrados(true);
    }, [dashboardFilter, dataInicio, dataFim, avaliacao]);

    useEffect(() => {
        if (page > 1) {
            obterCandidatosFiltrados(false);
        }
    }, [page]);


    const obterDadosIniciais=()=>{
        const endpoint=`/api/apiDashboard`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            setDadosDashboard(res)
            setCandidatos(res.tabelaCandidatos)
            setCandidatosFiltrados(res.tabelaCandidatos)
        })
    }

    const obterAvaliacoes=()=>{
        const endpoint=`/api/apiAvaliacao?action=getAvaliacoes`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            console.log(res)
            setAvaliacoes(res)
        })
    }

    const obterCandidatosFiltrados=async (isNewFilter = false)=>{
        const currentPage = isNewFilter ? 1 : page;
        const endpoint = `/api/apiDashboard?filter=${dashboardFilter}&dataInicio=${dataInicio}&dataFim=${dataFim}&page=${currentPage}&avaliacao=${avaliacao}`;

        const res = await fetch(endpoint);
        const data = await res.json();

        if (isNewFilter) {
            setCandidatosFiltrados(data.tabelaCandidatos);
            setPage(1);
            setHasMore(true);
        } else {
            if (data.tabelaCandidatos.length === 0) {
                setHasMore(false);
                return;
            }
            setCandidatosFiltrados(prev => [...prev, ...data.tabelaCandidatos]);
        }
    }

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore) {
            setPage(prev => {
                const nextPage = prev + 1;
                return nextPage;
            });
        }
    };

    if (!dadosDashboard) {
        return <div className={styles.loading}>Carregando Dashboard...</div>
    }

    return(
        <div className={styles.telaCadastroCandidatos}>
           <div className={styles.cardTopoContainer}>
                <CardTopo  currentFilter={dashboardFilter} titulo={"CANDIDATOS AVALIADOS"} texto={dadosDashboard.cards.totalAvaliados} color={1} filter={'todos'} setDashboardFilter={setDashboardFilter}/>
                <CardTopo  currentFilter={dashboardFilter} titulo={"APROVADOS"} texto={dadosDashboard.cards.totalAprovados} color={2} filter={'aprovados'} setDashboardFilter={setDashboardFilter}/>
                <CardTopo  currentFilter={dashboardFilter} titulo={"REPROVADOS"} texto={dadosDashboard.cards.totalReprovados} color={3} filter={'reprovados'} setDashboardFilter={setDashboardFilter}/>
                <CardTopo  currentFilter={dashboardFilter} titulo={"TAXA DE APROVAÇÃO"} texto={dadosDashboard.cards.taxaAprovacao} color={4} filter="geral" setDashboardFilter={setDashboardFilter}/>
                <CardTopo  currentFilter={dashboardFilter} titulo={"TAXA DE REPROVAÇÃO"} texto={dadosDashboard.cards.taxaReprovacao} color={4} filter="geral" setDashboardFilter={setDashboardFilter}/>
           </div>
           {dashboardFilter && dashboardFilter == 'geral' && (
                <>
                    <div className={styles.cardsGraficos}>
                        <div className={styles.cardsGraficos_1}>
                            <GraficoPizza 
                                titulo="Aprovados vs Reprovados" 
                                dados={dadosDashboard.graficoPizzaGeral} 
                            />
                        </div>
                        <div className={styles.cardsGraficos_2}>
                            <GraficoBarraDicotomica dados={dadosDashboard.graficoDicotomico} />
                        </div>
                    </div>
                    <div className={styles.graficosGerais}>
                        <div className={styles.graficosGerais_legenda}>
                            <h1>LEGENDA</h1>
                            <div className={styles.graficosGerais_legendaTexto}>
                                <div className={styles.legandaContainer}>
                                    <div className={styles.legendaBox1}></div>
                                    <h5>Avançado</h5>
                                </div>
                                <div className={styles.legandaContainer}>
                                    <div className={styles.legendaBox2}></div>
                                    <h5>Adequado</h5>
                                </div >
                                <div className={styles.legandaContainer}>
                                    <div className={styles.legendaBox3}></div>
                                    <h5>Básico</h5>
                                </div>
                                <div className={styles.legandaContainer}>
                                    <div className={styles.legendaBox4}></div>
                                    <h5>Abaixo do Básico</h5>
                                </div>
                            </div>
                        </div>
                        <div className={styles.graficosGerais_desempenho}>
                            <GraficoBarraGradual dados={dadosDashboard.graficoGradual} />
                        </div>
                    </div>
                </>
           )}
           {dashboardFilter && dashboardFilter != 'geral' && (
                <>
                    <div className={styles.filterBand}>
                        Ver candidatos da avaliação 
                        <select name="avaliacao" id="avaliacao" value={avaliacao} onChange={(e) => setAvaliacao(e.target.value)}>
                            <option value="todas">Todas</option>
                            {avaliacoes && avaliacoes.map((item: any) => (
                                <option key={item.n_id_avaliacao} value={item.n_id_avaliacao}>
                                    {item.s_nome_avaliacao}
                                </option>
                            ))}
                        </select>
                        do dia  
                        <input type="date" name="" id="" value={dataInicio} onChange={(e)=>{setDataInicio(e.target.value)}} /> 
                        até 
                        <input type="date" name="" id="" value={dataFim}  onChange={(e)=>{setDataFim(e.target.value)}}/>    
                    </div>

                    <div className={styles.candidatesTable} onScroll={handleScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>CANDIDATO</th>
                                    <th>AVALIAÇÃO</th>
                                    <th>DATA</th>
                                    <th>STATUS</th>
                                    <th>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidatosFiltrados && candidatosFiltrados.length > 0 ? (
                                    candidatosFiltrados.map((candidato, index) => (
                                        <tr key={index}>
                                            <td>{candidato.nome}</td>
                                            <td>{candidato.avaliacao}</td>
                                            <td>{candidato.data}</td>
                                            <td>
                                                <span
                                                    className={`${styles.badge} ${
                                                    candidato.resultado !== 0 ? styles.aprovado : styles.reprovado
                                                    }`}
                                                >
                                                    {candidato.resultado !== 0 ? "APROVADO" : "REPROVADO"}
                                                </span>
                                            </td>
                                            <td>
                                                <Image
                                                    src="/assets/icons/file_export.svg"
                                                    alt="Ver Relatório"
                                                    width={25}
                                                    height={25}
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => candidato.relatorio && window.open(candidato.relatorio, "_blank")}
                                                />
                                                <Image
                                                    src="/assets/icons/send_email.svg"
                                                    alt="Enviar Email"
                                                    width={25}
                                                    height={25}
                                                    style={{ cursor: "pointer", marginLeft: "10px" }}
                                                    onClick={() => console.log("Enviar email para:", candidato.nome)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className={styles.noRegisters}>
                                            Nenhum candidato encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {!hasMore && <p className={styles.noRegisters}>Fim dos registros.</p>}
                    </div>
                </>
           )}
           
        </div>
    )
}