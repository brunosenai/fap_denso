import Head from "next/head";
import styles from "@/styles/Fap.module.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import TopoFap from "@/components/Topo/TopoFap";
import PopupMessage, { PopupMessageProps } from "@/components/Popup/PopupMessage";
import { tCandidato, tFap, tAvaliacao, tConfigFap } from "@/utils/Types";
import FapFap from "@/components/Fap/Fap";
import Image from "next/image";
import Load from "@/components/Load/Load";
import PopupFap from "@/components/Popup/PopupFap";
import PopupConfirmation from "@/components/Popup/PopupConfirmation";
import PopupRetry from "@/components/Popup/PopupRetry";

export default function Fap() {
  const router = useRouter();
  const [listaCandidatos, setListaCandidatos] = useState<tCandidato[]>([]);
  const [avaliacao, setAvaliacao] = useState<tAvaliacao>();
  const [fap, setFap] = useState<tFap[]>([]);
  const [fapConfig, setFapConfig] = useState<tConfigFap | null>(null);
  
  const [abaAtual, setAbaAtual] = useState<number>(0);
  const [abaObservacaoAberta, setAbaObservacaoAberta] = useState<boolean>(false);
  const [load, setLoad] = useState(false);
  
  const [popupInfoQuestao, setPopupInfoQuestao] = useState<any>(null); // To dynamically show popup

  const [popupConfirm, setPopupConfirm] = useState(false);
  const [popupRetry, setPopupRetry] = useState(false);
  const [nomeAvaliador, setNomeAvaliador] = useState<string>('')
  
  const [dadosCarregados, setDadosCarregados] = useState<boolean>(false);

  const [popupMessage, setPopupMessage] = useState<boolean>(false)
  const [dadosPopupMessage, setDadosPopupMessage] = useState<PopupMessageProps>({
    tipo: 0,
    titulo: "",
    mensagem: "",
    comandoOK: () => setPopupMessage(false)
  })

  useEffect(() => { 
    setNomeAvaliador(localStorage.getItem('s_nome_pessoa') || ''); 
    buscarDados();
  }, []);

  const buscarDados = async () => {
    setLoad(true);
    const candidatosSelecionados = localStorage.getItem("candidatos")?.split(",").map(id => parseInt(id)) || [];
    const idavaliacao = localStorage.getItem("n_id_avaliacao") ? parseInt(localStorage.getItem("n_id_avaliacao")!) : -1;
    const endpoint = `/api/apiCandidato?action=getDadosByFap&listaIds=${candidatosSelecionados}&n_id_avaliacao=${idavaliacao}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
    const endpointConfig = `/api/apiConfig?action=getConfis&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
    
    try {
      // Busca Configuração da FAP
      let configData: tConfigFap | null = null;
      try {
        const resConfig = await fetch(endpointConfig, { method: "GET" });
        const dataConfig = await resConfig.json();
        if (dataConfig && dataConfig.length > 0 && dataConfig[0].j_config_fap) {
          configData = typeof dataConfig[0].j_config_fap === 'string' ? JSON.parse(dataConfig[0].j_config_fap) : dataConfig[0].j_config_fap;
          setFapConfig(configData);
        }
      } catch (e) {
        console.error("Erro lendo config FAP", e);
      }

      // Busca Avaliações
      const res = await fetch(endpoint, { method: "GET" });
      const data = await res.json();
      
      setListaCandidatos(data.candidatos);
      setAvaliacao(data.avaliacao);        
      
      let fapInicial: tFap[] = [];

      if (data.fap && data.fap.length > 0) {
        fapInicial = data.candidatos.map((candidato: tCandidato) => {
          let fichaDoCandidato = data.fap.find((f: tFap) => f.n_id_candidato === candidato.n_id_candidato);
          
          if (fichaDoCandidato) {
            fichaDoCandidato.dt_date_fap = data.avaliacao.dt_data_avaliacao;
            fichaDoCandidato.n_id_avaliacao = idavaliacao;
            fichaDoCandidato.n_id_pessoa = localStorage.getItem("n_id_pessoa") ? parseInt(localStorage.getItem("n_id_pessoa")!) : -1;
            
            if(typeof fichaDoCandidato.j_respostas === 'string'){
              try { fichaDoCandidato.j_respostas = JSON.parse(fichaDoCandidato.j_respostas); } 
              catch(e) { fichaDoCandidato.j_respostas = {}; }
            }
            if(!fichaDoCandidato.j_respostas) fichaDoCandidato.j_respostas = {};
          }
          return fichaDoCandidato;
        }).filter((f: tFap | undefined) => f !== undefined);
      }

      // Recuperação de Cache
      const nomeDoCache = `fap_cache_aval_${idavaliacao}`;
      const cacheSalvo = localStorage.getItem(nomeDoCache);

      if (cacheSalvo) {
        try {
          const fapRecuperado = JSON.parse(cacheSalvo);
          const cacheValido = fapRecuperado.length === candidatosSelecionados.length && fapRecuperado.every((item: tFap) => 
            candidatosSelecionados.includes(item.n_id_candidato)
          );

          if (cacheValido) {
            fapInicial = fapRecuperado;
            console.log("📦 Progresso recuperado do cache!");
          } else {
            localStorage.removeItem(nomeDoCache);
          }
        } catch (e) {
          console.error("Erro ao ler cache:", e);
        }
      }

      setFap(fapInicial);
      setDadosCarregados(true);

    } catch(erro) {
      console.error(`Erro:${erro}`);
    } finally {
      setLoad(false);
    }
  }

  useEffect(() => {
    if (dadosCarregados && fap.length > 0) {
      const idavaliacao = localStorage.getItem("n_id_avaliacao");
      if (idavaliacao) {
        localStorage.setItem(`fap_cache_aval_${idavaliacao}`, JSON.stringify(fap));
      }
    }
  }, [fap, dadosCarregados]);

  const validarFap = (): boolean => {
    if(!fapConfig) return false;
    let isValid = true;
    
    fap.forEach((f) => {
      const resp = f.j_respostas as any || {};
      
      // Valida se tem pelo menos um posto
      const postosAtivos = fapConfig.postos.filter(p => p.habilitado);
      if(postosAtivos.length > 0) {
        let marcouPosto = false;
        postosAtivos.forEach(p => {
          if(resp[`posto_${p.id}`] === 1) marcouPosto = true;
        });
        if(!marcouPosto) isValid = false;
      }
      
      // Valida se respondeu todas as questoes habilitadas
      fapConfig.questoes.filter(q => q.habilitada).forEach(q => {
        const val = resp[`q_${q.id}`];
        if (val === undefined || val === null) {
          isValid = false;
        } else {
          if (q.tipo === 'sn' && (val < 0 || val > 1)) isValid = false;
          if (q.tipo === 'num' && (val < 1 || val > 4)) isValid = false;
        }
      });
    });  
    
    return isValid;
  }

  const calcularNota = (itemFap: tFap): number[] => {
    if(!fapConfig) return [0,0];
    
    let nota = 0;
    const mediaAprovacao = fapConfig.notaDeCorte; 
    let falhouEliminatoria = false;
    
    const resp = itemFap.j_respostas as any || {};

    fapConfig.questoes.filter(q => q.habilitada).forEach(q => {
      const val = resp[`q_${q.id}`];
      if (val !== undefined && val !== null) {
        if (q.tipo === 'num' && val > 0) {
           nota += val * q.peso;
        } else if (q.tipo === 'sn' && val === 1) {
           nota += 1 * q.peso;
        }

        // Verifica Eliminatória
        if (q.eliminatoria && val === 0) { // Se tipo sn e val 0, ou num e val 0 (embora num seja 1-4)
            falhouEliminatoria = true;
        }
      }
    });

    // Corrige problema de precisão de ponto flutuante
    nota = Math.round(nota * 100) / 100;

    // Calcula a nota máxima possível para descobrir se a nota de corte é percentual
    let maxNota = 0;
    fapConfig.questoes.filter(q => q.habilitada).forEach(q => {
        if (q.tipo === 'num') maxNota += 4 * q.peso;
        else if (q.tipo === 'sn') maxNota += 1 * q.peso;
    });

    let aprovado = 0;
    
    // Se a nota de corte configurada for MAIOR que a nota máxima possível (ex: 70 > 22), 
    // significa que o usuário configurou como PORCENTAGEM (70%).
    if (mediaAprovacao > maxNota) {
      const percentualAtual = (nota / maxNota) * 100;
      if (percentualAtual >= mediaAprovacao && !falhouEliminatoria) {
        aprovado = 1;
      }
    } else {
      // Caso contrário, é pontuação absoluta
      if (nota >= mediaAprovacao && !falhouEliminatoria) {
        aprovado = 1;
      }
    }
    
    return [nota, aprovado];
  }

  const salvar = async (): Promise<boolean> => {
    if (!validarFap()) {
      setDadosPopupMessage({
        tipo: 2, 
        titulo: "Alerta",
        mensagem: "Por favor, preencha todos os campos obrigatórios de todos os candidatos antes de salvar.",
        comandoOK: () => setPopupMessage(false)
      });
      setPopupMessage(true);
      return false; 
    }
 
    const fapFinalizado = fap.map((f) => {
      const [nota, aprovado] = calcularNota(f);
      const resp = f.j_respostas as any || {};
      
      return {
        ...f,
        n_q6_fap: resp['q_1'] !== undefined ? resp['q_1'] : f.n_q6_fap,
        n_q7_fap: resp['q_2'] !== undefined ? resp['q_2'] : f.n_q7_fap,
        n_q8_fap: resp['q_3'] !== undefined ? resp['q_3'] : f.n_q8_fap,
        n_q9_fap: resp['q_4'] !== undefined ? resp['q_4'] : f.n_q9_fap,
        n_q10_fap: resp['q_5'] !== undefined ? resp['q_5'] : f.n_q10_fap,
        n_q11_fap: resp['q_6'] !== undefined ? resp['q_6'] : f.n_q11_fap,
        n_q12_fap: resp['q_7'] !== undefined ? resp['q_7'] : f.n_q12_fap,
        n_posto1_fap: resp['posto_1'] !== undefined ? resp['posto_1'] : f.n_posto1_fap,
        n_posto2_fap: resp['posto_2'] !== undefined ? resp['posto_2'] : f.n_posto2_fap,
        n_posto3_fap: resp['posto_3'] !== undefined ? resp['posto_3'] : f.n_posto3_fap,
        n_posto4_fap: resp['posto_4'] !== undefined ? resp['posto_4'] : f.n_posto4_fap,
        n_posto5_fap: resp['posto_5'] !== undefined ? resp['posto_5'] : f.n_posto5_fap,
        n_posto6_fap: resp['posto_6'] !== undefined ? resp['posto_6'] : f.n_posto6_fap,
        n_nota_fap: nota,
        n_resultado_fap: aprovado,
        n_status_fap: 1
      };
    });

    const endpoint = `/api/apiFap`;
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const response = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: process.env.NEXT_PUBLIC_API_KEY,
            fap: fapFinalizado
          }) 
        });

        if (response.ok) {
          return true;
        } else {
          console.warn(`Tentativa ${attempt} de envio falhou com status ${response.status}`);
          if (attempt < maxRetries) {
            await new Promise(res => setTimeout(res, 1000));
          }
        }
      } catch (error) {
        console.error(`Tentativa ${attempt} de envio falhou com erro de rede:`, error);
        if (attempt < maxRetries) {
          await new Promise(res => setTimeout(res, 1000));
        }
      }
    }

    // Se todas as tentativas automáticas falharam, exibe o popup interativo de re-tentativa
    setPopupRetry(true);
    return false; 
  };

  const finalizarAvaliacao = async () => {
    if (listaCandidatos.length === 0 || fap.length === 0) return;
 
    setLoad(true);
    const salvouComSucesso = await salvar();
    if (!salvouComSucesso) {
      setLoad(false);
      return; 
    }
 
    const idavaliacao = localStorage.getItem("n_id_avaliacao");
    if(idavaliacao=='14') return;
    
    localStorage.removeItem(`fap_cache_aval_${idavaliacao}`);
    localStorage.removeItem("candidatos");
    localStorage.removeItem("n_id_avaliacao");

    setLoad(false);
    setDadosPopupMessage({
      tipo: 1,
      titulo: "Sucesso",
      mensagem: "Avaliação finalizada e salva com sucesso! Os relatórios poderão ser gerados e enviados pela tela de Cadastros.",
      comandoOK: () => {setPopupMessage(false); router.push('/home');}
    });
    setPopupMessage(true);
  };
  
  const voltar = () => {
    setPopupConfirm(true);
  }

  return (
    <>
      {load && <Load/>}
      {popupMessage && <PopupMessage tipo={dadosPopupMessage.tipo} titulo={dadosPopupMessage.titulo} mensagem={dadosPopupMessage.mensagem} comandoOK={dadosPopupMessage.comandoOK}/>}
      {popupConfirm && <PopupConfirmation titulo="Sair" mensagem={'O seu progresso está salvo automaticamente no dispositivo. Confirma que deseja voltar?'} pergunta="Confirma que deseja sair?" comandoSim={()=>{setPopupConfirm(false); router.back();}} comandoNao={()=>setPopupConfirm(false)}/>}
      {popupRetry && (
        <PopupRetry 
          comandoTentarNovamente={() => {
            setPopupRetry(false);
            finalizarAvaliacao();
          }} 
          comandoCancelar={() => setPopupRetry(false)} 
        />
      )}
      
      {/* Dynamic Popup for Question Info */}
      {popupInfoQuestao && <PopupFap
        titulo={popupInfoQuestao.titulo}
        mediacao={popupInfoQuestao.mediacao}
        evidencias={popupInfoQuestao.evidencias}
        i={1} 
        fecharPopup={() => setPopupInfoQuestao(null)}
      />}
      
      <Head>
        <title>Denso - Teste de Aptidão Prática</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/icons/favicon.ico?v=2" />
      </Head>
      
      <div className={styles.page}>
        <TopoFap nomeAvaliador={nomeAvaliador}/>

        <div className={styles.main}>
          <div className={styles.areaAbasCandidatos}>
            {listaCandidatos.length > 0 && listaCandidatos.map((c, i) => (
              <div key={i} className={`${styles.abaCandidato} ${i === abaAtual ? styles.abaCandidatoAtiva : ""}`} onClick={() => setAbaAtual(i)}>
                {c.s_nome_candidato}
              </div>
            ))}
          </div>
          <div className={styles.areaFap}>
            {fap.length > 0 && fapConfig && fap.map((f, i) => (
              (i === abaAtual && <FapFap key={i} fap={f} iAba={i} setFap={setFap} fapConfig={fapConfig} abaObservacaoAberta={abaObservacaoAberta} setAbaObservacaoAberta={setAbaObservacaoAberta} abrirPopup={setPopupInfoQuestao}/>)
            ))}
          </div>
        </div>

        <div className={styles.rodape}>
          <button title={'voltar'} className='btnPadrao_escuro' onClick={()=>voltar()}>
            <Image src="/assets/icons/exit_w.svg" alt="sair" width={20} height={20} style={{marginRight:"5px"}}/>
            sair
          </button>
          <button className='btnPadrao_claro' onClick={() => finalizarAvaliacao()}>
            <Image src="/assets/icons/file_export.svg" alt="Finalizar" width={20} height={20} style={{marginLeft:"5px"}}/>
            Finalizar
          </button>          
        </div>
      </div>
    </>
  )
}