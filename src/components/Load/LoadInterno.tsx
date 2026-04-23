import styles from "@/styles/LoadInterno.module.css";
import Image from "next/image";

export default function LoadInterno(){
    return(
        <dialog className={styles.loadApp}>
            <Image className={styles.girar} src="/assets/icons/load_circle_1.svg" alt="Finalizar" width={50} height={-1}/>
        </dialog>
    )
}