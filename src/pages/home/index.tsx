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
import {formatarCPF} from "@/utils/Utils";
import Load from "@/components/Load/Load";

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
    setIsTablet(verifyIsTablet())
    getAvaliacoes();
  }, []);

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
      fetch(endpoint, {
        method: "GET"
      })
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

  const getCandidatosByAvaliacao = async (idAvaliacao: number) => {
    setLoad(true)
    try {
      const endpoint = `/api/apiCandidato?action=getCandidatosByAvaliacao&n_id_avaliacao=${idAvaliacao}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
      fetch(endpoint, {
        method: "GET"
      })
      .then(res => res.json())
      .then(data => {
        // Blindagem contra erros de resposta
        if (Array.isArray(data)) {
            setCandidatos(data);
            const maxCandidatosSelecionados = data.length
            setMaxCandidatosSelecionados(maxCandidatosSelecionados)
        } else {
            setCandidatos([]);
        }
        setLoad(false)
      });
    } catch (erro) {
      setLoad(false)
      console.error(`Erro:${erro}`)
    }
    finally {
      setLoad(false)
    }
  }

  // =========================================================================
  // AÇÃO 1: Clicar no botão F (Marca Falta, Desmarca Checkbox)
  // =========================================================================
  const marcarFalta = async (idCandidato: number, idAvaliacao: number, statusPresenteAtual: number) => {
    const atual = statusPresenteAtual ?? 1;
    const novoStatus = atual === 0 ? 1 : 0;

    // Atualização visual imediata
    setCandidatos(prev => prev.map(c => 
      c.n_id_candidato === idCandidato 
        ? { ...c, n_candidatopresente_fap: novoStatus } 
        : c
    ));

    // Se o candidato levou falta (0), removemos automaticamente a caixinha (checkbox) dele
    if (novoStatus === 0) {
      setCandidatosSelecionados(prev => prev.filter(id => id !== idCandidato));
    }

    // Envia para o banco de dados
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

  // =========================================================================
  // AÇÃO 2: Clicar na Checkbox (Marca Checkbox, Remove Falta do F)
  // =========================================================================
  const selecionaCandidato = async (idCandidato: number, selecionado: boolean, statusPresenteAtual: number) => {
    if (selecionado) {
      // 1. Marca a Checkbox
      setCandidatosSelecionados(prev => [...prev, idCandidato]);

      // 2. ALTERNÂNCIA: Se estava com falta (0), tira a falta automaticamente
      const atual = statusPresenteAtual ?? 1;
      if (atual === 0) {
        setCandidatos(prev => prev.map(c => 
          c.n_id_candidato === idCandidato 
            ? { ...c, n_candidatopresente_fap: 1 } 
            : c
        ));

        // Envia para o banco de dados para garantir que a falta foi removida
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
    } else {
      // Apenas desmarca a Checkbox
      setCandidatosSelecionados(prev => prev.filter(id => id !== idCandidato));
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
    
    // Mantendo a sua regra de prosseguir se pelo menos 1 for selecionado
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

  const trazerCandidato=async(n_id_candidato:number,n_id_avaliacao_atual:number)=>{
    setLoad(true)
    try {
      const endpoint = `/api/apiFap?action=getTrazerCandidado&n_id_candidato=${n_id_candidato}&n_id_avaliacao_atual=${n_id_avaliacao_atual}&n_id_avaliacao_nova=${avaliacaoSelecionada}&&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
      fetch(endpoint, {
        method: "GET"
      })
      .then(res => res.json())
      .then(data => {
        //setAvaliacoes(data);
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
      {mostrarTelaMovimentacaoAvancada&&<PopupMovimentacaoAvancada comandoFechar={()=>setMostrarTelaMovimentacaoAvancada(false)} />}
      {mostrarTelaTrazerCandidato&&<PopupTrazerCandidato trazerCandidato={trazerCandidato} setMostrarTelaFrazerCandidato={setMostrarTelaTrazerCandidato} avaliacaoSelecionada={avaliacaoSelecionada}/>}
      <Head>
        <title>Stellantis - Teste de Aptidão Prática</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/icons/favicon.ico" />
      </Head>
      <div className={styles.page}>
        <div className={styles.telaMain}>
          <TopoSelecaoAvaliacao setAvaliacao={setAvaliacao} avaliacoes={avaliacoes} setQtdAvaliadores={changeQtdAvaliadores} setMostrarTelaTrazerCandidato={setMostrarTelaTrazerCandidato} setMostrarTelaMovimentacaoAvancada={setMostrarTelaMovimentacaoAvancada} qtdAvaliadores={qtdAvaliadores} />
          
          <div className={styles.formCandidatos}>
            {candidatos.length > 0 && candidatos.map((c) => {              
              const estaSelecionado = candidatosSelecionados.some(id => String(id) === String(c.n_id_candidato));
              
              // Verifica se o candidato faltou (0 = Faltou, 1 = Presente)
              const statusAtual = c.n_candidatopresente_fap ?? 1;
              const levouFalta = statusAtual === 0;

              return (
                <div className={styles.fieldForm} key={c.n_id_candidato}>
                  
                  {/* Feedback visual: Se levou falta, a opacidade diminui */}
                  <div className={styles.fieldForm_inputTexts} style={{ opacity: levouFalta ? 0.5 : 1, transition: 'opacity 0.3s' }}>
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
                      disabled={!estaSelecionado && atingiuLimite}
                    />
                  </div>
                  
                  {/* Botão F: Muda de classe dinamicamente e aciona a função passando os IDs e o Status atual */}
                  <div 
                    className={`${styles.fieldForm_btnFalta} ${levouFalta ? styles.fieldForm_btnFalta_checked : ''}`} 
                    onClick={() => marcarFalta(c.n_id_candidato, avaliacaoSelecionada, statusAtual)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
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