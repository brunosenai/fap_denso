import Image from "next/image"
import styles from "@/styles/TopoFap.module.css"

interface TopoFapProps{
    nomeAvaliador:string
}

export default function TopoFap(props:TopoFapProps){
    return(
        <div className={styles.topo}>
            <div className={styles.topoLogos}>
                <Image src={'/assets/logo-stellantis-branco.png'} alt={'Logo Stellantis'} width={200} height={-1} />
                <div className={styles.areaTitulo}>
                    <div className={styles.titulo}>Ficha de Avaliação</div>
                    <div className={styles.avaliador}>{props.nomeAvaliador}</div>
                </div>
                <Image src={'/assets/logo-centro-branco.png'} alt={'Logo Stellantis'} width={80} height={-1} />
            </div>            
        </div>
    )
}