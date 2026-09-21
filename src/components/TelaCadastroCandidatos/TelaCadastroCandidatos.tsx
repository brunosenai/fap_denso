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
    const [sexo, setSexo] = useState<string>("")
    const [dtNasc, setDtNasc] = useState<string>("")
    const [escolaridade, setEscolaridade] = useState<string>("")

    const [candidatos, setCandidatos] = useState<tCandidatoFap[]>([])
    const [candidatosFiltrados, setCandidatosFiltrados] = useState<tCandidatoFap[]>([])

    // Estados de Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

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
        // A primeira carga agora também é garantida pelo useEffect do debounce abaixo, 
        // mas mantemos aqui por segurança de inicialização.
        obterCandidatos(1) 
    }, [])

    // =========================================================================
    // FILTRO DINÂMICO NO SERVIDOR (Debounce)
    // =========================================================================
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Toda vez que digitar no filtro, volta para a página 1 da pesquisa
            obterCandidatos(1, filtroCandidatos);
        }, 500);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtroCandidatos])

    // =========================================================================
    // MÁSCARA DE CPF
    // =========================================================================
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, ""); 
        if (v.length > 11) v = v.slice(0, 11);

        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

        setCpf(v);
    }

    // =========================================================================
    // BUSCA COM PAGINAÇÃO E FILTRO
    // =========================================================================
    const obterCandidatos = async (pagina: number = 1, termoBusca: string = filtroCandidatos) => {
        setLoad(true)
        // Passa o termo de busca na URL
        const endpoint = `/api/apiFap?action=getAllCandidatosFap_cad&pagina=${pagina}&busca=${encodeURIComponent(termoBusca)}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`
        fetch(endpoint)
        .then(res => res.json())
        .then(res => {
            if (res.dados && Array.isArray(res.dados)) {
                setCandidatos(res.dados)
                setCandidatosFiltrados(res.dados) // A API já traz filtrado!
                setPaginaAtual(res.paginaAtual)
                setTotalPaginas(res.totalPaginas)
            } 
            // Fallback caso a API retorne a lista antiga
            else if (Array.isArray(res)) {
                setCandidatos(res)
                setCandidatosFiltrados(res)
                setPaginaAtual(1)
                setTotalPaginas(1)
            } else {
                setCandidatos([])
                setCandidatosFiltrados([])
            }
            setLoad(false)
        })
        .catch(err =>{
            setLoad(false);
            console.error(err)
        })
    }

    const cadastrarCandidato = async () => {
        if (nome.trim() === "" || cpf.trim() === "" || email.trim() === "" || sexo.trim() === "") {
            setDadosPopupMessage({
                tipo: 3,
                titulo: "Erro",
                mensagem: "Preencha todos os campos obrigatórios!",
                comandoOK: () => setPopupMessage(false)
            })
            setPopupMessage(true)
            return
        }

        const dados = {
            s_nome_candidato: nome,
            s_cpf_candidato: cpf.replace(/\D/g, ""),
            s_email_candidato: email,
            s_sexo_candidato: sexo,
            s_dt_nasc_candidato: dtNasc,
            s_escolaridade_candidato: escolaridade,
            apiKey: process.env.NEXT_PUBLIC_API_KEY
        }

        setLoad(true)
        try {
            const endpoint = `/api/apiCandidato`
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            })

            const data = await res.json().catch(() => null);

            if (res.status !== 200) {
                setDadosPopupMessage({
                    tipo: 3,
                    titulo: "Erro",
                    mensagem: data?.message || "Erro ao gravar candidato!",
                    comandoOK: () => setPopupMessage(false)
                })
                setPopupMessage(true)
            } else {
                setDadosPopupMessage({
                    tipo: 1,
                    titulo: "Sucesso",
                    mensagem: data?.message || "Candidato cadastrado com sucesso",
                    comandoOK: () => setPopupMessage(false)
                })
                setPopupMessage(true)
                setNome("")
                setCpf("")
                setEmail("")
                setSexo("")
                setDtNasc("")
                setEscolaridade("")
                obterCandidatos(1) // Força a voltar para a primeira página para ver o novo
            }
        } catch (error) {
            console.error(error)
            setDadosPopupMessage({
                tipo: 3,
                titulo: "Erro",
                mensagem: "Ocorreu um erro de conexão ao gravar o candidato!",
                comandoOK: () => setPopupMessage(false)
            })
            setPopupMessage(true)
        } finally {
            setLoad(false)
        }
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
        obterCandidatos(1, "") // Reseta para a primeira página e limpa a busca
    }

    const pesquisarCandidatoPelaAvaliacao = async () => {
        if (!filtroAvaliacoes || filtroAvaliacoes.trim() === "") {
            obterCandidatos(1);
            return;
        }
        try {
            setLoad(true)
            const endpoint = `/api/apiCandidato?action=getCandidatosByAvaliacaoFiltro&nomeAvaliacao=${encodeURIComponent(filtroAvaliacoes)}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
            const response = await fetch(endpoint)
            const res = await response.json()
            if (Array.isArray(res)) {
                setCandidatos(res)
                setCandidatosFiltrados(res)
                // Como esta rota específica não está paginada, resetamos visualmente os botões
                setPaginaAtual(1);
                setTotalPaginas(1);
            } else {
                setCandidatos([])
                setCandidatosFiltrados([])
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
            {popupPesquisarAvaliacao && <PopupSelecaoAvaliacao setFiltroAvaliacoes={setFiltroAvaliacoes} comandoFechar={() =>{setPopupPesquisarAvaliacao(false)}}/>}
            {popupMessage && <PopupMessage tipo={dadosPopupMessage.tipo} titulo={dadosPopupMessage.titulo} mensagem={dadosPopupMessage.mensagem} comandoOK={dadosPopupMessage.comandoOK} />}
            <div className={styles.telaCadastro}>
                <div className={styles.telaCadastro_sessao1}>
                    <div className={styles.telaCadastro_topo}>
                        <Image src='/assets/icons/novo_candidato.svg' alt='Cadastro de Candidatos' width={30} height={-1} />
                        <h1>NOVO CANDIDATO</h1><br />
                    </div>
                    <div className={styles.telaCadastro_form}>
                        <div className={styles.telaCadastro_form_ladoAlado}>
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
                        </div>
                        <div className={styles.telaCadastro_form_ladoAlado}>
                            <div className={styles.fieldForm}>
                                <label htmlFor={`sexo`}>Sexo<span className={styles.obrigatorio}>*</span></label>
                                <select 
                                    id={`sexo`} 
                                    value={sexo} 
                                    onChange={(e) => setSexo(e.target.value)}
                                >
                                    <option value={''}>Selecione o sexo</option>
                                    <option value={'m'}>Masculino</option>
                                    <option value={'f'}>Feminino</option>
                                </select>
                            </div>
                            <div className={styles.fieldForm}>
                                <label htmlFor={`dtNasc`}>Data Nascimento</label>
                                <input type="date" id={`dtNasc`} value={dtNasc} onChange={(e) => setDtNasc(e.target.value)} />
                            </div>                            
                            <div className={styles.fieldForm}>
                                <label htmlFor={`escolaridade`}>Escolaridade</label>
                                <select 
                                    id={`escolaridade`} 
                                    value={escolaridade} 
                                    onChange={(e) => setEscolaridade(e.target.value)}
                                >
                                    <option value={''}>Selecione a escolaridade</option>
                                    <option value={'1'}>Analfabeto</option>
                                    <option value={'2'}>Fundamental Incompleto</option>
                                    <option value={'3'}>Fundamental Completo</option>
                                    <option value={'4'}>Médio Incompleto</option>
                                    <option value={'5'}>Médio Completo</option>
                                    <option value={'6'}>Superior Incompleto</option>
                                    <option value={'7'}>Superior Completo</option>
                                    <option value={'8'}>Pós Graduação</option>
                                </select>
                            </div>
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
                        
                        {/* === BARRA DE PAGINAÇÃO === */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '15px 0', width: '100%', alignItems: 'center', backgroundColor: '#fff', borderTop: '1px solid #ccc' }}>
                            <button 
                                className={styles.btnPadrao} 
                                style={{ width: '120px', opacity: paginaAtual <= 1 ? 0.5 : 1, cursor: paginaAtual <= 1 ? 'not-allowed' : 'pointer', height: '35px' }}
                                disabled={paginaAtual <= 1}
                                onClick={() => obterCandidatos(paginaAtual - 1)}
                            >
                                Anterior
                            </button>
                            
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#222' }}>
                                Página {paginaAtual} de {totalPaginas}
                            </span>
                            
                            <button 
                                className={styles.btnPadrao} 
                                style={{ width: '120px', opacity: paginaAtual >= totalPaginas ? 0.5 : 1, cursor: paginaAtual >= totalPaginas ? 'not-allowed' : 'pointer', height: '35px' }}
                                disabled={paginaAtual >= totalPaginas}
                                onClick={() => obterCandidatos(paginaAtual + 1)}
                            >
                                Próxima
                            </button>
                        </div>
                        {/* ========================== */}
                        
                    </div>
                </div>
            </div>
        </>
    )
}