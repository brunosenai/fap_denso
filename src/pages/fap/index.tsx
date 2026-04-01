import Head from "next/head";
import styles from "@/styles/Fap.module.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import TopoFap from "@/components/Topo/TopoFap";
import { tCandidado, tFap, tAvaliacao } from "@/utils/Types";
import FapFap from "@/components/Fap/Fap";
import { pdf } from '@react-pdf/renderer';
import { RelatorioFap } from "@/components/Pdf/RelatorioFap";
import Image from "next/image";
import Load from "@/components/Load/Load";
import ConclusaoSeguraDoCiclo from "@/components/Popup/PopupFap";
import PopupFap from "@/components/Popup/PopupFap";

export default function Fap() {
  const router = useRouter();
  const [listaCandidatos, setListaCandidatos] = useState<tCandidado[]>([]);
  const [avaliacao, setAvaliacao] = useState<tAvaliacao>();
  const [fap, setFap] = useState<tFap[]>([]);
  const [abaAtual, setAbaAtual] = useState<number>(0);
  const [abaObservacaoAberta, setAbaObservacaoAberta] = useState<boolean>(false);
  const [load,setLoad]=useState(false)
  const [popup,setPopup]=useState([false,false,false,false,false,false,false])

  useEffect(() => {   
    buscarDados();
  }, []);

  const buscarDados = async () => {
    setLoad(true)
    const candidatosSelecionados = localStorage.getItem("candidatos")?.split(",").map(id => parseInt(id)) || [];
    const idavaliacao = localStorage.getItem("n_id_avaliacao") ? parseInt(localStorage.getItem("n_id_avaliacao")!) : -1;
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/apiCandidato?action=getDadosByFap&listaIds=${candidatosSelecionados}&n_id_avaliacao=${idavaliacao}`;
    
    try{
      fetch(endpoint, {
          method: "GET"
      })
      .then(res => res.json())
      .then(data => {
          setListaCandidatos(data.candidatos);
          setAvaliacao(data.avaliacao);        
          if (data.fap && data.fap.length > 0) {
            data.fap.forEach((f: tFap) => {
              f.dt_date_fap=data.avaliacao.dt_data_avaliacao
              f.n_id_avaliacao=idavaliacao
              f.n_id_pessoa = localStorage.getItem("n_id_pessoa") ? parseInt(localStorage.getItem("n_id_pessoa")!) : -1
            })
            setFap(data.fap);
          }
      });
    }catch(erro){
      console.error(`Erro:${erro}`)
    }
    finally{
      setLoad(false)
    }
  }

  const validarFap = (): boolean => {
    let res = true;
    fap.forEach((f, index) => {
      // Validação dos Postos
      if(f.n_posto1_fap == 0 && f.n_posto2_fap == 0 && f.n_posto3_fap == 0 && f.n_posto4_fap == 0 && f.n_posto5_fap == 0 && f.n_posto6_fap == 0){
        console.log(`Candidato da aba ${index} está sem POSTO marcado.`);
        res = false;
      }
      
      // Validação Eliminatórias (Q6 e Q7) - Esperam 0 ou 1
      if(f.n_q6_fap < 0 || f.n_q6_fap > 1){
        console.log(`Candidato da aba ${index} está com a Q6 pendente.`);
        res = false;
      }
      if(f.n_q7_fap < 0 || f.n_q7_fap > 1){
        console.log(`Candidato da aba ${index} está com a Q7 pendente.`);
        res = false;
      }
      
      // Validação de Escala (Q8 a Q12) - Esperam de 1 a 4
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
    
    // ATENÇÃO: Q8 agora vale 4. O máximo passou de 19 para 22 (1+1+4+4+4+4+4)
    const notaMax = 22; 
    
    // ATENÇÃO: Verifique com a equipe de negócio se a média de aprovação sobe
    const mediaAprovacao = 13; // Ajuste conforme a nova regra da Stellantis
    
    // Somatório das notas (a lógica de soma não muda, pois n_q8_fap agora virá com valor de 1 a 4)
    if(itemFap.n_q6_fap == 1) nota += 1;
    if(itemFap.n_q7_fap == 1) nota += 1;
    if(itemFap.n_q8_fap > 0) nota += itemFap.n_q8_fap; 
    if(itemFap.n_q9_fap > 0) nota += itemFap.n_q9_fap; 
    if(itemFap.n_q10_fap > 0) nota += itemFap.n_q10_fap; 
    if(itemFap.n_q11_fap > 0) nota += itemFap.n_q11_fap; 
    if(itemFap.n_q12_fap > 0) nota += itemFap.n_q12_fap; 

    let aprovado = 0;
    if(nota >= mediaAprovacao){
      // A regra eliminatória já estava certa focando só na Q6 e Q7
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
      alert("Por favor, preencha todos os campos obrigatórios de todos os candidatos antes de salvar.");
      return false; 
    }
  
    // 2. Calcula as notas e atualiza o objeto fap que irá para o PDF
    fap.forEach((f) => {
      const [nota, aprovado] = calcularNota(f);
      f.n_nota_fap = nota;
      f.n_resultado_fap = aprovado;
      f.n_status_fap=1;
    });
    // 3. Envia para o banco de dados
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/apiFap`;
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fap: fap })
      });
  
      if (response.ok) {
        return true; // Sucesso! Pode gerar os PDFs.
      } else {
        alert("Erro ao salvar avaliações no banco de dados.");
        return false; // Erro no servidor, não gera os PDFs.
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro de conexão ao tentar salvar.");
      return false; // Erro de rede, não gera os PDFs.
    }
  };

  // const exportarTodosPDFs = async () => {
  //   if (listaCandidatos.length === 0 || fap.length === 0) return;
  //   for (let i = 0; i < listaCandidatos.length; i++) {
  //     const candidato = listaCandidatos[i];
  //     const fapCandidato = fap[i];

  //     const blob = await pdf(
  //       <RelatorioFap candidato={candidato} fapCandidato={fapCandidato} />
  //     ).toBlob();

  //     const url = URL.createObjectURL(blob);

  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = `FAP_${candidato.s_nome_candidato.replace(/\s+/g, '_')}.pdf`; // Troca espaços por _
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     URL.revokeObjectURL(url);

  //     await new Promise(resolve => setTimeout(resolve, 300));
  //   }
  // }; 

  const finalizarAvaliacao = async () => {
    // Evita rodar se não houver dados
    if (listaCandidatos.length === 0 || fap.length === 0) return;
  
    // 1. AGUARDA O SALVAMENTO NO BANCO ANTES DE CONTINUAR
    // A função salvar() já faz a validação e calcula as notas
    setLoad(true)
    const salvouComSucesso = await salvar();
  
    // Se falhou na validação ou no banco, interrompe o processo aqui
    if (!salvouComSucesso) {
      setLoad(false)
      return; 
    }
  
    // Array para guardar os nomes dos PDFs gerados que serão anexados no e-mail
    const arquivosGerados: string[] = [];
  
    // 2. GERAÇÃO E ARMAZENAMENTO DOS PDFs
    for (let i = 0; i < listaCandidatos.length; i++) {
      const candidato = listaCandidatos[i];
      const fapCandidato = fap[i];
  
      // Gera o PDF em Blob usando o react-pdf
      const blob = await pdf(
        <RelatorioFap candidato={candidato} fapCandidato={fapCandidato} />
      ).toBlob();
  
      // Converte o Blob para Base64 para poder enviar via JSON no corpo da requisição
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
      });
  
      // Define um nome único para o arquivo PDF
      const fileName = `FAP_${candidato.s_nome_candidato.replace(/\s+/g, '_')}_${candidato.n_id_candidato}_${fapCandidato.n_id_avaliacao}.pdf`;
      
      // Guarda o nome do arquivo na nossa lista para o e-mail
      arquivosGerados.push(fileName);
  
      // Dispara a requisição POST para a apiFap (que configuramos para salvar o arquivo físico e fazer o UPDATE do path no banco)
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/apiFap`; 
      await fetch(endpoint, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          n_id_avaliacao: fapCandidato.n_id_avaliacao,
          n_id_candidato: fapCandidato.n_id_candidato,
          fileName: fileName,
          fileData: base64
        })
      });
  
      // Pequena pausa para o navegador não travar e dar tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 3. ENVIO DO E-MAIL PARA A EMPRESA
    try {
      const emailEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/apiEnviarEmail`;
      const responseEmail = await fetch(emailEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assunto: `Relatórios FAP - Avaliação Concluída (${new Date().toLocaleDateString()})`,
          arquivos: arquivosGerados // Manda apenas a lista com os nomes dos PDFs
        })
      });

      if (!responseEmail.ok) {
        throw new Error("Falha na resposta da API de e-mail");
        setLoad(false)
      }
    } catch (error) {
      setLoad(false)
      console.error("Erro ao enviar o e-mail:", error);
      alert("A avaliação foi salva e os PDFs gerados, mas ocorreu um erro ao tentar enviar o e-mail para a empresa.");
      // Redireciona mesmo com erro no e-mail, pois o trabalho principal foi concluído
      router.push('/home');
      return; 
    }

    // 4. FINALIZAÇÃO COM SUCESSO
    setLoad(false)
    alert("Avaliação finalizada, relatórios gerados e enviados para a empresa com sucesso!");
    router.push('/home');
  };
  
  const voltar=()=>{
    const res=confirm('Se você sair perderá todas as marcações!\nConfirma que deseja sair?')
    if(res)
      router.back();
  }

  const fecharPopup=(i:number)=>{
    let novaLista=[...popup]
    novaLista[i]=false
    setPopup(novaLista)
  }

  const abrirPopup=(i:number)=>{
    let novaLista=[...popup]
    novaLista[i-1]=true
    setPopup(novaLista)
  }

  return (
    <>
      {load&&<Load/>}
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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.page}>
        <TopoFap/>
        <main className={styles.main}>
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
        </main>
        <div className={styles.rodape}>
          <button title={'voltar'} className={styles.btnVoltar} onClick={()=>voltar()}>
            <Image src="/assets/icons/exit_w.svg" alt="sair" width={40} height={40} style={{marginRight:"5px"}}/>
            sair
          </button>
          <button 
            className={`${styles.btnSalvar}`} 
            onClick={() => finalizarAvaliacao()} 
          >
            <Image src="/assets/icons/file_export.svg" alt="Finalizar" width={30} height={30} style={{marginLeft:"5px"}}/>
            Finalizar Avaliação
          </button>          
        </div>
      </div>
    </>
  )
}