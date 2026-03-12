import styles from "@/styles/TelaAvaliacoes.module.css";
import CardAvaliacao from "../CardAvaliacao/CardAvaliacao";
import { useEffect } from "react";

export default function TelaCadastroAvaliacoes(){
    return(
        <div className={styles.telaAvaliacoes}>
            <div className={styles.colunaTelaAvaliacoes}>
                <div>Lista de avaliações</div>
                <div>
                    <CardAvaliacao id={1} nome={'Avaliação 1'} data={'01/01/2024'}/>
                    <CardAvaliacao id={2} nome={'Avaliação 2'} data={'01/01/2024'}/>
                    <CardAvaliacao id={3} nome={'Avaliação 3'} data={'01/01/2024'}/>                    
                </div>
            </div>

            <div className={styles.colunaTelaAvaliacoes}>
                <div>Cadastro de nova avaliação</div>
                <div>

                </div>
            </div>
        </div>
    )
}