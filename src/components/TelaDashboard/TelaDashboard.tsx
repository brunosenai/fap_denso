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
import GraficoRadialReprovados from "./Charts/GraficoRadialReprovados"

export default function TelaDashboard(){
    const [dadosDashboard,setDadosDashboard]=useState<any>('')
    const [dashboardFilter, setDashboardFilter]=useState<string>('geral')
    const [avaliacao,setAvaliacao]=useState<any>('todas')
    const [avaliacoes,setAvaliacoes]=useState<any>('Todas')
    const [dataInicio,setDataInicio]=useState<any>('')
    const [dataFim,setDataFim]=useState<any>('')
    const [candidatos,setCandidatos]=useState<any[]>([])
    const [candidatosFiltrados,setCandidatosFiltrados]=useState<any[]>([])
    const [ isLoading, setIsLoading]=useState<boolean>(false)
    const [ showFilter, setShowFilter]=useState<boolean>(false)
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    useEffect(() => {
        obterAvaliacoes();
    }, []);

    useEffect(() => {
        obterCandidatosFiltrados(true);
    }, [dashboardFilter, dataInicio, dataFim, avaliacao]);

    useEffect(() => {
        if (page > 1) {
            obterCandidatosFiltrados(false);
        }
    }, [page]);


    const obterAvaliacoes = () => {
        setIsLoading(true); 
        const endpoint = `/api/apiAvaliacao?action=getAvaliacoes&historico=true&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`
        
        fetch(endpoint)
            .then(res => res.json())
            .then(res => {
                setAvaliacoes(res)
            })
            .catch(error => {
                console.error("Erro ao obter avaliações:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const obterCandidatosFiltrados = async (isNewFilter = false) => {
        setIsLoading(true); 
        const currentPage = isNewFilter ? 1 : page;
        const endpoint = `/api/apiDashboard?filter=${dashboardFilter}&dataInicio=${dataInicio}&dataFim=${dataFim}&page=${currentPage}&avaliacao=${avaliacao}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;

        try {
            const res = await fetch(endpoint);
            const data = await res.json();
            
            setDadosDashboard(data); 

            if (isNewFilter) {
                setCandidatosFiltrados(data.tabelaCandidatos);
                setPage(1);
                setHasMore(true);
            } else {
                if (data.tabelaCandidatos.length === 0) {
                    setHasMore(false);
                } else {
                    setCandidatosFiltrados(prev => [...prev, ...data.tabelaCandidatos]);
                }
            }
        } catch (error) {
            console.error("Erro ao obter candidatos filtrados:", error);
        } finally {
            setIsLoading(false);
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

    const exportarPlanilha = async () => {
        const endpoint = `/api/apiDashboard?filter=${dashboardFilter}&dataInicio=${dataInicio}&dataFim=${dataFim}&avaliacao=${avaliacao}&isExport=true&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
        
        try {
            const res = await fetch(endpoint);
            const data = await res.json();
            const candidatos = data.tabelaCandidatos;

            let csvContent = "Nome;Avaliacao;CPF;email;Data;Resultado\n";
            candidatos.forEach((c: any) => {
                csvContent += `${c.nome};${c.avaliacao};${c.cpf};${c.email};${c.data};${c.resultado !== 0 ? "APROVADO" : "REPROVADO"}\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `exportacao_candidatos_${new Date().toLocaleDateString()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Erro ao exportar:", error);
            alert("Erro ao gerar planilha");
        }
    };

    const limparFiltros = () => {
        setDashboardFilter('todos');
        setAvaliacao('todas');      
        setDataInicio('');          
        setDataFim('');         
        setPage(1);               
    };

    if (!dadosDashboard) {
        return (
            <div className={styles.fullScreenLoading}>
                <img 
                    src="/assets/stellantis_logo.png" 
                    alt="Carregando Dashboard..." 
                    className={styles.pulsingLogo} 
                />
            </div>
        );
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
           <div 
                className={`${styles.filterButton} ${showFilter ? styles.filterButtonActive : ''}`} 
                onClick={() => setShowFilter(!showFilter)}
            >
                <Image 
                    src={showFilter ? "assets/icons/arrow_back.svg" : "assets/icons/filter_white.svg"} 
                    alt={"Filtros"} 
                    width={20} 
                    height={20} 
                />
            </div>
            <div className={`${styles.sidebarFilter} ${showFilter ? styles.active : ''}`}>
                    <div className={styles.sidebarHeader}>
                        <h3>Filtros</h3>
                    </div>
                    <div className={styles.sidebarContent}>
                        <label>Ver candidatos da avaliação</label>
                        <select value={avaliacao} onChange={(e) => setAvaliacao(e.target.value)}>
                            <option value="todas">Todas</option>
                            {avaliacoes && avaliacoes.map((item: any) => (
                                <option key={item.n_id_avaliacao} value={item.n_id_avaliacao}>
                                    {item.s_nome_avaliacao}
                                </option>
                            ))}
                        </select>
                        <label>Do dia</label>
                        <input type="date" name="" title="dtini" id="dtini" value={dataInicio} onChange={(e)=>{setDataInicio(e.target.value)}} /> 
                            <p>Até</p>
                        <input type="date" name="" title="dtfim" id="dtfim" value={dataFim}  onChange={(e)=>{setDataFim(e.target.value)}}/> 

                        <div className={styles.sidebarActions}>
                            <button onClick={limparFiltros} className={styles.exportButton}>Limpar</button>
                            <button onClick={exportarPlanilha} className={styles.exportButton}>Exportar CSV</button>
                        </div>
                    </div>
            </div>
            {showFilter && <div className={styles.overlay} onClick={() => setShowFilter(false)} />}
            <div key={dashboardFilter} className={styles.fadeContext}>
                {dashboardFilter && dashboardFilter == 'geral' ? (
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
                                <GraficoRadialReprovados dados={dadosDashboard.graficoMotivosReprovacao} titulo={""} />
                            </div>
                            <div className={styles.graficosGerais_desempenho}>
                                <GraficoBarraGradual dados={dadosDashboard.graficoGradual} />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.candidatesTable} onScroll={handleScroll}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>CANDIDATO</th>
                                        <th>AVALIAÇÃO</th>
                                        <th>DATA</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} style={{ 
                                                borderBottom: 'none', 
                                                padding: 0
                                            }}>
                                                <div className={styles.loadingContainer}>
                                                    <img 
                                                        src="/assets/stellantis_logo.png" 
                                                        alt="Carregando..." 
                                                        className={styles.pulsingLogo} 
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : candidatosFiltrados && candidatosFiltrados.length > 0 ? (
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
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className={styles.noRegisters}>
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
        </div>
    )
}