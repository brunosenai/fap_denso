import Image from "next/image"
import styles from "@/styles/Topo.module.css"
import router from "next/router";

interface TopoProps {
    titulo?: string;
}

export default function TopoConfig({ titulo = "" }: TopoProps){

    const voltar=async()=>{
        router.back()
    }

    return(
        <div className={styles.topo}>
            <div className={styles.topoImages}>
                <Image className={styles.logoStellantis} src={'/assets/logo-stellantis-branco.png'} alt={'Logo Stellantis'} width={250} height={-1} />
                <div className={styles.areaDireira}>
                    <Image className={styles.topoCentro40} src={'/assets/logo-centro-branco.png'} alt={'Logo Stellantis'} width={80} height={-1} />
                    <div className={styles.logoutIcon}>
                        <Image  src={'/assets/icons/arrow_back_w.svg'} alt={'Voltar'} onClick={()=>voltar()} width={30} height={-1} />
                        voltar
                    </div>
                </div>
            </div>
            <div className={styles.topoTitulo}>
                {titulo}
            </div>
        </div>
    )
}