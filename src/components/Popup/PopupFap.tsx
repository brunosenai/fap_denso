import styles from "@/styles/PopupFap.module.css";

interface PopupFapProps {
    titulo:string,
    mediacao:string,
    evidencias:string,
    i:number,
    fecharPopup:(i:number)=>void
}

export default function PopupFap(props:PopupFapProps) {

    const criarLista=(texto:string)=>{
        const itens = texto.split(';').filter(item => item.trim() !== '');
        return (
            <ul>
                {itens.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        );
    }

    return (
        <div className={styles.popupFap}>
            <div className={styles.popupFap_conteudo}>
                <div className={styles.popupFap_conteudo_titulo}>
                    {props.titulo}
                    <div className={styles.popupFap_btnFechar} onClick={()=>props.fecharPopup(props.i-1)}>X</div>
                </div>
                <div className={styles.popupFap_conteudo_corpo}>
                    <div><b>Mediação:</b>{props.mediacao}</div>
                    <h3>Evidências observáveis:</h3>
                    <div className={styles.popupFap_conteudo_evidencias}>{criarLista(props.evidencias)}</div>
                </div>
            </div>
        </div>
    );
}