import styles from "@/styles/PopupImportarDados.module.css";
import PopupMessage, { PopupMessageProps } from "../Popup/PopupMessage"
import Load from "../Load/Load";
import { useState } from "react";

interface popupProps {
    comandoFechar: () => void;
}

export default function PopupImportarDados(props: popupProps) {
    const [load, setLoad] = useState(false);
    const [popupMessage, setPopupMessage] = useState<boolean>(false)
    const [dadosPopupMessage, setDadosPopupMessage] = useState<PopupMessageProps>({
        tipo: 0,
        titulo: "",
        mensagem: "",
        comandoOK: () => setPopupMessage(false)
    })
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

            if (linhas.length === 0) return;

            // =========================================================================
            // 1. VALIDAÇÃO DE CABEÇALHO
            // =========================================================================
            const cabecalhoEsperado = ["nome", "cpf", "email", "sexo", "nascimento", "instrucao", "data", "hora", "titulo fap"];
            // Pega a primeira linha, divide por ;, limpa espaços e ignora maiúsculas/minúsculas para validar
            const cabecalhoArquivo = linhas[0].split(';').map(col => col.trim().toLowerCase());
            
            let cabecalhoValido = true;
            for (let i = 0; i < cabecalhoEsperado.length; i++) {
                if (cabecalhoArquivo[i] !== cabecalhoEsperado[i].toLowerCase()) {
                    cabecalhoValido = false;
                    break;
                }
            }

            if (!cabecalhoValido) {
                setDadosCSV([]);
                setDadosPopupMessage({
                    tipo: 3,
                    titulo: "Cabeçalho Inválido",
                    mensagem: `Os títulos das colunas na planilha estão incorretos. O arquivo deve ter exatamente a ordem: ${cabecalhoEsperado.join('; ')}`,
                    comandoOK: () => setPopupMessage(false)
                });
                setPopupMessage(true);
                evento.target.value = '';
                return;
            }

            // Expressoes finais para garantir que a formatação está OK antes de enviar
            const regexDataFinal = /^\d{4}-\d{2}-\d{2}$/;
            const regexHoraFinal = /^\d{2}:\d{2}:\d{2}$/;
            
            let erroFormato = false;
            let erroDuplicidade = false;
            const cpfsInvalidos: {nome: string, cpf: string}[] = [];

            // Memória para checar duplicidades
            const cpfsLidos = new Set();
            const emailsLidos = new Set();

            for (let i = 1; i < linhas.length; i++) {
                const linha = linhas[i].trim();
                if (!linha) continue;

                const colunas = linha.split(';');

                if (colunas.length >= 3 && colunas[0]?.trim() !== '') {
                    const nome = colunas[0]?.trim() || "";
                    const cpf = colunas[1]?.replace(/\D/g, '') || ""; 
                    const email = colunas[2]?.trim() || "";
                    const sexo = colunas[3]?.trim() || "";
                    let nascimento = colunas[4]?.trim() || "";
                    const grauInstrucao = colunas[5]?.trim() || "";
                    let dataCSV = colunas[6]?.trim() || "";
                    let horaCSV = colunas[7]?.trim() || "";
                    const titulo_avaliacao = colunas[8]?.trim() || null;

                    // =========================================================================
                    // 2. VERIFICAÇÃO DE DUPLICIDADE E TAMANHO DO CPF
                    // =========================================================================
                    if (cpf.length !== 11) {
                        cpfsInvalidos.push({nome, cpf});
                    }

                    if (cpfsLidos.has(cpf) || emailsLidos.has(email)) {
                        erroDuplicidade = true;
                        break;
                    }
                    cpfsLidos.add(cpf);
                    emailsLidos.add(email);

                    // =========================================================================
                    // 3. FORMATAÇÃO AUTOMÁTICA SILENCIOSA (Datas e Horas)
                    // =========================================================================
                    
                    // Tratamento da Data de Nascimento
                    if (nascimento) {
                        const matchDataCompleta = nascimento.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                        if (matchDataCompleta) {
                            nascimento = `${matchDataCompleta[3]}-${matchDataCompleta[2]}-${matchDataCompleta[1]}`;
                        } else {
                            const matchDataCurta = nascimento.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
                            if (matchDataCurta) {
                                nascimento = `19${matchDataCurta[3]}-${matchDataCurta[2]}-${matchDataCurta[1]}`; // Assumindo sec XX para nascimentos antigos, ajuste para 20 se preferir
                            }
                        }
                    }

                    // Tratamento da Data da Avaliação
                    if (dataCSV) {
                        const matchDataCompleta = dataCSV.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                        if (matchDataCompleta) {
                            dataCSV = `${matchDataCompleta[3]}-${matchDataCompleta[2]}-${matchDataCompleta[1]}`;
                        } else {
                            const matchDataCurta = dataCSV.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
                            if (matchDataCurta) {
                                dataCSV = `20${matchDataCurta[3]}-${matchDataCurta[2]}-${matchDataCurta[1]}`;
                            }
                        }
                    }

                    // Se for HH:MM converte para HH:MM:00
                    if (horaCSV) {
                        const matchHoraIncompleta = horaCSV.match(/^(\d{2}):(\d{2})$/);
                        if (matchHoraIncompleta) {
                            horaCSV = `${matchHoraIncompleta[1]}:${matchHoraIncompleta[2]}:00`;
                        }
                    }

                    // Validação Final (Se ainda estiver fora do padrão após as correções)
                    if (dataCSV && !regexDataFinal.test(dataCSV)) {
                        erroFormato = true;
                        break;
                    }
                    if (horaCSV && !regexHoraFinal.test(horaCSV)) {
                        erroFormato = true;
                        break;
                    }

                    dadosLimpos.push({
                        nome,
                        cpf,
                        email,
                        sexo,
                        nascimento,
                        grauInstrucao,
                        data: dataCSV || null,
                        hora: horaCSV || null,
                        titulo_avaliacao
                    });
                }
            }

            // =========================================================================
            // ALERTAS DE PARADA
            // =========================================================================
            if (cpfsInvalidos.length > 0) {
                setDadosCSV([]);
                
                const MensagemErroCPFs = () => {
                    const [expandido, setExpandido] = useState(false);
                    const quantidadeMostrar = 10;
                    
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <span>Foram encontrados CPFs com tamanho diferente de 11 dígitos. O Excel pode ter apagado o zero inicial. Corrija o arquivo e tente novamente. Problemas encontrados:</span>
                            {!expandido ? (
                                <div>
                                    {cpfsInvalidos.slice(0, quantidadeMostrar).map(item => `${item.nome} (CPF: ${item.cpf || "vazio"})`).join(", ")}
                                    {cpfsInvalidos.length > quantidadeMostrar && (
                                        <span 
                                            style={{ textDecoration: 'underline', cursor: 'pointer', color: '#0056b3', marginLeft: '5px', fontWeight: 'bold' }} 
                                            onClick={() => setExpandido(true)}
                                        >
                                            e mais {cpfsInvalidos.length - quantidadeMostrar} registro(s)
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', textAlign: 'left' }}>
                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                        {cpfsInvalidos.map((item, idx) => (
                                            <li key={idx}>{item.nome} (CPF: {item.cpf || "vazio"})</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                };

                setDadosPopupMessage({
                    tipo: 3,
                    titulo: "CPFs Inválidos",
                    mensagem: <MensagemErroCPFs />,
                    comandoOK: () => setPopupMessage(false)
                });
                setPopupMessage(true);
                evento.target.value = '';
                return;
            }

            if (erroDuplicidade) {
                setDadosCSV([]);
                setDadosPopupMessage({
                    tipo: 3,
                    titulo: "Duplicidade Encontrada",
                    mensagem: "Foram encontrados CPFs ou E-mails duplicados nesta planilha. Corrija o arquivo e tente novamente.",
                    comandoOK: () => setPopupMessage(false)
                });
                setPopupMessage(true);
                evento.target.value = '';
                return;
            }

            if (erroFormato) {
                setDadosCSV([]);
                setDadosPopupMessage({
                    tipo: 3,
                    titulo: "Erro de Formatação",
                    mensagem: "Planilha de importação inconsistente, verifique o formato das datas para YYYY-MM-DD e o formato das horas para HH:MM:SS",
                    comandoOK: () => setPopupMessage(false)
                });
                setPopupMessage(true);
                evento.target.value = '';
                return;
            }

            setDadosCSV(dadosLimpos); 
        };
        
        // CRÍTICO: Lê o CSV usando o encoding padrão do Excel no Brasil para não quebrar acentos!
        reader.readAsText(file, 'ISO-8859-1');
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