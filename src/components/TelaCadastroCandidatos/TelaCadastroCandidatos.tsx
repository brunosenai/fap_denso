import styles from "@/styles/Cadastros.module.css"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { tCandidatoFap } from "@/utils/Types"
import { verifyIsTablet } from "@/utils/Utils"
import Load from "../Load/Load"
import PopupMessage, { PopupMessageProps } from "../Popup/PopupMessage"
import PopupSelecaoAvaliacao from "../Popup/PopupSelecaoAvaliacao"

export default function TelaCadastroCandidatos() {
    const router = useRouter()
    const [nome, setNome] = useState<string>("")
    const [cpf, setCpf] = useState<string>("")
    const [email, setEmail] = useState<string>("")

    const [candidatos, setCandidatos] = useState<tCandidatoFap[]>([])
    const [candidatosFiltrados, setCandidatosFiltrados] = useState<tCandidatoFap[]>([])

    const [filtroAvaliacoes, setFiltroAvaliacoes] = useState("")
    const [filtroCandidatos, setFiltroCandidatos] = useState("")

    const [isTablet, setIsTablet] = useState<boolean>()
    const [load, setLoad] = useState<boolean>(false)
    const [popupPesquisarAvaliacao, setPopupPesquisarAvaliacao] = useState<boolean>(false)
    const [popupMessage, setPopupMessage] = useState<boolean>(false)
    const [dadosPopupMessage, setDadosPopupMessage] = useState<PopupMessageProps>({
        tipo: 0,
        titulo: "",
        mensagem: "",
        comandoOK: () => setPopupMessage(false)
    })

    useEffect(() => {
        setIsTablet(verifyIsTablet())
        obterCandidatos()
    }, [])

    // =========================================================================
    // FILTRO DINÂMICO
    // =========================================================================
    useEffect(() => {
        // Blindagem para evitar erro se candidatos não for um array
        if (!Array.isArray(candidatos)) return;

        if (filtroCandidatos.trim() === "") {
            setCandidatosFiltrados(candidatos)
        } else {
            const resFiltro = candidatos.filter(a =>
                a.s_nome_candidato.toLowerCase().includes(filtroCandidatos.toLowerCase())
            )
            setCandidatosFiltrados(resFiltro)
        }
    }, [filtroCandidatos, candidatos])

    // =========================================================================
    // MÁSCARA DE CPF
    // =========================================================================
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, ""); // Remove tudo o que não é dígito
        if (v.length > 11) v = v.slice(0, 11);

        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

        setCpf(v);
    }

    const obterCandidatos = async () => {
        setLoad(true)
        const endpoint = `/api/apiFap?action=getAllCandidatosFap_cad&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`
        fetch(endpoint)
            .then(res => res.json())
            .then(res => {
                if (Array.isArray(res)) {
                    setCandidatos(res)
                } else {
                    setCandidatos([])
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoad(false))
    }

    const cadastrarCandidato = async () => {
        if (nome.trim() == "" || cpf.trim() == "" || email.trim() == "") {
            setDadosPopupMessage({
                tipo: 3,
                titulo: "Erro",
                mensagem: "Preencha todos os campos obrigatórios!",
                comandoOK: () => setPopupMessage(false)
            })
            setPopupMessage(true)
            return
        }
        
        setLoad(true)
        const endpoint = `/api/apiCandidato`
        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                s_nome_candidato: nome,
                // Limpa a máscara antes de enviar para o banco de dados
                s_cpf_candidato: cpf.replace(/\D/g, ""),
                s_email_candidato: email,
                apiKey: process.env.NEXT_PUBLIC_API_KEY
            })
        })
            .then(res => {
                if (res.status != 200) {
                    setDadosPopupMessage({
                        tipo: 3,
                        titulo: "Erro",
                        mensagem: "Erro ao gravar candidato!",
                        comandoOK: () => setPopupMessage(false)
                    })
                    setPopupMessage(true)
                } else {
                    setDadosPopupMessage({
                        tipo: 1,
                        titulo: "Sucesso",
                        mensagem: "Candidato cadastrado com sucesso",
                        comandoOK: () => setPopupMessage(false)
                    })
                    setPopupMessage(true)
                    setNome("")
                    setCpf("")
                    setEmail("")
                    obterCandidatos()
                }
            })
            .finally(() => setLoad(false))
    }

    const baixaRelatorios = async (relatorios: any) => {
        const listaArquivos = Array.isArray(relatorios) ? relatorios : [relatorios];
        const relatoriosValidos = listaArquivos.filter(arquivo => arquivo !== null && arquivo !== undefined && arquivo !== "");
        
        if (relatoriosValidos.length === 0) {
            setDadosPopupMessage({
                tipo: 2,
                titulo: "Alerta",
                mensagem: "Ainda não há relatórios em PDF gerados para este candidato.",
                comandoOK: () => setPopupMessage(false)
            })
            setPopupMessage(true)
            return;
        }

        relatoriosValidos.forEach((nomeArquivo) => {
            let urlCorreta = nomeArquivo;
            if (urlCorreta.includes('/relatorios/')) {
                urlCorreta = urlCorreta.replace('/relatorios/', '/api/downloadPdf?file=');
            } else if (!urlCorreta.includes('/api/downloadPdf')) {
                urlCorreta = `/api/downloadPdf?file=${urlCorreta}`;
            }
            const nomePuroParaDownload = urlCorreta.split('file=')[1] || 'relatorio_fap.pdf';
            const link = document.createElement('a');
            link.href = urlCorreta;
            link.setAttribute('target', '_blank');
            link.setAttribute('download', nomePuroParaDownload);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    const enviarEmail = async (relatorios: any) => {
        const listaArquivos = Array.isArray(relatorios) ? relatorios : [relatorios];
        const relatoriosValidos = listaArquivos.filter(arquivo => arquivo !== null && arquivo !== undefined && arquivo !== "");
        
        if (relatoriosValidos.length === 0) {
            setDadosPopupMessage({
                tipo: 2,
                titulo: "Alerta",
                mensagem: "Ainda não há relatórios em PDF gerados para este candidato.",
                comandoOK: () => setPopupMessage(false)
            })
            setPopupMessage(true)
            return;
        }

        try {
            setLoad(true)
            const emailEndpoint = `/api/apiEnviarEmail`;
            const responseEmail = await fetch(emailEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assunto: `Relatórios FAP - Avaliação Concluída (${new Date().toLocaleDateString()})`,
                    arquivos: relatorios,
                    apiKey: process.env.NEXT_PUBLIC_API_KEY
                })
            })
            if (!responseEmail.ok) {
                throw new Error("Falha na resposta da API de e-mail");
            } else {
                setDadosPopupMessage({
                    tipo: 1,
                    titulo: "Sucesso",
                    mensagem: "E-mail enviado com sucesso!",
                    comandoOK: () => setPopupMessage(false)
                })
                setPopupMessage(true)
            }
        } catch (error) {
            console.error("Erro ao enviar o e-mail:", error);
            setDadosPopupMessage({
                tipo: 3,
                titulo: "Erro",
                mensagem: "Ocorreu um erro ao tentar enviar o e-mail para a empresa.",
                comandoOK: () => setPopupMessage(false)
            })
            setPopupMessage(true)
        } finally {
            setLoad(false)
        }
    }

    const limparFiltros = () => {
        setFiltroAvaliacoes("")
        setFiltroCandidatos("")
        obterCandidatos()
    }

    const pesquisarCandidatoPelaAvaliacao = async () => {
        if (!filtroAvaliacoes || filtroAvaliacoes.trim() === "") {
            obterCandidatos();
            return;
        }

        try {
            setLoad(true)
            const endpoint = `/api/apiCandidato?action=getCandidatosByAvaliacaoFiltro&nomeAvaliacao=${encodeURIComponent(filtroAvaliacoes)}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
            const response = await fetch(endpoint)
            const res = await response.json()
            if (Array.isArray(res)) {
                setCandidatos(res)
            } else {
                setCandidatos([])
            }
        } catch (error) {
            console.error("Erro ao pesquisar candidatos pela avaliação:", error);
            setDadosPopupMessage({
                tipo: 3,
                titulo: "Erro",
                mensagem: "Ocorreu um erro ao pesquisar candidatos pela avaliação.",
                comandoOK: () => setPopupMessage(false)
            })
            setPopupMessage(true)
        } finally {
            setLoad(false)
        }
    }

    return (
        <>
            {load && <Load />}
            {popupPesquisarAvaliacao && <PopupSelecaoAvaliacao setFiltroAvaliacoes={setFiltroAvaliacoes} comandoFechar={() => setPopupPesquisarAvaliacao(false)} />}
            {popupMessage && <PopupMessage tipo={dadosPopupMessage.tipo} titulo={dadosPopupMessage.titulo} mensagem={dadosPopupMessage.mensagem} comandoOK={dadosPopupMessage.comandoOK} />}
            <div className={styles.telaCadastro}>
                <div className={styles.telaCadastro_sessao1}>
                    <div className={styles.telaCadastro_topo}>
                        <Image src='/assets/icons/novo_candidato.svg' alt='Cadastro de Candidatos' width={40} height={40} />
                        <h1>NOVO CANDIDATO</h1><br />
                    </div>
                    <div className={styles.telaCadastro_form}>
                        <div className={styles.fieldForm}>
                            <label htmlFor={`nome`}>Nome Completo<span className={styles.obrigatorio}>*</span></label>
                            <input type="text" id={`nome`} value={nome} onChange={(e) => setNome(e.target.value)} />
                        </div>
                        <div className={styles.fieldForm}>
                            <label htmlFor={`cpf`}>CPF<span className={styles.obrigatorio}>*</span></label>
                            <input 
                                type="text" 
                                id={`cpf`} 
                                value={cpf} 
                                onChange={handleCpfChange} 
                                maxLength={14}
                                placeholder="000.000.000-00"
                            />
                        </div>
                        <div className={styles.fieldForm}>
                            <label htmlFor={`email`}>E-Mail<span className={styles.obrigatorio}>*</span></label>
                            <input type="text" id={`email`} value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className={styles.fieldForm_center}>
                            <button className={styles.btnPadrao} onClick={() => cadastrarCandidato()}>cadastrar novo</button>
                        </div>
                    </div>
                </div>
                <div className={styles.telaCadastro_sessao2}>
                    <div className={styles.telaCadastro_lista}>
                        <div className={styles.telaCadastro_lista_filtro}>
                            <div className={styles.telaCadastro_area_filtro_c1}>
                                <div className={styles.fieldForm}>
                                    <input
                                        type="text"
                                        placeholder="Pesquise pelo nome do candidato"
                                        id={`filtro`}
                                        value={filtroCandidatos}
                                        onChange={(e) => setFiltroCandidatos(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className={styles.telaCadastro_area_filtro_c2}>
                                <div className={styles.fieldForm_col}>
                                    <div className={styles.fieldForm_icon}>
                                        <input
                                            type="text"
                                            placeholder="Nome da avaliação"
                                            id={`filtroAvaliacao`}
                                            value={filtroAvaliacoes}
                                            onChange={(e) => setFiltroAvaliacoes(e.target.value)}
                                        />
                                        <button type="button" title="selecionar avaliações" onClick={() => setPopupPesquisarAvaliacao(true)}>
                                            <Image src='/assets/icons/nova_avaliacao_w.svg' alt={""} width={15} height={15} />
                                        </button>
                                    </div>
                                    <button type="button" title="pesquisar avaliações" className={styles.btnPesquisa} onClick={() => pesquisarCandidatoPelaAvaliacao()}>
                                        <Image src='/assets/icons/search_w.svg' alt={""} width={20} height={20} />
                                    </button>
                                    <button type="button" title="Limpar filtros" className={styles.btnPesquisa} onClick={() => limparFiltros()}>
                                        <Image src='/assets/icons/search_off_w.svg' alt={""} width={20} height={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.telaCadastro_lista_titulos}>
                            <div className={`${styles.c_titulo} ${styles.c1_candidato}`}>Nome</div>
                            <div className={`${styles.c_titulo} ${styles.c2_candidato}`}>E-Mail</div>
                            <div className={`${styles.c_titulo} ${styles.c3_candidato} ${styles.c_comandos}`}>
                                <Image src='/assets/icons/file_export_w.svg' alt={""} width={25} height={25}></Image>
                                <Image src='/assets/icons/mail_w.svg' alt={""} width={25} height={25}></Image>
                            </div>
                            {!isTablet && <div className={`${styles.c_titulo} ${styles.espacoBarraRolagem}`}></div>}
                        </div>
                        <div className={styles.telaCadastro_lista_dados}>
                            {candidatosFiltrados.map((av, index) => {
                                const temRelatorio = Array.isArray(av.relatorios) && av.relatorios.some(
                                    (rel) => rel !== null && rel !== 'null' && rel !== ""
                                );

                                return (
                                    <div key={index} className={styles.telaCadastro_lista_dados_linha}>
                                        <div className={`${styles.c_dado} ${styles.c1_candidato}`}>{av.s_nome_candidato}</div>
                                        <div className={`${styles.c_dado} ${styles.c2_candidato}`}>{av.s_email_candidato}</div>
                                        <div className={`${styles.c_dado} ${styles.c3_candidato} ${styles.c_comandos}`}>
                                            <Image
                                                src={temRelatorio ? '/assets/icons/file_export.svg' : '/assets/icons/nofile_r.svg'}
                                                alt="Baixar"
                                                width={25}
                                                height={25}
                                                onClick={() => temRelatorio && baixaRelatorios(av.relatorios)}
                                                style={{ cursor: temRelatorio ? 'pointer' : 'default' }}
                                            />
                                            <Image
                                                src={temRelatorio ? '/assets/icons/mail.svg' : '/assets/icons/nomail_r.svg'}
                                                alt="E-mail"
                                                width={25}
                                                height={25}
                                                onClick={() => temRelatorio && enviarEmail(av.relatorios)}
                                                style={{ cursor: temRelatorio ? 'pointer' : 'default' }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}