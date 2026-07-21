import styles from "@/styles/Dashboard.module.css"
import Image from "next/image"
import { useState, useEffect } from "react"
import * as XLSX from "xlsx";
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
    const [emailLogado, setEmailLogado] = useState<string>('');
    const [filtroSgtSge, setFiltroSgtSge] = useState<string>('Ambas');

    useEffect(() => {
        obterAvaliacoes();
        setEmailLogado(localStorage.getItem('s_email_pessoa') || '');
    }, []);

    useEffect(() => {
        obterCandidatosFiltrados(true);
    }, [dashboardFilter, dataInicio, dataFim, avaliacao, filtroSgtSge]);

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
        const endpoint = `/api/apiDashboard?filter=${dashboardFilter}&dataInicio=${dataInicio}&dataFim=${dataFim}&page=${currentPage}&avaliacao=${avaliacao}&filtroSgtSge=${filtroSgtSge}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;

        try {
            const res = await fetch(endpoint);
            const data = await res.json();
            
            setDadosDashboard(data); 
            console.log(data)
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
        const endpoint = `/api/apiDashboard?filter=${dashboardFilter}&dataInicio=${dataInicio}&dataFim=${dataFim}&avaliacao=${avaliacao}&filtroSgtSge=${filtroSgtSge}&isExport=true&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
        
        try {
            const res = await fetch(endpoint);
            const data = await res.json();
            const candidatos = data.tabelaCandidatos;

            const formatarParaXLSX = (candArray: any[]) => {
                return candArray.map(c => ({
                    Nome: c.nome,
                    Avaliacao: c.avaliacao,
                    CPF: c.cpf,
                    Email: c.email,
                    Data: c.data,
                    Resultado: c.resultado !== 0 ? "APROVADO" : "REPROVADO"
                }));
            };

            const wb = XLSX.utils.book_new();

            if (filtroSgtSge === "SGT" || filtroSgtSge === "SGE") {
                const sheetName = filtroSgtSge;
                const ws = XLSX.utils.json_to_sheet(formatarParaXLSX(candidatos));
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
            } else {
                const candidatosSGT = candidatos.filter((c:any) => {
                    if(!c.data) return false;
                    const partes = c.data.split(' ')[0].split('/'); 
                    const dt = new Date(`${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`);
                    return dt <= new Date('2026-07-21T23:59:59');
                });
                const candidatosSGE = candidatos.filter((c:any) => {
                    if(!c.data) return false;
                    const partes = c.data.split(' ')[0].split('/');
                    const dt = new Date(`${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`);
                    return dt > new Date('2026-07-21T23:59:59');
                });

                const wsSGT = XLSX.utils.json_to_sheet(formatarParaXLSX(candidatosSGT));
                XLSX.utils.book_append_sheet(wb, wsSGT, "SGT");

                const wsSGE = XLSX.utils.json_to_sheet(formatarParaXLSX(candidatosSGE));
                XLSX.utils.book_append_sheet(wb, wsSGE, "SGE");
            }

            XLSX.writeFile(wb, `exportacao_candidatos_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
            
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
        setFiltroSgtSge('Ambas');               
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
                        <select title="avaliações" value={avaliacao} onChange={(e) => setAvaliacao(e.target.value)}>
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

                        {['ingridy.carvalho@fiemg.com.br', 'db.oliveira@fiemg.com.br', 'bpinho@fiemg.com.br'].includes(emailLogado) && (
                            <div style={{ marginTop: '10px', width: '100%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ marginBottom: '10px' }}>Com cadastro feito no:</label>
                                <div className={styles.radioGroup}>
                                    <label className={styles.radioLabel}>
                                        <input className={styles.customRadio} type="radio" name="sgtSge" value="SGT" checked={filtroSgtSge === 'SGT'} onChange={() => setFiltroSgtSge('SGT')} />
                                        SGT
                                    </label>
                                    <label className={styles.radioLabel}>
                                        <input className={styles.customRadio} type="radio" name="sgtSge" value="SGE" checked={filtroSgtSge === 'SGE'} onChange={() => setFiltroSgtSge('SGE')} />
                                        SGE
                                    </label>
                                    <label className={styles.radioLabel}>
                                        <input className={styles.customRadio} type="radio" name="sgtSge" value="Ambas" checked={filtroSgtSge === 'Ambas'} onChange={() => setFiltroSgtSge('Ambas')} />
                                        Ambas
                                    </label>
                                </div>
                            </div>
                        )}

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