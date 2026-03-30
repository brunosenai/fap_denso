import styles from "@/styles/Dashboard.module.css"
import Image from "next/image"
import { useState, useEffect } from "react"
import {formatDateToText} from  "@/utils/Utils"
import router, { useRouter } from "next/router"
import CardTopo from "./CardTopo"
import GraficoPizza from "./Charts/GraficoPizza"
import GraficoBarraDicotomica from "./Charts/GraficoBarraDicotomica"
import GraficoBarraGradual from "./Charts/GraficoBarraGradual"

export default function TelaDashboard(){
    const [dadosDashboard,setDadosDashboard]=useState<any>('')

    useEffect(()=>{
        obterDadosIniciais()
    },[])

    const obterDadosIniciais=()=>{
        const endpoint=`/api/apiDashboard`
        fetch(endpoint)
        .then(res=>res.json())
        .then(res=>{
            setDadosDashboard(res)
        })
    }


    if (!dadosDashboard) {
        return <div className={styles.loading}>Carregando Dashboard...</div>
    }

    return(
        <div className={styles.telaCadastroCandidatos}>
           <div className={styles.cardTopoContainer}>
                <CardTopo titulo={"CANDIDATOS AVALIADOS"} texto={dadosDashboard.cards.totalAvaliados} color={1} />
                <CardTopo titulo={"APROVADOS"} texto={dadosDashboard.cards.totalAprovados} color={2} />
                <CardTopo titulo={"REPROVADOS"} texto={dadosDashboard.cards.totalReprovados} color={3} />
                <CardTopo titulo={"TAXA DE APROVAÇÃO"} texto={dadosDashboard.cards.taxaAprovacao} color={4} />
           </div>
           <div className={styles.cardsGraficos}>
                <div className={styles.cardsGraficos_1}>
                    <GraficoPizza 
                        titulo="Aprovados vs Reprovados" 
                        dados={dadosDashboard.cards.totalAprovados} 
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
                            <h5>Avançado - Adapta-se rápido a mudanças sem perda de foco.</h5>
                        </div>
                        <div className={styles.legandaContainer}>
                            <div className={styles.legendaBox2}></div>
                            <h5>Adequado - Adapta-se a mudanças mas perde o foco momentáneamento.</h5>
                        </div >
                        <div className={styles.legandaContainer}>
                            <div className={styles.legendaBox3}></div>
                            <h5>Básico - Oscilações perceptíveis, mas mantém o engajamento à atividade.</h5>
                        </div>
                        <div className={styles.legandaContainer}>
                            <div className={styles.legendaBox4}></div>
                            <h5>Abaixo do Básico - Perde o ritmo, o foco e demonstra resistência.</h5>
                        </div>
                    </div>
                </div>
                <div className={styles.graficosGerais_desempenho}>
                    <GraficoBarraGradual dados={dadosDashboard.graficoGradual} />
                </div>
            
           </div>
            <div className={styles.telaCadastroCandidatos_rodape}>
                <button className="btnPadrao_claro" onClick={()=>router.replace('/')}>Sair</button>
            </div>
        </div>
    )
}