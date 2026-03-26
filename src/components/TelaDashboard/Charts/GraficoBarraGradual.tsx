import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface BarraGradualProps {
  dados: {
    eixoX: string[];
    nota1: number[];
    nota2: number[];
    nota3: number[];
    nota4: number[];
  };
}

export default function GraficoBarraGradual({ dados }: BarraGradualProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const myChart = echarts.init(chartRef.current);

    const labelOption = {
      show: true,
      position: 'top',
      distance: 10,
      align: 'center',
      verticalAlign: 'middle',
      fontSize: 12,
      fontWeight: 'bold',
      formatter: '{c}' // Mostra apenas o valor em cima da barra
    };

    const option = {
        title: {
            text: 'DESEMPENHO -  AVALIAÇÃO GRADUAL',
            left: 'center',
            top: '10%',
        },
        color: ['#FF5757', '#FFBD59', '#7ED957', '#00BF63'], // Vermelho, Laranja, Verde Claro, Verde Escuro
        legend: {
            orient: 'vertical',
            left: '8%',    
            top: 'center',     
            itemGap: 15,      
            textStyle: {
                fontSize: 12,
                fontWeight: 'normal'
            }
        },
        grid: { 
            left: '15%', 
            right: '10%',
            bottom: '15%',
            top: '20%',
            containLabel: true 
        },
        xAxis: [
            {
            type: 'category',
            axisTick: { show: false },
            interval: 30,
            data: dados.eixoX,
            axisLabel: { interval: 0, fontSize: 10 } // Garante que todos os nomes das questões apareçam
            }
        ],
        yAxis: [{ 
            type: 'value',
            max: function (value: any) {
                return Math.ceil(value.max * 2.3); 
            },
            splitLine: { 
                lineStyle: { type: 'dashed', opacity: 0.5 } 
            }
        }],
        series: [
            { name: 'Nota 1', type: 'bar', barGap: 0, label: labelOption, data: dados.nota1 },
            { name: 'Nota 2', type: 'bar', label: labelOption, data: dados.nota2 },
            { name: 'Nota 3', type: 'bar', label: labelOption, data: dados.nota3 },
            { name: 'Nota 4', type: 'bar', label: labelOption, data: dados.nota4 }
        ]
    };

    myChart.setOption(option);
    const handleResize = () => myChart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  }, [dados]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />;
}