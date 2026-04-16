import styles from "@/styles/Dashboard.module.css"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"

interface CardTopoProps {
    titulo: string;
    texto: string | number;
    color: number;
    filter: string;
    currentFilter: string;
    setDashboardFilter: (filter: string) => void;
}

export default function CardTopo({ titulo, texto, color, setDashboardFilter, filter, currentFilter }: CardTopoProps){
    const router=useRouter()
    const [screenWidth, setScreenWidth]=useState<number>()
    const [estilo, setEstilo] = useState('')

    const isActive = currentFilter === filter;

    
    useEffect(()=>{
        const viewportWidth: number = window.innerWidth;
        setScreenWidth(viewportWidth)
        switch(color){
            case 1:
                setEstilo(styles.cardTopo1)
            break;
            case 2:
                setEstilo(styles.cardTopo2)
            break;
            case 3:
                setEstilo(styles.cardTopo3)
            break;
            default:
                setEstilo(styles.cardTopo1)
            break;
        }
    },[])

    return(
        <div className={`${styles.cardTopo}`} onClick={()=>{setDashboardFilter(filter!)}}>
            <h3 className={styles.cardTopo_titulo}>{titulo}</h3>
            <h1 className={`${estilo} ${isActive ? styles.cardAtivo : ''}` }>{texto}</h1>
        </div>
    )
}