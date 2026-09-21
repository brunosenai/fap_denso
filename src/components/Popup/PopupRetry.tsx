import styles from "@/styles/PopupConfirmation.module.css";

export interface PopupRetryProps {
    titulo?: string;
    mensagem?: string;
    comandoTentarNovamente: () => void;
    comandoCancelar: () => void;
}

export default function PopupRetry({
    titulo = "Instabilidade de Conexão",
    mensagem = "Não foi possível enviar a avaliação para o servidor devido a uma instabilidade de rede ou conexão com o banco.",
    comandoTentarNovamente,
    comandoCancelar
}: PopupRetryProps) {
    return (
        <div className={styles.popupFap}>
            <div className={styles.popupFap_conteudo}>
                <div className={styles.popupFap_conteudo_titulo} style={{ backgroundColor: "#d9534f" }}>
                    ⚠️ {titulo}
                </div>
                <div className={styles.popupFap_conteudo_corpo}>
                    <p style={{ margin: 0, textAlign: "center" }}>{mensagem}</p>
                    
                    <div style={{
                        backgroundColor: "#eaf7ea",
                        border: "1px solid #c3e6cb",
                        color: "#155724",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                        textAlign: "center",
                        width: "100%"
                    }}>
                        🛡️ <b>Seus dados estão seguros!</b><br />
                        Todas as notas e observações continuam salvas no cache do seu dispositivo. Nenhuma informação foi perdida.
                    </div>

                    <p style={{ margin: 0, fontWeight: "bold", textAlign: "center" }}>
                        Deseja tentar enviar a gravação novamente agora?
                    </p>
                </div>
                <div className={styles.popupFap_conteudo_rodape}>
                    <button 
                        title="Cancelar" 
                        className={styles.popupFap_btnNao} 
                        style={{ backgroundColor: "#6c757d" }} 
                        onClick={comandoCancelar}
                    >
                        Cancelar
                    </button>
                    <button 
                        title="Tentar Novamente" 
                        className={styles.popupFap_btnSim} 
                        style={{ backgroundColor: "#28a745" }} 
                        onClick={comandoTentarNovamente}
                    >
                        🔄 Tentar Novamente
                    </button>
                </div>
            </div>
        </div>
    );
}
