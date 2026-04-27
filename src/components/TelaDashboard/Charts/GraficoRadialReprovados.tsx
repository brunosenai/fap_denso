import React, { useEffect, useRef } from 'react';
import styles from "@/styles/Graficos.module.css";
import * as echarts from 'echarts';

interface RadialProps {
  dados: { value: number; name: string }[];
  titulo: string;
}

export default function GraficoRadialReprovados({ dados, titulo }: RadialProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const myChart = echarts.init(chartRef.current);

    const option = {
      title: {
        text: 'RELAÇÃO DE REPROVADOS',
        top: '4%'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        right: '10%',
        left: 'center'
      },

      color: ['#FFD6D6','#FF9D9D', '#FF4D4D'],
      series: [
        {
          name: titulo,
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '70%'],
  
          startAngle: 180,
          endAngle: 360,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{c} ({d}%)', 
            color: '#2D2D2D',
            fontSize: 14
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
          },
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

  return <div ref={chartRef} className={styles.GraficoPizza} />;
}