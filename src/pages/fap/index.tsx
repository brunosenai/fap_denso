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

export default function Fap() {
  const router = useRouter();
  const [listaCandidatos, setListaCandidatos] = useState<tCandidado[]>([]);
  const [avaliacao, setAvaliacao] = useState<tAvaliacao>();
  const [fap, setFap] = useState<tFap[]>([]);
  const [abaAtual, setAbaAtual] = useState<number>(0);
  const [abaObservacaoAberta, setAbaObservacaoAberta] = useState<boolean>(false);

  useEffect(() => {   
    buscarDados();
  }, []);

  const buscarDados = async () => {
    const candidatosSelecionados = localStorage.getItem("candidatos")?.split(",").map(id => parseInt(id)) || [];
    const idavaliacao = localStorage.getItem("n_id_avaliacao") ? parseInt(localStorage.getItem("n_id_avaliacao")!) : -1;
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/apiCandidato?action=getDadosByFap&listaIds=${candidatosSelecionados}&n_id_avaliacao=${idavaliacao}`;
    
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
      if(f.n_q8_fap < 0 || f.n_q8_fap > 1){
        console.log(`Candidato da aba ${index} está com a Q8 pendente.`);
        res = false;
      }
      // if(f.n_q9_fap < 1 || f.n_q9_fap > 4){
      //   console.log(`Candidato da aba ${index} está com a Q9 pendente.`);
      //   res = false;
      // }
      // if(f.n_q10_fap < 1 || f.n_q10_fap > 4){
      //   console.log(`Candidato da aba ${index} está com a Q10 pendente.`);
      //   res = false;
      // }
      // if(f.n_q11_fap < 1 || f.n_q11_fap > 4){
      //   console.log(`Candidato da aba ${index} está com a Q11 pendente.`);
      //   res = false;
      // }
      // if(f.n_q12_fap < 1 || f.n_q12_fap > 4){
      //   console.log(`Candidato da aba ${index} está com a Q12 pendente.`);
      //   res = false;
      // }
    });  
    return res;
  }

  const calcularNota = (itemFap: tFap): number[] => {
    let nota = 0;
    const notaMax=19;
    const mediaAprovacao=11;
    if(itemFap.n_q6_fap == 1) nota += 1;
    if(itemFap.n_q7_fap == 1) nota += 1;
    if(itemFap.n_q8_fap > 0) nota += itemFap.n_q8_fap; // Considera a pontuação da questão
    if(itemFap.n_q9_fap > 0) nota += itemFap.n_q9_fap; // Considera a pontuação da questão
    if(itemFap.n_q10_fap > 0) nota += itemFap.n_q10_fap; // Considera a pontuação da questão
    if(itemFap.n_q11_fap > 0) nota += itemFap.n_q11_fap; // Considera a pontuação da questão
    if(itemFap.n_q12_fap > 0) nota += itemFap.n_q12_fap; // Considera a pontuação da questão

    let aprovado = 0;
    if(nota >= mediaAprovacao){
      if(itemFap.n_q6_fap == 0 || itemFap.n_q7_fap == 0)
        aprovado=0;
      else
        aprovado = 1;
    } else {
      aprovado = 0;
    }
    return [nota,aprovado];
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
    if (listaCandidatos.length === 0 || fap.length === 0) return;
  
    // 1. AGUARDA O SALVAMENTO ANTES DE CONTINUAR
    const salvouComSucesso = await salvar();
  
    // 2. Se falhou na validação ou no banco, interrompe a geração dos PDFs
    if (!salvouComSucesso) {
      return; 
    }
  
    // Altera o estado (opcional, para mostrar um loading na tela)
    // setSalvandoPdf(true);
  
    for (let i = 0; i < listaCandidatos.length; i++) {
      const candidato = listaCandidatos[i];
      const fapCandidato = fap[i];
  
      // 1. Gera o PDF em Blob usando o react-pdf
      const blob = await pdf(
        <RelatorioFap candidato={candidato} fapCandidato={fapCandidato} />
      ).toBlob();
  
      // 2. Converte o Blob para Base64 para enviar via JSON
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
      });
  
      // 3. Define um nome único para o arquivo
      const fileName = `FAP_${candidato.s_nome_candidato.replace(/\s+/g, '_')}_${candidato.n_id_candidato}_${fapCandidato.n_id_avaliacao}.pdf`;
  
      // 4. Dispara a requisição para a nossa nova rota de API que guarda o PDF
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/apiFap`; // Use a rota unificada da apiFap
      await fetch(endpoint, {
        method: "POST", // POST porque configuramos o POST para receber e guardar o PDF na API
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
  
      // Pequena pausa para o navegador não travar
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Opcional: tira o estado de loading
    // setSalvandoPdf(false);
    
    alert("Avaliação finalizada com sucesso!");
    router.push('/home');
  };
  
  const voltar=()=>{
    const res=confirm('Se você sair perderá todas as marcações!\nConfirma que deseja sair?')
    if(res)
      router.back();
  }

  return (
    <>
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
                (i === abaAtual && <FapFap key={i} fap={f} iAba={i} setFap={setFap} abaObservacaoAberta={abaObservacaoAberta} setAbaObservacaoAberta={setAbaObservacaoAberta}/>)
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