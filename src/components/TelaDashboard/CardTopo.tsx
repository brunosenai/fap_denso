import styles from "@/styles/Dashboard.module.css"
import Image from "next/image"
import { useState, useEffect } from "react"
import {formatDateToText} from  "@/utils/Utils"
import { useRouter } from "next/router"

interface CardTopoProps {
    titulo: string;
    texto: string | number;
    color: number
}

export default function CardTopo({ titulo, texto, color }: CardTopoProps){
    const router=useRouter()
    const [screenWidth, setScreenWidth]=useState<number>()
    const [estilo, setEstilo] = useState('')

    
    useEffect(()=>{
        const viewportWidth: number = window.innerWidth;
        setScreenWidth(viewportWidth)
        console.log(styles.cardTopo1)
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
        <div className={styles.cardTopo}>
            <h3 className={styles.cardTopo_titulo}>{titulo}</h3>
            <h1 className={estilo}>{texto}</h1>
        </div>
    )
}