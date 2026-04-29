import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { verifyIsTablet } from "@/utils/Utils"
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import TopoSelecaoAvaliacao from "@/components/Topo/TopoSelecaoAvaliacao";
import { tAvaliacao, tcandidatoAvaliacao } from "@/utils/Types";
import PopupTrazerCandidato from "@/components/Popup/PopupTrazerCandidato";
import PopupMovimentacaoAvancada from "@/components/Popup/PopupMovimentacaoAvancada";
import { formatarCPF } from "@/utils/Utils";
import Load from "@/components/Load/Load";

let n_id_pessoa: number = -1;

export default function Home() {
  const router = useRouter();
  const [avaliacoes, setAvaliacoes] = useState<tAvaliacao[]>([]);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<number>(-1);
  const [candidatos, setCandidatos] = useState<tcandidatoAvaliacao[]>([]);
  const [candidatosSelecionados, setCandidatosSelecionados] = useState<number[]>([]);
  const [qtdAvaliadores, setQtdAvaliadores] = useState<number>(1);
  const [maxCandidatosSelecionados, setMaxCandidatosSelecionados] = useState(0);
  const [isTablet, setIsTablet] = useState<boolean>()
  const [load, setLoad] = useState<boolean>(false)
  const [mostrarTelaTrazerCandidato, setMostrarTelaTrazerCandidato] = useState<boolean>(false)
  const [mostrarTelaMovimentacaoAvancada, setMostrarTelaMovimentacaoAvancada] = useState<boolean>(false)

  useEffect(() => {
    n_id_pessoa = localStorage.getItem('n_id_pessoa') ? Number(localStorage.getItem('n_id_pessoa')) : -1;
    setIsTablet(verifyIsTablet());
    getAvaliacoes();
  }, []);

  // =========================================================================
  // POLLING: Sincronização automática entre tablets
  // =========================================================================
  useEffect(() => {
    setIsTablet(verifyIsTablet());
    let intervalo: NodeJS.Timeout;
    
    if (avaliacaoSelecionada !== -1) {
      intervalo = setInterval(() => {
        getCandidatosByAvaliacao(avaliacaoSelecionada, false);
      }, 2000); 
    }
    
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [avaliacaoSelecionada]);

  const changeQtdAvaliadores = (qtd: number) => {
    const maxCandidatosSelecionados = Math.ceil(candidatos.length / qtd)
    setMaxCandidatosSelecionados(maxCandidatosSelecionados)
    setQtdAvaliadores(qtd)
    setCandidatosSelecionados([])
  }

  const getAvaliacoes = async () => {
    setLoad(true)
    try {
      const endpoint = `/api/apiAvaliacao?action=getAvaliacoesHojeEmDiante&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
      fetch(endpoint, { method: "GET" })
      .then(res => res.json())
      .then(data => {
        setAvaliacoes(data);
        setLoad(false)
      })
    } catch (e) {
      console.error(`Erro:${e}`)
    } finally {
      setLoad(false)
    }
  }

  const setAvaliacao = (idAvaliacao: number) => {
    setAvaliacaoSelecionada(idAvaliacao);
    setCandidatosSelecionados([]); 
    getCandidatosByAvaliacao(idAvaliacao);
  }

  const getCandidatosByAvaliacao = async (idAvaliacao: number, showLoad: boolean = true) => {
    if(showLoad) setLoad(true)
    try {
      const endpoint = `/api/apiCandidato?action=getCandidatosByAvaliacao&n_id_avaliacao=${idAvaliacao}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
      fetch(endpoint, { method: "GET" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            setCandidatos(data);
            
            // ATUALIZA AS CHECKBOXES COM BASE NO BANCO
            const meusCandidatosDb = data
              .filter(c => c.n_id_pessoa === n_id_pessoa)
              .map(c => c.n_id_candidato);
            
            setCandidatosSelecionados(meusCandidatosDb);
            const maxCandidatos = data.length; 
            setMaxCandidatosSelecionados(maxCandidatos);
            
        } else {
            setCandidatos([]);
            setCandidatosSelecionados([]);
        }
        setLoad(false)
      });
    } catch (erro) {
      setLoad(false)
      console.error(`Erro:${erro}`)
    } finally {
      setLoad(false)
    }
  }

  const marcarFalta = async (idCandidato: number, idAvaliacao: number, statusPresenteAtual: number) => {
    const atual = statusPresenteAtual ?? 1;
    const novoStatus = atual === 0 ? 1 : 0;

    setCandidatos(prev => prev.map(c => 
      c.n_id_candidato === idCandidato 
        ? { ...c, n_candidatopresente_fap: novoStatus } 
        : c
    ));

    if (novoStatus === 0) {
      setCandidatosSelecionados(prev => prev.filter(id => id !== idCandidato));
    }

    try {
      await fetch('/api/apiCandidato', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'marcarFalta',
          id_avaliacao: idAvaliacao,
          id_candidato: idCandidato,
          presente: novoStatus,
          apiKey: process.env.NEXT_PUBLIC_API_KEY
        })
      });
    } catch (error) {
      console.error("Erro ao registar a falta:", error);
    }
  }

  const selecionaCandidato = async (idCandidato: number, selecionado: boolean, statusPresenteAtual: number) => {
    
    // Para a API e banco de dados, tem de ir null para não quebrar a Foreign Key
    const pessoaId = selecionado ? n_id_pessoa : null;

    if (selecionado) {
      setCandidatosSelecionados(prev => [...prev, idCandidato]);
      setCandidatos(prev => prev.map(c => c.n_id_candidato === idCandidato ? { ...c, n_id_pessoa: n_id_pessoa } : c));
    } else {
      setCandidatosSelecionados(prev => prev.filter(id => id !== idCandidato));
      // PARA O TYPESCRIPT: Usamos 0 localmente para limpar, pois a interface Types.ts espera um número!
      setCandidatos(prev => prev.map(c => c.n_id_candidato === idCandidato ? { ...c, n_id_pessoa: 0 } : c));
    }

    try {
      await fetch('/api/apiCandidato', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vincularAvaliador', 
          id_avaliacao: avaliacaoSelecionada,
          id_candidato: idCandidato,
          id_pessoa: pessoaId, // <-- Agora envia o null corretamente
          apiKey: process.env.NEXT_PUBLIC_API_KEY
        })
      });
    } catch (error) {
      console.error("Erro ao vincular candidato:", error);
    }

    if (selecionado) {
      const atual = statusPresenteAtual ?? 1;
      if (atual === 0) {
        setCandidatos(prev => prev.map(c => c.n_id_candidato === idCandidato ? { ...c, n_candidatopresente_fap: 1 } : c));
        try {
          await fetch('/api/apiCandidato', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'marcarFalta',
              id_avaliacao: avaliacaoSelecionada,
              id_candidato: idCandidato,
              presente: 1,
              apiKey: process.env.NEXT_PUBLIC_API_KEY
            })
          });
        } catch (error) {
          console.error("Erro ao remover a falta:", error);
        }
      }
    }
  }

  const goto = () => {
    if (candidatos.length < qtdAvaliadores) {
      alert('Número de avaliadores acima da quantidade de candidatos')
      return
    }
    if (qtdAvaliadores < 1) {
      alert('Número de avaliadores insuficiente, deve ser pelo menos 1')
      return
    }
    setLoad(true)
    const path = `/fap`
    
    if (candidatosSelecionados.length > 0) {
      localStorage.setItem('n_id_avaliacao', avaliacaoSelecionada.toString());
      localStorage.setItem('candidatos', candidatosSelecionados.join(','));
      router.push(path);
    } else {
      alert(`Selecione os seus candidatos para prosseguir`);
      setLoad(false)
    }
  }

  const atingiuLimite = candidatosSelecionados.length >= maxCandidatosSelecionados;

  const logout = async () => {
    await fetch('/api/apiLogout');
    localStorage.removeItem('n_id_pessoa');
    localStorage.removeItem('menuCadastroSelected');
    localStorage.removeItem('modo');
    localStorage.removeItem('n_id_avaliacao');
    localStorage.removeItem('candidatos');
    localStorage.removeItem('isTablet');
    localStorage.clear()
    router.replace('/');
  }

  const trazerCandidato = async (n_id_candidato: number, n_id_avaliacao_atual: number) => {
    setLoad(true)
    try {
      const endpoint = `/api/apiFap?action=getTrazerCandidado&n_id_candidato=${n_id_candidato}&n_id_avaliacao_atual=${n_id_avaliacao_atual}&n_id_avaliacao_nova=${avaliacaoSelecionada}&&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
      fetch(endpoint, { method: "GET" })
      .then(res => res.json())
      .then(data => {
        setLoad(false)
        getCandidatosByAvaliacao(avaliacaoSelecionada);
      })
    } catch (e) {
      console.error(`Erro:${e}`)
    } finally {
      setLoad(false)
    }
  }

  return (
    <>
      {load && <Load />}
      {mostrarTelaMovimentacaoAvancada && <PopupMovimentacaoAvancada comandoFechar={() => setMostrarTelaMovimentacaoAvancada(false)} />}
      {mostrarTelaTrazerCandidato && <PopupTrazerCandidato trazerCandidato={trazerCandidato} setMostrarTelaFrazerCandidato={setMostrarTelaTrazerCandidato} avaliacaoSelecionada={avaliacaoSelecionada} />}
      
      <Head>
        <title>Stellantis - Teste de Aptidão Prática</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/icons/favicon.ico" />
      </Head>
      
      <div className={styles.page}>
        <div className={styles.telaMain}>
          <TopoSelecaoAvaliacao 
            setAvaliacao={setAvaliacao} 
            avaliacoes={avaliacoes} 
            setQtdAvaliadores={changeQtdAvaliadores} 
            setMostrarTelaTrazerCandidato={setMostrarTelaTrazerCandidato} 
            setMostrarTelaMovimentacaoAvancada={setMostrarTelaMovimentacaoAvancada} 
            qtdAvaliadores={qtdAvaliadores} 
          />
          
          <div className={styles.formCandidatos}>
            {candidatos.length > 0 && candidatos.map((c) => {              
              const estaSelecionado = candidatosSelecionados.some(id => String(id) === String(c.n_id_candidato));
              const statusAtual = c.n_candidatopresente_fap ?? 1;
              const levouFalta = statusAtual === 0;

              // Identifica se o candidato tem dono E não é null E não é o utilizador atual
              const pertenceAOutro = c.n_id_pessoa !== null && c.n_id_pessoa !== n_id_pessoa;

              return (
                <div className={styles.fieldForm} key={c.n_id_candidato}>
                  
                  <div className={styles.fieldForm_inputTexts} style={{ opacity: levouFalta || pertenceAOutro ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                    <input type="text" title={''} className={styles.fieldForm_input_nome} value={c.s_nome_candidato} readOnly />
                    <input type="text" title={''} className={styles.fieldForm_input_cpf} value={formatarCPF(c.s_cpf_candidato)} readOnly />
                  </div>
                  
                  <div className={styles.fieldForm_inputCheckbox}>
                    <input
                      type='checkbox'
                      title={''}
                      className={styles.fieldForm_checkbox}
                      name={`candidato_${c.n_id_candidato}`}
                      id={`candidato_${c.n_id_candidato}`}
                      checked={estaSelecionado}
                      onChange={(evt) => selecionaCandidato(c.n_id_candidato, evt.target.checked, statusAtual)}
                      disabled={pertenceAOutro || (!estaSelecionado && atingiuLimite)} 
                    />
                  </div>
                  
                  <div 
                    className={`${styles.fieldForm_btnFalta} ${levouFalta ? styles.fieldForm_btnFalta_checked : ''}`} 
                    onClick={() => {
                        if (!pertenceAOutro) {
                            marcarFalta(c.n_id_candidato, avaliacaoSelecionada, statusAtual);
                        }
                    }}
                    style={{ cursor: pertenceAOutro ? 'not-allowed' : 'pointer', userSelect: 'none', opacity: pertenceAOutro ? 0.5 : 1 }}
                    title={levouFalta ? "Remover falta" : "Marcar falta"}
                  >
                    F
                  </div>

                </div>
              );
            })}
          </div>

          <div className={styles.rodape}>
            <div className={styles.rodape_area}>
              <button title={'voltar'} className={styles.btnPadrao_claro} onClick={() => router.replace('/selecaomodulo/adm')}>
                <Image src="/assets/icons/arrow_back.svg" alt="voltar" width={40} height={40}/>
              </button>
              <button title={'logout'} className={styles.btnPadrao_escuro} onClick={() => logout()}>
                <Image src="/assets/icons/logout.svg" alt="logout" width={40} height={40}/>
              </button>
            </div>
            <button className={styles.btnPadrao_claro_g} onClick={() => goto()}>
              <Image src="/assets/icons/rule.svg" alt="avaliação" width={40} height={40}/>
              avaliação
            </button>
          </div>
        </div>
      </div>
    </>
  )
}