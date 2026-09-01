import React, { useEffect, useRef } from 'react';
import styles from "@/styles/Graficos.module.css";
import * as echarts from 'echarts';

export interface DadosDicotomicos {
  questoes: string[]; 
  acertos: number[];   
  erros: number[];   
}

interface BarraDicotomicaProps {
  dados: DadosDicotomicos;
  titulo?: string; 
}

export default function GraficoBarraDicotomica({ dados, titulo }: BarraDicotomicaProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const myChart = echarts.init(chartRef.current);
    const option = {
      // Título interno (opcional)
      title: {
        text: 'DESEMPENHO - AVALIAÇÃO DICOTÔMICA',
        left: 'center',
        top: '15%',
      },
      // Legenda no topo
      legend: {
        data: ['Atende', 'Não atende'],
        bottom: '40px',
        textStyle: { color: '#555' }
      },
      // Ajuste das margens para os textos laterais não sumirem
      grid: {
        left: '10%',
        right: '10%',
        bottom: '10%',
        top: '80px',
        containLabel: true
      },
      // Eixo X (Horizontal) recebe os VALORES
      xAxis: {
        type: 'value',
        show: false, // Esconde a régua de números de baixo
        axisLine: { show: false },
        splitLine: { show: false } // Esconde as linhas de grade verticais
      },
      // Eixo Y (Vertical) recebe as CATEGORIAS (Nomes das questões)
      yAxis: {
        type: 'category',
        data: dados?.questoes && dados.questoes.length > 0 ? [...dados.questoes].reverse() : [
            'Tratamento adequado de Não\nConformidade (Stop & Call)',
            'Condução segura do ciclo\n(Uso do EPI)'
        ],
        axisLine: { show: false }, // Esconde a linha do eixo Y
        axisTick: { show: false }, // Esconde os risquinhos do eixo Y
        axisLabel: {
            color: '#333',
            fontSize: 14,
            margin: 20,
            }
        },
      series: [
        {
          name: 'Atende', // Deve bater com o nome na Legenda
          type: 'bar',
          stack: 'total', // O SEGREDO: mesmo nome em ambas as séries faz elas empilharem
          data: dados?.acertos || [0, 0],
          itemStyle: { color: '#99FF99' }, // Verde claro (Atende)
          barWidth: '45px', // Grossura da barra
          label: {
            show: true,
            position: 'insideLeft', // Texto dentro da barra, na esquerda
            formatter: (params: any) => Number(params.value) > 0 ? `Atende: ${params.value}` : '',
            color: '#006600', // Verde escuro para o texto
            fontWeight: 'bold',
            fontSize: 14
          }
        },
        {
          name: 'Não atende',
          type: 'bar',
          stack: 'total', // Mesmo 'stack' para empilhar
          data: dados?.erros || [0, 0],
          itemStyle: { color: '#FF9999' }, // Vermelho claro (Não atende)
          label: {
            show: true,
            position: 'insideRight', // Texto dentro da barra, na direita
            formatter: (params: any) => Number(params.value) > 0 ? `Não atende: ${params.value}` : '',
            color: '#990000', // Vermelho escuro para o texto
            fontWeight: 'bold',
            fontSize: 14
          }
        }
      ]
    };

    myChart.setOption(option);
    const handleResize = () => myChart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  }, [dados, titulo]); // Recarrega se os dados mudarem

  //return <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: '300px', textAlign: 'center' }} />;
  return <div ref={chartRef} className={styles.GraficoBarraDicotomica} />;
}