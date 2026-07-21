import styles from "@/styles/PopupMessage.module.css";
import { tConfigPopupMessage } from "@/utils/Types";

export interface PopupMessageProps {
    tipo:number, // 1:mensagem, 2:informação, 3:erro
    titulo:string,
    mensagem:string | React.ReactNode,
    comandoOK:()=>void
}

export default function PopupMessage(props:PopupMessageProps) {

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
                    <div>{props.mensagem}</div>
                </div>
                <div className={styles.popupFap_conteudo_rodape}>
                    <button title="nao" className={styles.popupFap_btnNao} onClick={()=>props.comandoOK()}>OK</button>
                </div>
            </div>
        </div>
    );
}