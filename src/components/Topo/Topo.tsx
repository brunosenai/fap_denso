import Image from "next/image"
import styles from "@/styles/Topo.module.css"

export default function Topo(){
    return(
        <div className={styles.topo}>
            <div></div>
            <Image src={'/stellantis_logo.png'} alt={'Logo Stellantis'} width={236} height={50} />
            <div></div>
        </div>
    )
}