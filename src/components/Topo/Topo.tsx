import Image from "next/image"
import styles from "@/styles/Topo.module.css"
import router from "next/router";

interface TopoProps {
    titulo?: string;
}

export default function Topo({ titulo = "" }: TopoProps){

    const sair=async()=>{
        await fetch('/api/apiLogout');
        localStorage.clear
        router.replace('/');
    }

    return(
        <div className={styles.topo}>
            <div className={styles.topoImages}>
                <Image className={styles.logoStellantis} src={'/assets/logo-stellantis-branco.png'} alt={'Logo Stellantis'} width={250} height={-1} />
                <div className={styles.areaDireira}>
                    <Image className={styles.topoCentro40} src={'/assets/logo-centro-branco.png'} alt={'Logo Stellantis'} width={80} height={-1} />
                    <div className={styles.logoutIcon}>
                        <Image  src={'/assets/icons/logout_w.svg'} alt={'Logo Stellantis'} onClick={()=>sair()} width={35} height={35} />
                        SAIR
                    </div>
                </div>
            </div>
            <div className={styles.topoTitulo}>
                {titulo}
            </div>
        </div>
    )
}