import Head from "next/head";
import Topo from "@/components/Topo/TopoConfig";
import styles from "@/styles/Config.module.css";
import PopupMessage from "@/components/Popup/PopupMessage";
import Image from "next/image";
import { tConfigPopupMessage, tConfig, tConfigFap, tPosto, tQuestao } from "@/utils/Types";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Configuracao() {
    const router = useRouter();
    const [config, setConfig] = useState<tConfig>();
    const [emails, setEmails] = useState<string[]>([]);
    const [emailsDashboard, setEmailsDashboard] = useState<string[]>([]);
    const [isRoot, setIsRoot] = useState(false);
    
    // FAP Config State
    const [fapConfig, setFapConfig] = useState<tConfigFap>({
        notaDeCorte: 13,
        postos: [],
        questoes: []
    });

    const [popupMessage, setPopupMessage] = useState(false);
    const [popupMessageData, setPopupMessageData] = useState<tConfigPopupMessage>({ tipo: 1, titulo: '', mensagem: '', comandoOK: () => {} });

    useEffect(() => {
        const tipoPessoa = localStorage.getItem('n_id_tipoPessoa');
        if (tipoPessoa !== '3') {
            router.replace('/selecaomodulo/adm');
            return;
        }
        setIsRoot(true);
        getConfig();
        getDashboardEmails();
    }, []);

    const getConfig = async () => {
        const endpoint = `/api/apiConfig?action=getConfis&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });
            const data = await response.json();
            
            if (data && data.length > 0) {
                const conf = data[0];
                setConfig(conf);
                if (conf.s_emailDestino_config) {
                    setEmails(conf.s_emailDestino_config.split(';'));
                }
                if (conf.j_config_fap) {
                    try {
                        const parsed = typeof conf.j_config_fap === 'string' ? JSON.parse(conf.j_config_fap) : conf.j_config_fap;
                        setFapConfig(parsed);
                    } catch (e) {
                        console.error("Erro ao fazer parse das configs da FAP", e);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    const getDashboardEmails = async () => {
        const endpoint = `/api/apiDashboardEmails?apiKey=${process.env.NEXT_PUBLIC_API_KEY}`
        try {
            const response = await fetch(endpoint, {
                method: 'GET'
            })
            const data = await response.json()
            if (Array.isArray(data)) {
                setEmailsDashboard(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const salvarConfig = async () => {
        const emailsfix = emails.filter(e => e.trim() !== '').join(';');
        const emailsDashFix = emailsDashboard.filter(e => e.trim() !== '');
        const endpoint = `/api/apiConfig`;

        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
                },
                body: JSON.stringify({
                    action: 'updateConfig',
                    s_emailDestino_config: emailsfix,
                    j_config_fap: JSON.stringify(fapConfig),
                    apiKey: process.env.NEXT_PUBLIC_API_KEY
                })
            });

            const endpointDash = `/api/apiDashboardEmails`;
            await fetch(endpointDash, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emails: emailsDashFix,
                    apiKey: process.env.NEXT_PUBLIC_API_KEY
                })
            });
            
            if (response.ok) {
                setPopupMessageData({
                    tipo: 2, 
                    titulo: 'Sucesso', 
                    mensagem: 'Configurações salvas com sucesso!', 
                    comandoOK: () => { setPopupMessage(false) }
                });
                setPopupMessage(true);
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Handlers for Emails
    const handleEmailChange = (index: number, valor: string) => {
        const novaLista = [...emails];
        novaLista[index] = valor;
        setEmails(novaLista);
    }
    const handleEmailDashChange = (index: number, valor: string) => {
        const novaLista = [...emailsDashboard];
        novaLista[index] = valor;
        setEmailsDashboard(novaLista);
    }
    const removerEmail = (index: number) => {
        const novaLista = [...emails];
        novaLista.splice(index, 1);
        setEmails(novaLista);
    }
    const removerEmailDash = (index: number) => {
        const novaLista = [...emailsDashboard];
        novaLista.splice(index, 1);
        setEmailsDashboard(novaLista);
    }
    const addEmail = () => {
        setEmails(prev => [...prev, '']);
    }
    const addEmailDash = () => {
        setEmailsDashboard(prev => [...prev, '']);
    }

    // Handlers for Postos
    const addPosto = () => {
        setFapConfig(prev => ({
            ...prev,
            postos: [...prev.postos, { id: Date.now(), nome: "", habilitado: true }]
        }));
    }
    const updatePosto = (index: number, field: keyof tPosto, value: any) => {
        const newPostos = [...fapConfig.postos];
        newPostos[index] = { ...newPostos[index], [field]: value };
        setFapConfig(prev => ({ ...prev, postos: newPostos }));
    }
    const removePosto = (index: number) => {
        const newPostos = [...fapConfig.postos];
        newPostos.splice(index, 1);
        setFapConfig(prev => ({ ...prev, postos: newPostos }));
    }

    // Handlers for Questoes
    const addQuestao = () => {
        setFapConfig(prev => ({
            ...prev,
            questoes: [...prev.questoes, { 
                id: Date.now(), 
                titulo: "", 
                mediacao: "", 
                evidencias: "", 
                tipo: "num", 
                peso: 1, 
                eliminatoria: false, 
                habilitada: true 
            }]
        }));
    }
    const updateQuestao = (index: number, field: keyof tQuestao, value: any) => {
        const newQuestoes = [...fapConfig.questoes];
        newQuestoes[index] = { ...newQuestoes[index], [field]: value };
        setFapConfig(prev => ({ ...prev, questoes: newQuestoes }));
    }
    const updateQuestaoOpcao = (qIndex: number, valor: number, rotulo: string) => {
        const newQuestoes = [...fapConfig.questoes];
        const questao = newQuestoes[qIndex];
        let opcoes = questao.opcoes ? [...questao.opcoes] : [];
        const optIndex = opcoes.findIndex(o => o.valor === valor);
        if (optIndex >= 0) {
            opcoes[optIndex] = { valor, rotulo };
        } else {
            opcoes.push({ valor, rotulo });
        }
        newQuestoes[qIndex] = { ...questao, opcoes };
        setFapConfig(prev => ({ ...prev, questoes: newQuestoes }));
    }
    const removeQuestao = (index: number) => {
        const newQuestoes = [...fapConfig.questoes];
        newQuestoes.splice(index, 1);
        setFapConfig(prev => ({ ...prev, questoes: newQuestoes }));
    }

    if (!isRoot) return null;

    return (
        <>
            {popupMessage && <PopupMessage tipo={popupMessageData.tipo} titulo={popupMessageData.titulo} mensagem={popupMessageData.mensagem} comandoOK={() => popupMessageData.comandoOK()} />}
            <Head>
                <title>Denso - Configurações</title>
                <meta name="description" content="Configurações do Sistema" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/assets/icons/favicon.ico?v=2" />
            </Head>
            
            <div className={styles.page}>
                <Topo titulo="Configurações" />
                
                <div className={styles.config} style={{ overflowY: 'auto' }}>
                    
                    {/* EMAILS */}
                    <div className={styles.confiArea}>
                        <div className={styles.confiArea_titulo_comando}>
                            E-Mails de Destino (Relatórios)
                            <button title="Adicionar e-mail" className={styles.btnAdd} onClick={addEmail}>
                                <Image src="/assets/icons/add_w.svg" alt="adicionar" width={25} height={25} />
                            </button>
                        </div>
                        <div className={styles.confiArea_corpo}>
                            {emails.map((e, i) => (
                                <div key={i} className={styles.confiArea_field}>
                                    <div className={styles.confiArea_inputImage}>
                                        <input type="email" placeholder="Digite o e-mail de destino" value={e} onChange={(evt) => handleEmailChange(i, evt.target.value)} />
                                        <Image src="/assets/icons/delete_w.svg" alt="remover" width={28} height={28} style={{ marginRight: "5px" }} onClick={() => removerEmail(i)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* EMAILS DASHBOARD */}
                    <div className={styles.confiArea} style={{ marginTop: '20px' }}>
                        <div className={styles.confiArea_titulo_comando}>
                            E-Mails VIP (Acesso ao Dashboard)
                            <button title="Adicionar e-mail VIP" className={styles.btnAdd} onClick={addEmailDash}>
                                <Image src="/assets/icons/add_w.svg" alt="adicionar" width={25} height={25} />
                            </button>
                        </div>
                        <div className={styles.confiArea_corpo}>
                            {emailsDashboard.map((e, i) => (
                                <div key={i} className={styles.confiArea_field}>
                                    <div className={styles.confiArea_inputImage}>
                                        <input type="email" placeholder="Digite o e-mail VIP" value={e} onChange={(evt) => handleEmailDashChange(i, evt.target.value)} />
                                        <Image src="/assets/icons/delete_w.svg" alt="remover" width={28} height={28} style={{ marginRight: "5px" }} onClick={() => removerEmailDash(i)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NOTA DE CORTE */}
                    <div className={styles.confiArea}>
                        <div className={styles.confiArea_titulo_comando}>
                            FAP - Nota de Corte
                        </div>
                        <div className={styles.confiArea_corpo}>
                            <div className={styles.confiArea_field}>
                                <label>Pontuação mínima para aprovação:</label>
                                <input 
                                    type="number" 
                                    value={fapConfig.notaDeCorte} 
                                    onChange={(e) => setFapConfig(prev => ({ ...prev, notaDeCorte: Number(e.target.value) }))} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* POSTOS DE TRABALHO */}
                    <div className={styles.confiArea}>
                        <div className={styles.confiArea_titulo_comando}>
                            FAP - Postos de Trabalho
                            <button title="Adicionar Posto" className={styles.btnAdd} onClick={addPosto}>
                                <Image src="/assets/icons/add_w.svg" alt="adicionar" width={25} height={25} />
                            </button>
                        </div>
                        <div className={styles.confiArea_corpo}>
                            {fapConfig.postos.map((p, i) => (
                                <div key={p.id} className={styles.confiArea_field} style={{ border: '1px solid #ccc', padding: 10, borderRadius: 5, marginBottom: 10 }}>
                                    <div style={{ display: 'flex', gap: 10, width: '100%', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Nome do Posto</label>
                                            <input type="text" value={p.nome} onChange={(e) => updatePosto(i, 'nome', e.target.value)} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 15 }}>
                                            <input type="checkbox" checked={p.habilitado} onChange={(e) => updatePosto(i, 'habilitado', e.target.checked)} style={{ width: 'auto' }} />
                                            <label>Habilitado</label>
                                        </div>
                                        <Image src="/assets/icons/delete.svg" alt="remover" width={28} height={28} style={{ cursor: 'pointer', marginTop: 15 }} onClick={() => removePosto(i)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* QUESTÕES */}
                    <div className={styles.confiArea}>
                        <div className={styles.confiArea_titulo_comando}>
                            FAP - Questões da Avaliação
                            <button title="Adicionar Questão" className={styles.btnAdd} onClick={addQuestao}>
                                <Image src="/assets/icons/add_w.svg" alt="adicionar" width={25} height={25} />
                            </button>
                        </div>
                        <div className={styles.confiArea_corpo}>
                            {fapConfig.questoes.map((q, i) => (
                                <div key={q.id} className={styles.confiArea_field} style={{ border: '1px solid #ccc', padding: 10, borderRadius: 5, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    
                                    <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Título (Ex: DISCIPLINA OPERACIONAL)</label>
                                            <input type="text" value={q.titulo} onChange={(e) => updateQuestao(i, 'titulo', e.target.value)} />
                                        </div>
                                        <div style={{ width: 100 }}>
                                            <label>Peso</label>
                                            <input type="number" step="0.1" value={q.peso} onChange={(e) => updateQuestao(i, 'peso', Number(e.target.value))} />
                                        </div>
                                        <div style={{ width: 100 }}>
                                            <label>Tipo</label>
                                            <select value={q.tipo} onChange={(e) => updateQuestao(i, 'tipo', e.target.value)} style={{ width: '100%', padding: 5, borderRadius: 5, border: '1px solid #ccc' }}>
                                                <option value="num">Nota (1 a 4)</option>
                                                <option value="sn">Sim/Não</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ width: '100%' }}>
                                        <label>Mediação (Pergunta/Critério Principal)</label>
                                        <textarea 
                                            style={{ width: '100%', padding: 5, borderRadius: 5, border: '1px solid #ccc', resize: 'vertical' }} 
                                            value={q.mediacao} 
                                            onChange={(e) => updateQuestao(i, 'mediacao', e.target.value)}
                                            rows={2}
                                        />
                                    </div>

                                    <div style={{ width: '100%' }}>
                                        <label>Evidências (Separadas por ponto-e-vírgula ; )</label>
                                        <textarea 
                                            style={{ width: '100%', padding: 5, borderRadius: 5, border: '1px solid #ccc', resize: 'vertical' }} 
                                            value={q.evidencias} 
                                            onChange={(e) => updateQuestao(i, 'evidencias', e.target.value)}
                                            rows={2}
                                        />
                                    </div>

                                    <div style={{ width: '100%', marginTop: 5 }}>
                                        <label style={{ fontWeight: 'bold' }}>Textos Personalizados das Opções de Resposta:</label>
                                        {q.tipo === 'num' ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 5 }}>
                                                {[4, 3, 2, 1].map((valor) => {
                                                    const defaultText = valor === 4 ? "Avançado - " : valor === 3 ? "Adequado - " : valor === 2 ? "Básico - " : "Abaixo do Básico - ";
                                                    const currentOpcao = q.opcoes?.find(o => o.valor === valor);
                                                    return (
                                                        <div key={valor} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <span style={{ width: 140, fontSize: 'small', fontWeight: 'bold' }}>
                                                                {valor === 4 ? "Nota 4 (Avançado):" : valor === 3 ? "Nota 3 (Adequado):" : valor === 2 ? "Nota 2 (Básico):" : "Nota 1 (Abaixo Básico):"}
                                                            </span>
                                                            <input 
                                                                type="text" 
                                                                placeholder={defaultText}
                                                                value={currentOpcao ? currentOpcao.rotulo : ''} 
                                                                onChange={(e) => updateQuestaoOpcao(i, valor, e.target.value)}
                                                                style={{ flex: 1, padding: 5, borderRadius: 5, border: '1px solid #ccc' }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 5 }}>
                                                {[1, 0].map((valor) => {
                                                    const currentOpcao = q.opcoes?.find(o => o.valor === valor);
                                                    return (
                                                        <div key={valor} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <span style={{ width: 140, fontSize: 'small', fontWeight: 'bold' }}>
                                                                {valor === 1 ? "Opção Sim (1):" : "Opção Não (0):"}
                                                            </span>
                                                            <input 
                                                                type="text" 
                                                                placeholder={valor === 1 ? "Atende" : "Não atende"}
                                                                value={currentOpcao ? currentOpcao.rotulo : ''} 
                                                                onChange={(e) => updateQuestaoOpcao(i, valor, e.target.value)}
                                                                style={{ flex: 1, padding: 5, borderRadius: 5, border: '1px solid #ccc' }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <input type="checkbox" checked={q.eliminatoria} onChange={(e) => updateQuestao(i, 'eliminatoria', e.target.checked)} style={{ width: 'auto' }} />
                                            <label style={{ color: q.eliminatoria ? '#E3000F' : 'inherit', fontWeight: q.eliminatoria ? 'bold' : 'normal' }}>É Eliminatória?</label>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <input type="checkbox" checked={q.habilitada} onChange={(e) => updateQuestao(i, 'habilitada', e.target.checked)} style={{ width: 'auto' }} />
                                            <label>Habilitada (Aparece na tela)</label>
                                        </div>
                                        
                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                            <button onClick={() => removeQuestao(i)} style={{ backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#E3000F', fontWeight: 'bold' }}>
                                                <Image src="/assets/icons/delete.svg" alt="remover" width={20} height={20} style={{ marginRight: 5 }} />
                                                Remover Questão
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>

                </div>
                
                <div className={styles.confiArea_rodape}>
                    <button className={styles.btnPadrao} onClick={salvarConfig}>Salvar Configurações</button>
                </div>
            </div>
        </>
    )
}