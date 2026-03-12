import styles from "@/styles/CardAvaliacao.module.css";

interface CardAvaliacaoProps {
    id: number;
    nome: string;
    data:string;
}

export default function CardAvaliacao(props:CardAvaliacaoProps){
    return(
        <div className={styles.CardAvaliacaoProps}>
            <div className={`${styles.coluna} ${styles.c1}`}>{props.id}</div>
            <div className={`${styles.coluna} ${styles.c2}`}>{props.nome}</div>
            <div className={`${styles.coluna} ${styles.c3}`}>{props.data}</div>
            <div className={`${styles.coluna} ${styles.c4}`}></div>
        </div>
    )
}