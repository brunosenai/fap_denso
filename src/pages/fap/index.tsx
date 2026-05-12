import Head from "next/head";
import styles from "@/styles/Fap.module.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import TopoFap from "@/components/Topo/TopoFap";
import PopupMessage, { PopupMessageProps } from "@/components/Popup/PopupMessage";
import { tCandidato, tFap, tAvaliacao } from "@/utils/Types";
import FapFap from "@/components/Fap/Fap";
import Image from "next/image";
import Load from "@/components/Load/Load";
import PopupFap from "@/components/Popup/PopupFap";
import PopupConfirmation from "@/components/Popup/PopupConfirmation";

export default function Fap() {
  const router = useRouter();
  const [listaCandidatos, setListaCandidatos] = useState<tCandidato[]>([]);
  const [avaliacao, setAvaliacao] = useState<tAvaliacao>();
  const [fap, setFap] = useState<tFap[]>([]);
  const [abaAtual, setAbaAtual] = useState<number>(0);
  const [abaObservacaoAberta, setAbaObservacaoAberta] = useState<boolean>(false);
  const [load, setLoad] = useState(false);
  const [popup, setPopup] = useState([false, false, false, false, false, false, false]);
  const [popupConfirm, setPopupConfirm] = useState(false);
  const [nomeAvaliador, setNomeAvaliador] = useState<string>('')
  
  // 🛡️ BLINDAGEM: Garante que o AutoSave não sobrepõe o cache vazio na primeira renderização
  const [dadosCarregados, setDadosCarregados] = useState<boolean>(false);

  const [popupMessage, setPopupMessage] = useState<boolean>(false)
  const [dadosPopupMessage, setDadosPopupMessage] = useState<PopupMessageProps>({
    tipo: 0,
    titulo: "",
    mensagem: "",
    comandoOK: () => setPopupMessage(false)
  })

  useEffect(() => { 
    setNomeAvaliador(localStorage.getItem('s_nome_pessoa') || ''); // Carrega o nome do avaliador do localStorage
    buscarDados();
  }, []);

  const buscarDados = async () => {
    setLoad(true);
    const candidatosSelecionados = localStorage.getItem("candidatos")?.split(",").map(id => parseInt(id)) || [];
    const idavaliacao = localStorage.getItem("n_id_avaliacao") ? parseInt(localStorage.getItem("n_id_avaliacao")!) : -1;
    const endpoint = `/api/apiCandidato?action=getDadosByFap&listaIds=${candidatosSelecionados}&n_id_avaliacao=${idavaliacao}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
    
    try {
      const res = await fetch(endpoint, { method: "GET" });
      const data = await res.json();
      
      setListaCandidatos(data.candidatos);
      setAvaliacao(data.avaliacao);        
      
      let fapInicial: tFap[] = [];

      // 1. Prepara os dados base que vêm do banco de dados
      if (data.fap && data.fap.length > 0) {
        fapInicial = data.candidatos.map((candidato: tCandidato) => {
          let fichaDoCandidato = data.fap.find((f: tFap) => f.n_id_candidato === candidato.n_id_candidato);
          
          if (fichaDoCandidato) {
            fichaDoCandidato.dt_date_fap = data.avaliacao.dt_data_avaliacao;
            fichaDoCandidato.n_id_avaliacao = idavaliacao;
            fichaDoCandidato.n_id_pessoa = localStorage.getItem("n_id_pessoa") ? parseInt(localStorage.getItem("n_id_pessoa")!) : -1;
          }
          return fichaDoCandidato;
        }).filter((f: tFap | undefined) => f !== undefined);
      }

      // =========================================================================
      // 2. RECUPERAÇÃO DE CACHE (AutoSave)
      // =========================================================================
      const nomeDoCache = `fap_cache_aval_${idavaliacao}`;
      const cacheSalvo = localStorage.getItem(nomeDoCache);

      if (cacheSalvo) {
        try {
          const fapRecuperado = JSON.parse(cacheSalvo);
          
          // Verifica se o cache guardado é realmente dos candidatos que estão na tela agora
          const cacheValido = fapRecuperado.length === candidatosSelecionados.length && fapRecuperado.every((item: tFap) => 
            candidatosSelecionados.includes(item.n_id_candidato)
          );

          if (cacheValido) {
            fapInicial = fapRecuperado; // Substitui pelo cache do dispositivo
            console.log("📦 Progresso recuperado do cache!");
          } else {
            localStorage.removeItem(nomeDoCache); // Limpa cache obsoleto
          }
        } catch (e) {
          console.error("Erro ao ler cache:", e);
        }
      }

      setFap(fapInicial);
      setDadosCarregados(true); // Libera a gravação do AutoSave a partir de agora

    } catch(erro) {
      console.error(`Erro:${erro}`);
    } finally {
      setLoad(false);
    }
  }

  // =========================================================================
  // 3. GRAVAÇÃO AUTOMÁTICA (AutoSave) A CADA CLIQUE
  // =========================================================================
  useEffect(() => {
    if (dadosCarregados && fap.length > 0) {
      const idavaliacao = localStorage.getItem("n_id_avaliacao");
      if (idavaliacao) {
        localStorage.setItem(`fap_cache_aval_${idavaliacao}`, JSON.stringify(fap));
      }
    }
  }, [fap, dadosCarregados]);


  const validarFap = (): boolean => {
    let res = true;
    fap.forEach((f, index) => {
      if(f.n_posto1_fap == 0 && f.n_posto2_fap == 0 && f.n_posto3_fap == 0 && f.n_posto4_fap == 0 && f.n_posto5_fap == 0 && f.n_posto6_fap == 0){
        res = false;
      }
      if(f.n_q6_fap < 0 || f.n_q6_fap > 1){
        res = false;
      }
      if(f.n_q7_fap < 0 || f.n_q7_fap > 1){
        res = false;
      }
      if(f.n_q8_fap < 1 || f.n_q8_fap > 4){
        res = false;
      }
      if(f.n_q9_fap < 1 || f.n_q9_fap > 4){
        res = false;
      }
      if(f.n_q10_fap < 1 || f.n_q10_fap > 4){
        res = false;
      }
      if(f.n_q11_fap < 1 || f.n_q11_fap > 4){
        res = false;
      }
      if(f.n_q12_fap < 1 || f.n_q12_fap > 4){
        res = false;
      }
    });  
    return res;
  }

  const calcularNota = (itemFap: tFap): number[] => {
    let nota = 0;
    const mediaAprovacao = 13; 
    
    if(itemFap.n_q6_fap == 1) nota += 1;
    if(itemFap.n_q7_fap == 1) nota += 1;
    if(itemFap.n_q8_fap > 0) nota += itemFap.n_q8_fap; 
    if(itemFap.n_q9_fap > 0) nota += itemFap.n_q9_fap; 
    if(itemFap.n_q10_fap > 0) nota += itemFap.n_q10_fap; 
    if(itemFap.n_q11_fap > 0) nota += itemFap.n_q11_fap; 
    if(itemFap.n_q12_fap > 0) nota += itemFap.n_q12_fap; 

    let aprovado = 0;
    if(nota >= mediaAprovacao){
      if(itemFap.n_q6_fap == 0 || itemFap.n_q7_fap == 0)
        aprovado = 0;
      else
        aprovado = 1;
    } else {
      aprovado = 0;
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
      return {
        ...f,
        n_nota_fap: nota,
        n_resultado_fap: aprovado,
        n_status_fap: 1
      };
    });

    const endpoint = `/api/apiFap`;
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
        setDadosPopupMessage({
          tipo: 3, 
          titulo: "Erro",
          mensagem: "Erro ao salvar avaliações no banco de dados.",
          comandoOK: () => setPopupMessage(false)
        });
        setPopupMessage(true);
        return false; 
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setDadosPopupMessage({
        tipo: 3, 
        titulo: "Erro",
        mensagem: "Erro de conexão ao tentar salvar.",
        comandoOK: () => setPopupMessage(false)
      });
      setPopupMessage(true);
      return false; 
    }
  };

  const finalizarAvaliacao = async () => {
    if (listaCandidatos.length === 0 || fap.length === 0) return;
 
    setLoad(true);
    
    const salvouComSucesso = await salvar();
 
    if (!salvouComSucesso) {
      setLoad(false);
      return; 
    }
 
    // =========================================================================
    // 4. LIMPEZA DE CACHE APÓS SUCESSO
    // =========================================================================
    const idavaliacao = localStorage.getItem("n_id_avaliacao");
    
    if(idavaliacao=='14')
      return
    
    localStorage.removeItem(`fap_cache_aval_${idavaliacao}`);
    localStorage.removeItem("candidatos");
    localStorage.removeItem("n_id_avaliacao");

    setLoad(false);
    setDadosPopupMessage({
      tipo: 1,
      titulo: "Sucesso",
      mensagem: "Avaliação finalizada e salva com sucesso! Os relatórios poderão ser gerados e enviados pela tela de Cadastros.",
      comandoOK: () => {setPopupMessage(false);    router.push('/home');}
    });
    setPopupMessage(true);
  };
  
  const voltar = () => {
    setPopupConfirm(true);
  }

  const fecharPopup = (i: number) => {
    let novaLista = [...popup];
    novaLista[i] = false;
    setPopup(novaLista);
  }

  const abrirPopup = (i: number) => {
    let novaLista = [...popup];
    novaLista[i-1] = true;
    setPopup(novaLista);
  }

  const comandoSim = () => {
    setPopupConfirm(false);
    router.back();
  }

  const comandoNao = () => {
    setPopupConfirm(false);
  }

  return (
    <>
      {load && <Load/>}
      {popupMessage && <PopupMessage tipo={dadosPopupMessage.tipo} titulo={dadosPopupMessage.titulo} mensagem={dadosPopupMessage.mensagem} comandoOK={dadosPopupMessage.comandoOK}/>}
      {popupConfirm && <PopupConfirmation titulo="Sair" mensagem={'O seu progresso está salvo automaticamente no dispositivo. Confirma que deseja voltar?'} pergunta="Confirma que deseja sair?" comandoSim={comandoSim} comandoNao={comandoNao}/>}
      {popup[0] && <PopupFap
        titulo="Condução segura do ciclo (C2, C3, C4, C5, C8)"
        mediacao="O candidato utiliza corretamente todos os EPI's obrigatórios e conduz o ciclo de trabalho de maneira segura, demonstrando percepção e ação preventiva frente a eventuais situações de risco ambiental e de segurança ao longo de toda a avaliação?"
        evidencias="EPIs colocados quando orientado mantidos durante todo o teste sem clara demonstração de incômodo e/ou desconforto;Ferramentas utilizadas sem improvisações, sem uso indevido ou guarda em local inadequado;Posto mantido em condição segura, organizado e sem riscos evidentes;Demonstra percepção riscos durante a operação, ajusta conduta espontaneamente e sinaliza sempre que necessário."
        i={1} fecharPopup={fecharPopup}/>
      }
      {popup[1] && <PopupFap
        titulo="Tratamento adequado de Não Conformidade – Stop & Call (C7, C8, C10)"
        mediacao="O candidato detectou corretamente eventuais não conformidades ao logo do teste e acionou devidamente o protocolo &#34;Parar e Sinalizar&#34; ou Ignorou desvios, e/ou montou  peças defeituosas, sendo esta condição causada ou não por ele."
        evidencias="Analisa criticamente o processo e Identifica possíveis desvios.;Utiliza corretamente o protoco &quot;Parar e Sinalizar&quot; imediatamente;Não prossegue com a peça defeituosa sem orientação."
        i={2} fecharPopup={fecharPopup}/>
      }
      {popup[2] && <PopupFap
        titulo="DISCIPLINA OPERACIONAL (C1, C9, C10)"
        mediacao="O candidato segue a documentação padrão de montagem/desmontagem com rigor, sem atalhos, sem quebras de sequência e mantendo conduta operacional adequada."
        evidencias="Segue a sequência passo a passo;Improvisa métodos e inverte sequências;Realiza atos incompatíveis com o posto (Como o uso de celular sem autorização)."
        i={3} fecharPopup={fecharPopup}/>
      }
      {popup[3] && <PopupFap
        titulo="MONTAGEM CORRETA (C4, C5, C10)"
        mediacao="O candidato realiza a correta montagem/desmontagem do subconjunto conforme especificação sem danos e com autochecagem: documentação/físico."
        evidencias="Encaixes perfeitos e montagens corretas e sem folgas;Aperto de adequado de todos os elementos de fixação;Zero danos às peças;Montagem conforme peça-padrão e/ou documentação padrão."
        i={4} fecharPopup={fecharPopup}/>
      }
      {popup[4] && <PopupFap
        titulo="MANUTENÇÃO DO POSTO DE TRABALHO – 5S (C1, C3, C4) "
        mediacao="O candidato mantém o posto organizado e funcional durante toda a operação, sustentando a posição padronizada da ferramenta, devida alocação das peças observando sua quantidade padronizada de maneira racional."
        evidencias="Ferramenta mantidas no local designado quando não utilizada;Peças e contenedores mantidas organizadas na quantidade certa e no local designado;Posto livre de resíduos e/ou objetos alheios à atividade."
        i={5} fecharPopup={fecharPopup}/>
      }
      {popup[5] && <PopupFap
        titulo="ACOMPANHAMENTO DO TAKT TIME (C6, C8, C9)"
        mediacao="O candidato realiza ciclos de montagem dentro do takt time, mantendo baixa variabilidade entre ciclos e demonstra boa desenvoltura com o uso de ferramentas manuais."
        evidencias="Deslocamentos laterais junto ao motor para montagem;Montagens INCOMPLETAS com motivo evidente de falta de ritmo.;Ritmo lento, desatento ao tempo de linha;Dificuldade na operação de ferramentas manuais;Uso das duas mãos com facilidade."
        i={6} fecharPopup={fecharPopup}/>
      }
      {popup[6] && <PopupFap
        titulo="RESILIÊNCIA FÍSICA E MENTAL (C9, C11)"
        mediacao="O candidato mantém foco, postura, constância e estabilidade emocional durante toda a atividade, mesmo sob repetitividade, desconforto controlado e micropressões."
        evidencias="Constância de ritmo;Zero reclamações improdutivas e postura receptiva;Zero quedas de desempenho;Reações equilibradas diante de eventuais frustrações."
        i={7} fecharPopup={fecharPopup}/>
      }
      <Head>
        <title>Stellantis - Teste de Aptidão Prática</title>
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
            {fap.length > 0 && fap.map((f, i) => (
              (i === abaAtual && <FapFap key={i} fap={f} iAba={i} setFap={setFap} abaObservacaoAberta={abaObservacaoAberta} setAbaObservacaoAberta={setAbaObservacaoAberta} abrirPopup={abrirPopup}/>)
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