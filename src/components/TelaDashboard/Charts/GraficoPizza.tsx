import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface PizzaProps {
  dados: { value: number; name: string }[];
  titulo: string;
}

export default function GraficoPizza({ dados, titulo }: PizzaProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const myChart = echarts.init(chartRef.current);

    const option = {
        title: {
            text: 'RELAÇÃO DE CANDIDATOS',
            top: '15%'
        },
        tooltip: {
            trigger: 'item'
        },
        color: ['#9DFF9D', '#FF9D9D'],
        series: [
            {
                label: {
                    show: true,
                    position: 'inside', // Joga o texto para dentro da fatia
                    formatter: '{c}',   // '{c}' mostra o valor bruto. Use '{d}%' se quiser a porcentagem.
                    color: '#2D2D2D',      // Cor branca para contrastar com o Vermelho/Verde
                    fontWeight: 'normal',
                    fontSize: 16
                },
                name: titulo,
                type: 'pie',
                top: '10%',

                radius: '60%',
                data: dados,
                emphasis: {
                    itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            },
            {
                label: {
                    show: true,
                    position: 'outside', // Joga o texto para dentro da fatia
                    formatter: '{b}',   // '{c}' mostra o valor bruto. Use '{d}%' se quiser a porcentagem.
                    color: '#2D2D2D',      // Cor branca para contrastar com o Vermelho/Verde
                    fontWeight: 'normal',
                    fontSize: 14
                },
                name: titulo,
                type: 'pie',
                top: '10%',

                radius: '60%',
                data: dados,
                emphasis: {
                    itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
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
  }, [dados, titulo]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: '300px' }} />;
}