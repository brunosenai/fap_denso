import styles from "@/styles/Dashboard.module.css"
import Image from "next/image"
import { useState, useEffect } from "react"
import {formatDateToText} from  "@/utils/Utils"
import { useRouter } from "next/router"
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
            console.log(res)
        })
    }

    const dadosDicotomicos = {
        questoes: [
            'Tratamento adequado de Não\nConformidade (Stop & Call)',
            'Condução segura do ciclo\n(Uso do EPI)', 
            
        ],

        acertos: [89, 82], 
        erros: [31, 38]
    };

    const dadosEstaticosGradual = {
        eixoX: [
            'DISCIPLINA OPERACIONAL\n(C1, C9, C10)', 
            'MONTAGEM CORRETA\n(C4, C5, C6)', 
            'ORGANIZAÇÃO DO POSTO\n5S (C1, C3, C4)', 
            'ACOMPANHAMENTO DO\nTASK TIME (C6, C8, C9)', 
            'RESILIÊNCIA FÍSICA E\nMENTAL (C9, C11)'
        ],
        nota1: [24, 25, 23, 23, 27], // Vermelho (Pior)
        nota2: [36, 34, 38, 40, 35], // Laranja
        nota3: [42, 39, 44, 37, 41], // Verde Claro
        nota4: [18, 22, 15, 20, 17]  // Verde Escuro (Melhor)
    };
    
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
        </div>
    )
}