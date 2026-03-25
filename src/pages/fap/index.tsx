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
  const [habilitarExportar, setHabilitarExportar] = useState<boolean>(false);

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
    let res=true
    fap.forEach(f => {
      if(f.n_posto1_fap==0 && f.n_posto2_fap==0 && f.n_posto3_fap==0 && f.n_posto4_fap==0 && f.n_posto5_fap==0 && f.n_posto6_fap==0){
        res=false
      }
      if(f.n_q6_fap < 0 || f.n_q6_fap > 1){
        res=false
      }
      if(f.n_q7_fap < 0 || f.n_q7_fap > 1){
        res=false
      }
      if(f.n_q8_fap < 1 || f.n_q8_fap > 4){
        res=false
      }
      if(f.n_q9_fap < 1 || f.n_q9_fap > 4){
        res=false
      }
      if(f.n_q10_fap < 1 || f.n_q10_fap > 4){
        res=false
      }
      if(f.n_q11_fap < 1 || f.n_q11_fap > 4){
        res=false
      }
      if(f.n_q12_fap < 1 || f.n_q12_fap > 4){
        res=false
      }
    })
    return res
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

  const salvar=async()=>{
    fap.map((f,i)=>{
      const [nota, aprovado] = calcularNota(f);
      f.n_nota_fap = nota;
      f.n_resultado_fap = aprovado;
    })
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/apiFap`;
    fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fap: fap
      })
    })
  }

  const exportarTodosPDFs = async () => {
    if (listaCandidatos.length === 0 || fap.length === 0) return;
    for (let i = 0; i < listaCandidatos.length; i++) {
      const candidato = listaCandidatos[i];
      const fapCandidato = fap[i];

      const blob = await pdf(
        <RelatorioFap candidato={candidato} fapCandidato={fapCandidato} />
      ).toBlob();

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `FAP_${candidato.s_nome_candidato.replace(/\s+/g, '_')}.pdf`; // Troca espaços por _
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }; 
  
  const voltar=()=>{
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
                (i === abaAtual && <FapFap key={i} fap={f} iAba={i} setFap={setFap} abaObservacaoAberta={abaObservacaoAberta} setAbaObservacaoAberta={setAbaObservacaoAberta} setHabilitarExportar={setHabilitarExportar}/>)
              ))}
            </div>
        </main>
        <div className={styles.rodape}>
          <button title={'voltar'} className={styles.btnVoltar} onClick={()=>voltar()}>
            <Image src="/assets/icons/arrow_back_w.svg" alt="voltar" width={40} height={40} style={{marginRight:"5px"}}/>
            voltar
          </button>
          <button className={styles.btnSalvar} onClick={()=>{salvar();setHabilitarExportar(true)}}>
            <Image src="/assets/icons/save.svg" alt="exportar" width={30} height={30} style={{marginLeft:"5px"}}/>
            salvar
          </button>
          <button className={`${styles.btnExportar} ${!habilitarExportar&&styles.btnExportarDesabilitado}`} onClick={()=>exportarTodosPDFs()} disabled={!habilitarExportar}>
            <Image src="/assets/icons/file_export_w.svg" alt="exportar" width={30} height={30} style={{marginLeft:"5px"}}/>
            exportar
          </button>
        </div>
      </div>
    </>
  )
}