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
import { DensoLogo } from "@/components/DensoLogo";

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
    const [emailsDashboard, setEmailsDashboard] = useState<string[]>([]);

    useEffect(() => {
        obterAvaliacoes();
        setEmailLogado(localStorage.getItem('s_email_pessoa') || '');
        fetch(`/api/apiDashboardEmails?apiKey=${process.env.NEXT_PUBLIC_API_KEY}`)
            .then(res => res.json())
            .then(data => setEmailsDashboard(data))
            .catch(err => console.error(err));
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

    const exportarPdfHoras = async () => {
        if (!dataInicio || !dataFim) {
            alert("Por favor, selecione um período (data inicial e final) para exportar o relatório de horas.");
            return;
        }

        const endpoint = `/api/apiDashboard?filter=${dashboardFilter}&dataInicio=${dataInicio}&dataFim=${dataFim}&avaliacao=${avaliacao}&filtroSgtSge=${filtroSgtSge}&isExport=true&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
        try {
            const res = await fetch(endpoint);
            const data = await res.json();
            const candidatos = data.tabelaCandidatos;

            const gerarResumoPorDia = (candArray: any[]) => {
                const map = new Map<string, { data: string, minTime: string, maxTime: string, count: number, _times: string[] }>();
                
                candArray.forEach((c) => {
                    if (!c.data) return;
                    // c.data is in format "DD/MM/YYYY HH:mm"
                    const [dateStr, timeStr] = c.data.split(' ');
                    if (!dateStr || !timeStr) return;
                    
                    if (!map.has(dateStr)) {
                        map.set(dateStr, { data: dateStr, minTime: timeStr, maxTime: timeStr, count: 1, _times: [timeStr] });
                    } else {
                        const entry = map.get(dateStr)!;
                        entry.count += 1;
                        entry._times.push(timeStr);
                    }
                });
            
                const result = Array.from(map.values()).map(entry => {
                    const sortedTimes = entry._times.sort();
                    return {
                        data: entry.data,
                        primeiraTurma: sortedTimes[0],
                        ultimaTurma: sortedTimes[sortedTimes.length - 1],
                        candidatos: entry.count
                    };
                });
            
                result.sort((a, b) => {
                    const [d1, m1, y1] = a.data.split('/');
                    const [d2, m2, y2] = b.data.split('/');
                    return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
                });
            
                return result;
            };

            const contarAvaliadores = (candArray: any[]) => {
                const map = new Map<string, number>();
                candArray.forEach((c: any) => {
                    if (!c.avaliador) return;
                    map.set(c.avaliador, (map.get(c.avaliador) || 0) + 1);
                });
                return Array.from(map.entries())
                    .map(([nome, quantidade]) => ({ nome, quantidade }))
                    .sort((a, b) => b.quantidade - a.quantidade);
            };

            let titulo = "RELATÓRIO DE HORAS";
            if (filtroSgtSge === "SGT") titulo = "RELATÓRIO DE HORAS (TECNOLOGIA)";
            else if (filtroSgtSge === "SGE") titulo = "RELATÓRIO DE HORAS (EDUCAÇÃO)";

            const pInicio = dataInicio ? dataInicio.split('-').reverse().join('/') : "Início";
            const pFim = dataFim ? dataFim.split('-').reverse().join('/') : "Hoje";
            const periodoDescritivo = `Este documento foi emitido na data ${new Date().toLocaleDateString('pt-BR')} e é referente ao período de ${pInicio} até ${pFim}.`;

            let dadosSGT, dadosSGE;

            if (filtroSgtSge === "SGT") {
                dadosSGT = contarAvaliadores(candidatos);
            } else if (filtroSgtSge === "SGE") {
                dadosSGE = contarAvaliadores(candidatos);
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
                dadosSGT = contarAvaliadores(candidatosSGT);
                dadosSGE = contarAvaliadores(candidatosSGE);
            }

            const { pdf } = await import('@react-pdf/renderer');
            const { RelatorioAvaliadores } = await import('../Pdf/RelatorioAvaliadores');

            const blob = await pdf(
                <RelatorioAvaliadores 
                    titulo={titulo} 
                    periodoDescritivo={periodoDescritivo} 
                    dadosSGT={dadosSGT} 
                    dadosSGE={dadosSGE} 
                    resumoDiario={gerarResumoPorDia(candidatos)}
                />
            ).toBlob();
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Relatorio_Horas_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Erro ao gerar PDF");
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
                    Resultado: c.presente === 0 ? "FALTOU" : c.resultado !== 0 ? "APROVADO" : "REPROVADO"
                }));
            };

            const wb = XLSX.utils.book_new();

            const temPermissao = emailsDashboard.includes(emailLogado);

            if (!temPermissao) {
                const ws = XLSX.utils.json_to_sheet(formatarParaXLSX(candidatos));
                XLSX.utils.book_append_sheet(wb, ws, "Geral");
            } else if (filtroSgtSge === "SGT" || filtroSgtSge === "SGE") {
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
                    src="/assets/denso_logo.svg" 
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
                <CardTopo  currentFilter={dashboardFilter} titulo={"FALTAS"} texto={dadosDashboard.cards.totalFaltas} color={5} filter={'faltas'} setDashboardFilter={setDashboardFilter}/>
                <CardTopo  currentFilter={dashboardFilter} titulo={"TAXA DE APROVAÇÃO"} texto={dadosDashboard.cards.taxaAprovacao} color={4} filter="geral" setDashboardFilter={setDashboardFilter}/>
                <CardTopo  currentFilter={dashboardFilter} titulo={"TAXA DE REPROVAÇÃO"} texto={dadosDashboard.cards.taxaReprovacao} color={4} filter="geral" setDashboardFilter={setDashboardFilter}/>
           </div>
           <div 
                className={`${styles.filterButton} ${showFilter ? styles.filterButtonActive : ''}`} 
                onClick={() => setShowFilter(!showFilter)}
            >
                <Image 
                    src={showFilter ? "/assets/icons/arrow_back.svg" : "/assets/icons/filter_white.svg"} 
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

                        {emailsDashboard.includes(emailLogado) && (
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
                            <div className={styles.sidebarActionsRow}>
                                <button onClick={limparFiltros} className={styles.exportButton}>Limpar</button>
                                <button onClick={exportarPlanilha} className={styles.exportButton}>Exportar CSV</button>
                            </div>
                            {emailsDashboard.includes(emailLogado) && (
                                <button onClick={exportarPdfHoras} className={`${styles.exportButton} ${styles.btnExportPdfHoras}`}>Exportar PDF Horas</button>
                            )}
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
                                                        src="/assets/denso_logo.svg" 
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
                                                            candidato.presente === 0
                                                                ? styles.falta
                                                                : candidato.resultado !== 0 ? styles.aprovado : styles.reprovado
                                                        }`}
                                                    >
                                                        {candidato.presente === 0 ? "FALTOU" : candidato.resultado !== 0 ? "APROVADO" : "REPROVADO"}
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