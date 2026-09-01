import Image from "next/image"
import styles from "@/styles/TopoFap.module.css"
import { DensoLogo } from "@/components/DensoLogo";

interface TopoFapProps{
    nomeAvaliador:string
}

export default function TopoFap(props:TopoFapProps){
    return(
        <div className={styles.topo}>
            <div className={styles.topoLogos}>
                <DensoLogo fillColor="white" width={200} />
                <div className={styles.areaTitulo}>
                    <div className={styles.titulo}>Ficha de Avaliação</div>
                    <div className={styles.avaliador}>{props.nomeAvaliador}</div>
                </div>
                <Image src={'/assets/logo-centro-branco.png'} alt={'Logo Denso'} width={80} height={-1} />
            </div>            
        </div>
    )
}