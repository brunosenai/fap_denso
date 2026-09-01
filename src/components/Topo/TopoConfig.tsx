import Image from "next/image"
import styles from "@/styles/Topo.module.css"
import router from "next/router";
import { DensoLogo } from "@/components/DensoLogo";

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
                <DensoLogo fillColor="white" className={styles.logoDenso} width={250} />
                <div className={styles.areaDireira}>
                    <Image className={styles.topoCentro40} src={'/assets/logo-centro-branco.png'} alt={'Logo Denso'} width={80} height={-1} />
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