import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { verifyIsTablet } from "@/utils/Utils"
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import TopoSelecaoAvaliacao from "@/components/Topo/TopoSelecaoAvaliacao";
import { tAvaliacao, tcandidatoAvaliacao } from "@/utils/Types";
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
  // NOVA FUNÇÃO: Marcar falta dinamicamente com Optimistic UI Update
  // =========================================================================
  const marcarFalta = async (idCandidato: number, idAvaliacao: number, statusPresenteAtual: number) => {
    // Se está 0 (Faltou), vira 1 (Presente). Se está 1, vira 0. (Prevenção caso venha undefined)
    const novoStatus = statusPresenteAtual === 0 ? 1 : 0;

    // 1. Atualização Otimista no Ecrã (O botão muda de cor instantaneamente)
    setCandidatos(prev => prev.map(c => 
      c.n_id_candidato === idCandidato 
        ? { ...c, n_candidatopresente_fap: novoStatus } 
        : c
    ));

    // 2. Se o candidato levou falta, removemos automaticamente a caixinha (checkbox) dele
    if (novoStatus === 0) {
      setCandidatosSelecionados(prev => prev.filter(id => id !== idCandidato));
    }

    // 3. Envia silenciosamente para o banco de dados
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

  // Correção na forma como o estado é atualizado para evitar bugs de re-renderização
  const selecionaCandidato = (idCandidato: number, selecionado: boolean) => {
    if (selecionado) {
      setCandidatosSelecionados(prev => [...prev, idCandidato]);
    } else {
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

  return (
    <>
      {load && <Load />}
      <Head>
        <title>Stellantis - Teste de Aptidão Prática</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/icons/favicon.ico" />
      </Head>
      <div className={styles.page}>
        <div className={styles.telaMain}>
          <TopoSelecaoAvaliacao setAvaliacao={setAvaliacao} avaliacoes={avaliacoes} setQtdAvaliadores={changeQtdAvaliadores} qtdAvaliadores={qtdAvaliadores} />
          
          <div className={styles.formCandidatos}>
            {candidatos.length > 0 && candidatos.map((c) => {              
              const estaSelecionado = candidatosSelecionados.some(id => String(id) === String(c.n_id_candidato));
              
              // Verifica se o candidato faltou (0 = Faltou, 1 = Presente)
              const levouFalta = c.n_candidatopresente_fap === 0;

              return (
                <div className={styles.fieldForm} key={c.n_id_candidato}>
                  
                  {/* Feedback visual: Se levou falta, a opacidade diminui */}
                  <div className={styles.fieldForm_inputTexts} style={{ opacity: levouFalta ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                    <input type="text" title={''} className={styles.fieldForm_input_nome} value={c.s_nome_candidato} readOnly />
                    <input type="text" title={''} className={styles.fieldForm_input_cpf} value={c.s_cpf_candidato} readOnly />
                  </div>
                  
                  <div className={styles.fieldForm_inputCheckbox}>
                    <input
                      type='checkbox'
                      title={''}
                      className={styles.fieldForm_checkbox}
                      name={`candidato_${c.n_id_candidato}`}
                      id={`candidato_${c.n_id_candidato}`}
                      checked={estaSelecionado}
                      onChange={(evt) => selecionaCandidato(c.n_id_candidato, evt.target.checked)}
                      // Bloqueia se atingiu o limite ou se o candidato tem falta
                      disabled={(!estaSelecionado && atingiuLimite) || levouFalta}
                    />
                  </div>
                  
                  {/* Botão F: Muda de classe dinamicamente e aciona a função passando os IDs e o Status atual */}
                  <div 
                    className={`${styles.fieldForm_btnFalta} ${levouFalta ? styles.fieldForm_btnFalta_checked : ''}`} 
                    onClick={() => marcarFalta(c.n_id_candidato, avaliacaoSelecionada, c.n_candidatopresente_fap)}
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
              <button title={'voltar'} className={styles.btnPadrao_claro} onClick={() => router.back()}>
                <Image src="/assets/icons/arrow_back.svg" alt="voltar" width={40} height={-1}/>
              </button>
              <button title={'logout'} className={styles.btnPadrao_escuro} onClick={() => logout()}>
                <Image src="/assets/icons/logout.svg" alt="logout" width={40} height={-1}/>
              </button>
            </div>
            <button className={styles.btnPadrao_claro_g} onClick={() => goto()}>
              <Image src="/assets/icons/rule.svg" alt="avaliação" width={40} height={-1}/>
              avaliação
            </button>
          </div>
        </div>
      </div>
    </>
  )
}