import Head from "next/head";
import Topo from "@/components/Topo/TopoConfig";
import styles from "@/styles/Config.module.css";
import PopupMessage from "@/components/Popup/PopupMessage";
import Image from "next/image";
import { tConfigPopupMessage } from "@/utils/Types";
import { tConfig } from "@/utils/Types";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Configuracao() {
    const router = useRouter();
    const [config, setConfig] = useState<tConfig>();
    const [emails, setEmails] = useState<string[]>([]);
    const [emailsDashboard, setEmailsDashboard] = useState<string[]>([]);
    const [popupMessage, setPopupMessage] = useState(false);
    const [popupMessageData, setPopupMessageData] = useState<tConfigPopupMessage>({ tipo: 1, titulo: '', mensagem: '', comandoOK: () => { } });
    const [isRoot, setIsRoot] = useState(false);

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
        const endpoing = `/api/apiConfig?action=getConfis&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`
        try {
            const response = await fetch(endpoing, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            })
            const data = await response.json()
            setEmails((data[0].s_emailDestino_config).split(';'))
            setConfig(data[0])
        } catch (error) {
            console.error(error)
        }
    }

    const getDashboardEmails = async () => {
        const endpoint = `/api/apiDashboardEmails?apiKey=${process.env.NEXT_PUBLIC_API_KEY}`
        try {
            const response = await fetch(endpoint, {
                method: 'GET'
            })
            const data = await response.json()
            setEmailsDashboard(data)
        } catch (error) {
            console.error(error)
        }
    }

    const salvarConfig = async () => {
        const emailsfix = emails.filter(e => e.trim() !== '').join(';');
        const emailsDashFix = emailsDashboard.filter(e => e.trim() !== '');

        const endpoing = `/api/apiConfig`
        try {
            await fetch(endpoing, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
                },
                body: JSON.stringify({
                    action: 'updateConfig',
                    s_emailDestino_config: emailsfix,
                    apiKey: process.env.NEXT_PUBLIC_API_KEY
                })
            });

            const endpoingDash = `/api/apiDashboardEmails`
            await fetch(endpoingDash, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emails: emailsDashFix,
                    apiKey: process.env.NEXT_PUBLIC_API_KEY
                })
            });

            const popData = {
                tipo: 2, titulo: 'Sucesso', mensagem: 'Configurações salvas com sucesso!', comandoOK: () => {
                    setPopupMessage(false)
                }
            }
            setPopupMessageData(popData)
            setPopupMessage(true)
            
            setEmails(emailsfix.split(';'));
            setEmailsDashboard(emailsDashFix);
        } catch (error) {
            console.error(error)
        }
    }

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

    if (!isRoot) return null;

    return (
        <>
            {popupMessage && <PopupMessage tipo={popupMessageData.tipo} titulo={popupMessageData.titulo} mensagem={popupMessageData.mensagem} comandoOK={() => popupMessageData.comandoOK()} />}
            <Head>
                <title>Stellantis - Teste de Aptidão Prática</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/assets/icons/favicon.ico?v=2" />
            </Head>
            <div className={styles.page}>
                <Topo />
                <div className={styles.config}>
                    <div className={styles.confiArea}>
                        <div className={styles.confiArea_titulo_comando}>
                            E-Mails de destino (Relatórios)
                            <button title="adicionar email" className={styles.btnAdd} onClick={() => { addEmail() }}>
                                <Image src="/assets/icons/add_w.svg" alt="adicionar" width={25} height={-1} />
                            </button>
                        </div>
                        <div className={styles.confiArea_corpo}>
                            {emails.length > 0 && emails.map((e, i) => (
                                <div className={styles.confiArea_field} key={`email-${i}`}>
                                    <label htmlFor={`email${i}`}>E-Mail</label>
                                    <div className={styles.confiArea_inputImage}>
                                        <input type="email" id={`email${i}`} placeholder="Digite o e-mail de destino" value={e} onChange={(evt) => handleEmailChange(i, evt.target.value)} />
                                        <Image src="/assets/icons/delete_w.svg" alt="remover" width={28} height={-1} style={{ marginRight: "5px", cursor: "pointer" }} onClick={() => removerEmail(i)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.confiArea} style={{ marginTop: '20px' }}>
                        <div className={styles.confiArea_titulo_comando}>
                            E-Mails VIP (Acesso ao Dashboard)
                            <button title="adicionar email" className={styles.btnAdd} onClick={() => { addEmailDash() }}>
                                <Image src="/assets/icons/add_w.svg" alt="adicionar" width={25} height={-1} />
                            </button>
                        </div>
                        <div className={styles.confiArea_corpo}>
                            {emailsDashboard.length > 0 && emailsDashboard.map((e, i) => (
                                <div className={styles.confiArea_field} key={`emailDash-${i}`}>
                                    <label htmlFor={`emailDash${i}`}>E-Mail</label>
                                    <div className={styles.confiArea_inputImage}>
                                        <input type="email" id={`emailDash${i}`} placeholder="Digite o e-mail VIP" value={e} onChange={(evt) => handleEmailDashChange(i, evt.target.value)} />
                                        <Image src="/assets/icons/delete_w.svg" alt="remover" width={28} height={-1} style={{ marginRight: "5px", cursor: "pointer" }} onClick={() => removerEmailDash(i)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={styles.confiArea_rodape}>
                    <button className={styles.btnPadrao} onClick={() => salvarConfig()}>Salvar</button>
                </div>
            </div>
        </>
    )
}