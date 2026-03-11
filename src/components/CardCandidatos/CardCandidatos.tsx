import styles from '@/styles/CardCandidatos.module.css'
import Image from 'next/image'

interface cardCandidatosProps{
    nome:string,
    email:string,
    removerCandidato?:()=>void,
}

export default function CardCandidatos(props:cardCandidatosProps){
    return(
        <div className={styles.cardCandidato}>
            <div className={styles.c1}>{props.nome}</div>
            <div className={styles.c2}>{props.email}</div>
            <div className={styles.c3}>
                <Image className={styles.btnDelete} src="/assets/icons/delete.svg" alt="Excluir" width={20} height={20} onClick={() => props.removerCandidato && props.removerCandidato()}/>
            </div>
        </div>
    )
}