import styles from "@/styles/Load.module.css";
import Image from "next/image";

export default function Load(){
    return(
        <div className={styles.loadApp}>
            <Image className={styles.girar} src="/assets/icons/load_circle_1.svg" alt="Finalizar" width={150} height={150}/>
        </div>
    )
}