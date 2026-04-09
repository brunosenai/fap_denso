import styles from "@/styles/PopupConfirmation.module.css";

interface PopupFapProps {
    titulo:string,
    mensagem:string,
    pergunta:string,
    comandoSim:()=>void
    comandoNao:()=>void
}

export default function PopupConfirmation(props:PopupFapProps) {

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
                </div>
                <div className={styles.popupFap_conteudo_corpo}>
                    <p>{props.mensagem}</p>
                    <p><b>{props.pergunta}</b></p>
                </div>
                <div className={styles.popupFap_conteudo_rodape}>
                    <button title="nao" className={styles.popupFap_btnNao} onClick={()=>props.comandoNao()}>Não</button>
                    <button title="sim" className={styles.popupFap_btnSim} onClick={()=>props.comandoSim()}>Sim</button>
                </div>
            </div>
        </div>
    );
}