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
  const [load,setLoad]=useState(false);
  const [popup,setPopup]=useState([false,false,false,false,false,false,false]);
  const [popupConfirm,setPopupConfirm]=useState(false);
  const [popupMessage,setPopupMessage]=useState<boolean>(false)
  const [dadosPopupMessage,setDadosPopupMessage]=useState<PopupMessageProps>(
    {
        tipo:0,
        titulo:"",
        mensagem:"",
        comandoOK:() => setPopupMessage(false)
    }
)

  useEffect(() => { 
    buscarDados();
  }, []);

  const buscarDados = async () => {
    setLoad(true);
    const candidatosSelecionados = localStorage.getItem("candidatos")?.split(",").map(id => parseInt(id)) || [];
    const idavaliacao = localStorage.getItem("n_id_avaliacao") ? parseInt(localStorage.getItem("n_id_avaliacao")!) : -1;
    const endpoint = `/api/apiCandidato?action=getDadosByFap&listaIds=${candidatosSelecionados}&n_id_avaliacao=${idavaliacao}`;
    
    try {
      fetch(endpoint, {
          method: "GET"
      })
      .then(res => res.json())
      .then(data => {
          setListaCandidatos(data.candidatos);
          setAvaliacao(data.avaliacao);        
          
          if (data.fap && data.fap.length > 0) {
            const fapAlinhado = data.candidatos.map((candidato: tCandidato) => {
              let fichaDoCandidato = data.fap.find((f: tFap) => f.n_id_candidato === candidato.n_id_candidato);
              
              if (fichaDoCandidato) {
                fichaDoCandidato.dt_date_fap = data.avaliacao.dt_data_avaliacao;
                fichaDoCandidato.n_id_avaliacao = idavaliacao;
                fichaDoCandidato.n_id_pessoa = localStorage.getItem("n_id_pessoa") ? parseInt(localStorage.getItem("n_id_pessoa")!) : -1;
              }
              
              return fichaDoCandidato;
            }).filter((f: tFap | undefined) => f !== undefined);
            
            setFap(fapAlinhado);
          }
      });
    } catch(erro) {
      console.error(`Erro:${erro}`);
    } finally {
      setLoad(false);
    }
  }

  const validarFap = (): boolean => {
    let res = true;
    fap.forEach((f, index) => {
      if(f.n_posto1_fap == 0 && f.n_posto2_fap == 0 && f.n_posto3_fap == 0 && f.n_posto4_fap == 0 && f.n_posto5_fap == 0 && f.n_posto6_fap == 0){
        console.log(`Candidato da aba ${index} está sem POSTO marcado.`);
        res = false;
      }
      if(f.n_q6_fap < 0 || f.n_q6_fap > 1){
        console.log(`Candidato da aba ${index} está com a Q6 pendente.`);
        res = false;
      }
      if(f.n_q7_fap < 0 || f.n_q7_fap > 1){
        console.log(`Candidato da aba ${index} está com a Q7 pendente.`);
        res = false;
      }
      if(f.n_q8_fap < 1 || f.n_q8_fap > 4){
        console.log(`Candidato da aba ${index} está com a Q8 pendente.`);
        res = false;
      }
      if(f.n_q9_fap < 1 || f.n_q9_fap > 4){
        console.log(`Candidato da aba ${index} está com a Q9 pendente.`);
        res = false;
      }
      if(f.n_q10_fap < 1 || f.n_q10_fap > 4){
        console.log(`Candidato da aba ${index} está com a Q10 pendente.`);
        res = false;
      }
      if(f.n_q11_fap < 1 || f.n_q11_fap > 4){
        console.log(`Candidato da aba ${index} está com a Q11 pendente.`);
        res = false;
      }
      if(f.n_q12_fap < 1 || f.n_q12_fap > 4){
        console.log(`Candidato da aba ${index} está com a Q12 pendente.`);
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
        tipo: 2, // Erro
        titulo: "Alerta",
        mensagem: "Por favor, preencha todos os campos obrigatórios de todos os candidatos antes de salvar.",
        comandoOK: () => setPopupMessage(false)
      });
      setPopupMessage(true);
      return false; 
    }
  
    // CORREÇÃO: Cria um novo array mapeado antes de enviar para não mutar o estado diretamente
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
        body: JSON.stringify({ fap: fapFinalizado }) 
      });
  
      if (response.ok) {
        return true; 
      } else {
        setDadosPopupMessage({
          tipo: 3, // Erro
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
        tipo: 3, // Erro
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
  
  const voltar=()=>{
    setPopupConfirm(true);
  }

  const fecharPopup=(i:number)=>{
    let novaLista=[...popup];
    novaLista[i]=false;
    setPopup(novaLista);
  }

  const abrirPopup=(i:number)=>{
    let novaLista=[...popup];
    novaLista[i-1]=true;
    setPopup(novaLista);
  }

  const comandoSim=()=>{
    setPopupConfirm(false);
    router.back();
  }

  const comandoNao=()=>{
    setPopupConfirm(false);
  }

  return (
    <>
      {load&&<Load/>}
      {popupMessage&&<PopupMessage tipo={dadosPopupMessage.tipo} titulo={dadosPopupMessage.titulo} mensagem={dadosPopupMessage.mensagem} comandoOK={dadosPopupMessage.comandoOK}/>}
      {popupConfirm&&<PopupConfirmation titulo="Sair" mensagem={'Se você sair perderá todas as marcações!'} pergunta="Confirma que deseja sair?" comandoSim={comandoSim} comandoNao={comandoNao}/>}
      {popup[0]&&<PopupFap
        titulo="Condução segura do ciclo (C2, C3, C4, C5, C8)"
        mediacao="O candidato utiliza corretamente todos os EPI's obrigatórios e conduz o ciclo de trabalho de maneira segura, demonstrando percepção e ação preventiva frente a situações de risco ambiental e de segurança ao longo de toda a avaliação."
        evidencias="EPIs colocados antes dodo início do teste e mantidos durante todo o ciclo;Ferramentas utilizadas sem improvisações ou uso indevido;Posto mantido em condição segura, organizado e sem riscos evidentes;Demonstra percepção riscos e ajusta conduta espontaneamente."
        i={1} fecharPopup={fecharPopup}/>
      }
      {popup[1]&&<PopupFap
        titulo="Tratamento adequado de Não Conformidade – Stop & Call (C7, C8, C10)"
        mediacao="O candidato identifica anomalia no processo, na peça ou na ferramenta e aciona corretamente o protocolo: Parar e sinalizar."
        evidencias="Identifica e interrompe o ciclo ao identificar desvios;Sinaliza ao avaliador imediatamente;Não prossegue com a peça defeituosa."
        i={2} fecharPopup={fecharPopup}/>
      }
      {popup[2]&&<PopupFap
        titulo="DISCIPLINA OPERACIONAL (C1, C9, C10)"
        mediacao="O candidato segue os padrões de montagem/desmontagem com rigor, sem atalhos, sem quebras de sequência e mantendo conduta operacional adequada."
        evidencias="Segue a sequência passo a passo;Não improvisa métodos;Não utiliza o celular ou realiza atos incompatíveis com o posto."
        i={3} fecharPopup={fecharPopup}/>
      }
      {popup[3]&&<PopupFap
        titulo="MONTAGEM CORRETA (C4, C5, C10)"
        mediacao="O candidato realiza a montagem/desmontagem do subconjunto conforme especificação sem danos e com autochecagem."
        evidencias="Encaixes perfeitos e montagens sem folgas;Aperto de adequado de todos os elementos de fixação;Zero danos à peça;Montagem conforme peça-padrão."
        i={4} fecharPopup={fecharPopup}/>
      }
      {popup[4]&&<PopupFap
        titulo="MANUTENÇÃO DO POSTO DE TRABALHO – 5S (C1, C3, C4) "
        mediacao="O candidato mantém o posto organizado e funcional durante toda a operação, sustentando a posição padronizada de ferramentas e peças de maneira racional."
        evidencias="Ferramentas mantidas no local designado;Peças e contenedores mantidas organizadas na quantidade certa e no local designado;Posto livre de resíduos ou objetos alhieos à atividade."
        i={5} fecharPopup={fecharPopup}/>
      }
      {popup[5]&&<PopupFap
        titulo="ACOMPANHAMENTO DO TAKT TIME (C6, C8, C9)"
        mediacao="O candidato realiza ciclos de montagem dentro do takt time, mantendo baixa variabilidade entre ciclos."
        evidencias="Deslocamentos laterais junto ao motor para montagem;Montagens dentro do takt time."
        i={6} fecharPopup={fecharPopup}/>
      }
      {popup[6]&&<PopupFap
        titulo="RESILIÊNCIA FÍSICA E MENTAL (C9, C11)"
        mediacao="O candidato mantém foco, postura, constância e estabilidade emocional durante toda a atividade, mesmo sob repetitividade, desconforto controlado e micropressões."
        evidencias="Constância de ritmo;Zero reclamações improdutivas;Zero quedas de desempenho;Reações equilibradas diante de eventuais frustrações."
        i={7} fecharPopup={fecharPopup}/>
      }
      <Head>
        <title>Stellantis - Teste de Aptidão Prática</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/icons/favicon.ico?v=2" />
      </Head>
      <div className={styles.page}>
        <TopoFap/>

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