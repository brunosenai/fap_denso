import Image from "next/image"
import styles from "@/styles/Topo.module.css"

export default function Topo(){
    return(
        <div className={styles.topo}>
            <Image src={'/assets/logo-stellantis-branco.png'} alt={'Logo Stellantis'} width={473} height={102} />
            <Image src={'/assets/logo-centro-branco.png'} alt={'Logo Stellantis'} width={152} height={152} />
        </div>
    )
}