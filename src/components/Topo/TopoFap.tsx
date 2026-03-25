import Image from "next/image"
import styles from "@/styles/TopoFap.module.css"

export default function TopoFap(){
    return(
        <div className={styles.topo}>
            <div className={styles.topoLogos}>
                <Image src={'/assets/logo-stellantis-branco.png'} alt={'Logo Stellantis'} width={473} height={102} />
                <Image src={'/assets/logo-centro-branco.png'} alt={'Logo Stellantis'} width={152} height={152} />
            </div>
            <div className={styles.titulo}>Ficha de Avaliação</div>
        </div>
    )
}