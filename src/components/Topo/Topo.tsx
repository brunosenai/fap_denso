import Image from "next/image"
import styles from "@/styles/Topo.module.css"
import router from "next/router";

interface TopoProps {
    titulo?: string;
}

export default function Topo({ titulo = "" }: TopoProps){
    return(
        <div className={styles.topo}>
            <div className={styles.topoImages}>
                <Image className={styles.logoStellantis} src={'/assets/logo-stellantis-branco.png'} alt={'Logo Stellantis'} width={473} height={102} />
                <Image className={styles.topoCentro40} src={'/assets/logo-centro-branco.png'} alt={'Logo Stellantis'} width={152} height={152} />
                <div className={styles.logoutIcon}>
                    <Image  src={'/assets/icons/logout_w.svg'} alt={'Logo Stellantis'} onClick={()=>router.replace('/')} width={35} height={35} />
                    SAIR
                </div>
            </div>
            <div className={styles.topoTitulo}>
                {titulo}
            </div>
        </div>
    )
}