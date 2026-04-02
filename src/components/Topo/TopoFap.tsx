import Image from "next/image"
import styles from "@/styles/TopoFap.module.css"

export default function TopoFap(){
    return(
        <div className={styles.topo}>
            <div className={styles.topoLogos}>
                <Image src={'/assets/logo-stellantis-branco.png'} alt={'Logo Stellantis'} width={200} height={-1} />
                <div className={styles.titulo}>Ficha de Avaliação</div>
                <Image src={'/assets/logo-centro-branco.png'} alt={'Logo Stellantis'} width={80} height={-1} />
            </div>            
        </div>
    )
}