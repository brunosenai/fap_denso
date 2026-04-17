import styles from "@/styles/PopupImportarDados.module.css";
import PopupMessage, { PopupMessageProps } from "../Popup/PopupMessage"
import Load from "../Load/Load";
import { useState } from "react";

interface popupProps {
    comandoFechar: () => void;
}

export default function PopupImportarDados(props: popupProps) {
    const [load, setLoad] = useState(false);
    const [popupMessage,setPopupMessage]=useState<boolean>(false)
    const [dadosPopupMessage,setDadosPopupMessage]=useState<PopupMessageProps>(
        {
            tipo:0,
            titulo:"",
            mensagem:"",
            comandoOK:() => setPopupMessage(false)
        }
    )
    const [dadosCSV, setDadosCSV] = useState<any[]>([]);

    const enviarParaApi = async (candidatos: any[]) => {
        try {
            setLoad(true);
            const response = await fetch('/api/apiImportarCsv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: process.env.NEXT_PUBLIC_API_KEY,
                    candidatos
                })
            });

            if (response.ok) {
                setDadosPopupMessage({
                    tipo: 1, 
                    titulo: "Sucesso",
                    mensagem: "Importação realizada com sucesso!",
                    comandoOK: () => setPopupMessage(false)
                });
                setPopupMessage(true);
                props.comandoFechar();
            } else {
                setDadosPopupMessage({
                    tipo: 3, 
                    titulo: "Erro",
                    mensagem: "Erro ao processar a importação no servidor.",
                    comandoOK: () => setPopupMessage(false)
                });
                setPopupMessage(true);
            }
        } catch (error) {
            console.error(error);
            setDadosPopupMessage({
                tipo: 3, 
                titulo: "Erro",
                mensagem: "Erro de conexão.",
                comandoOK: () => setPopupMessage(false)
            });
            setPopupMessage(true);            
        } finally {
            setLoad(false);
        }
    };

    const handleFileUpload = (evento: React.ChangeEvent<HTMLInputElement>) => {
        const file = evento.target.files?.[0];
        if (!file) {
            setDadosCSV([]);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const texto = e.target?.result as string;
            const linhas = texto.split('\n');
            const dadosLimpos = [];
            
            for (let i = 1; i < linhas.length; i++) {
                const colunas = linhas[i].split(';');
                if (colunas.length >= 3 && colunas[0].trim() !== '') {
                    dadosLimpos.push({
                        nome: colunas[0].trim(),
                        cpf: colunas[1].replace(/\D/g, ''), 
                        email: colunas[2].trim(),
                        data: colunas[3]?.trim() || null,
                        hora: colunas[4]?.trim() || null,
                        titulo_avaliacao: colunas[5]?.trim() || null
                    });
                }
            }
            setDadosCSV(dadosLimpos); 
        };
        reader.readAsText(file);
    };

    const iniciarImportacao = () => {
        if (dadosCSV.length === 0) {
            setDadosPopupMessage({
                tipo: 2, 
                titulo: "Alerta",
                mensagem: "Por favor, selecione uma planilha com dados válidos primeiro.",
                comandoOK: () => setPopupMessage(false)
            });
            setPopupMessage(true);
            return;
        }
        enviarParaApi(dadosCSV);
    };

    return (
        <>
            {load && <Load/>}
            {popupMessage&&<PopupMessage tipo={dadosPopupMessage.tipo} titulo={dadosPopupMessage.titulo} mensagem={dadosPopupMessage.mensagem} comandoOK={dadosPopupMessage.comandoOK}/>}
            <div className={styles.popup}>
                <div className={styles.popup_conteudo}>
                    <div className={styles.popup_conteudo_titulo}>
                        Importar Candidatos
                    </div>
                    <div className={styles.popup_conteudo_corpo}>
                        <div className={styles.popup_conteudo_controles}>
                            <label htmlFor="csvUpload">Selecionar CSV</label>
                            <input type="file" id="csvUpload" accept=".csv" onChange={handleFileUpload}/>
                            
                            {dadosCSV.length > 0 && (
                                <span style={{ display: 'block', marginTop: '10px', color: '#243783', fontWeight: 'bold' }}>
                                    {dadosCSV.length} registro(s) pronto(s) para importação.
                                </span>
                            )}
                        </div>
                        
                        <button title="importar" className={styles.popup_btn} onClick={iniciarImportacao}>
                            Iniciar Importação
                        </button>
                    </div>
                    <div className={styles.popup_conteudo_rodape}>
                        <button title="nao" className={styles.popup_btn} onClick={() => props.comandoFechar()}>
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}