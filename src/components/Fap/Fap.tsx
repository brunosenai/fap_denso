import styles from "@/styles/Fap.module.css";
import { tFap } from "@/utils/Types";
import Image from "next/image";

interface FapProps {
  iAba: number;
  fap: tFap;
  setFap: React.Dispatch<React.SetStateAction<tFap[]>>;
  abaObservacaoAberta: boolean; // Adicionado para controlar a visibilidade das observações
  setAbaObservacaoAberta: React.Dispatch<React.SetStateAction<boolean>>; // Função para atualizar o estado de observação aberta
  setHabilitarExportar: React.Dispatch<React.SetStateAction<boolean>>; // Função para habilitar o botão de exportar
}

export default function Fap({ iAba, fap, setFap, abaObservacaoAberta, setAbaObservacaoAberta, setHabilitarExportar }: FapProps) {

  const handleChange = (campo: keyof tFap, valor: number | string) => {
    setFap((prevFap) => {
      setHabilitarExportar(false); // Habilita o botão de exportar ao fazer qualquer alteração
      const novoFap = [...prevFap];
      novoFap[iAba] = { ...novoFap[iAba], [campo]: valor };
      return novoFap;
    });
  };

  return (
    <div className={styles.fapComponent_container}>
      <div className={styles.fapComponent}>
        
        {/* --- POSTOS PERCORRIDOS --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>Postos percorridos</div>
          <div className={styles.fapSection_colunas}>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="checkbox" className={styles.fieldForm_checkbox_fap} id={`m1_${iAba}`} checked={Boolean(fap.n_posto1_fap)} onChange={(e) => handleChange("n_posto1_fap", e.target.checked ? 1 : 0)} />
                <label htmlFor={`m1_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Montagem 1</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="checkbox" className={styles.fieldForm_checkbox_fap} id={`d1_${iAba}`} checked={Boolean(fap.n_posto2_fap)} onChange={(e) => handleChange("n_posto2_fap", e.target.checked ? 1 : 0)} />
                <label htmlFor={`d1_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Desmontagem 1</label>
              </div>
            </div>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="checkbox" className={styles.fieldForm_checkbox_fap} id={`m2_${iAba}`} checked={Boolean(fap.n_posto3_fap)} onChange={(e) => handleChange("n_posto3_fap", e.target.checked ? 1 : 0)} />
                <label htmlFor={`m2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Montagem 2</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="checkbox" className={styles.fieldForm_checkbox_fap} id={`d2_${iAba}`} checked={Boolean(fap.n_posto4_fap)} onChange={(e) => handleChange("n_posto4_fap", e.target.checked ? 1 : 0)} />
                <label htmlFor={`d2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Desmontagem 2</label>
              </div>
            </div>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="checkbox" className={styles.fieldForm_checkbox_fap} id={`m3_${iAba}`} checked={Boolean(fap.n_posto5_fap)} onChange={(e) => handleChange("n_posto5_fap", e.target.checked ? 1 : 0)} />
                <label htmlFor={`m3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Montagem 3</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="checkbox" className={styles.fieldForm_checkbox_fap} id={`d3_${iAba}`} checked={Boolean(fap.n_posto6_fap)} onChange={(e) => handleChange("n_posto6_fap", e.target.checked ? 1 : 0)} />
                <label htmlFor={`d3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Desmontagem 3</label>
              </div>
            </div>
          </div>
        </div>

        {/* --- USO ESPONTÂNEO DE EPI --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>Uso espontâneo de EPI (C2, C3, C4)</div>
          <div className={styles.fapSection_descricao}>Critério: Utiliza todos os EPIs de forma correta, contínua e espontânea, do início ao fim.</div>
          <div className={styles.fapSection_linhas}>
            <div className={styles.fapSection_lin}>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q6_${iAba}`} id={`q6_sim_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q6_fap === 1} onChange={() => handleChange("n_q6_fap", 1)} />
                <label htmlFor={`q6_sim_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Atende</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q6_${iAba}`} id={`q6_nao_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q6_fap === 0} onChange={() => handleChange("n_q6_fap", 0)} />
                <label htmlFor={`q6_nao_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Não atende</label>
              </div>
            </div>
          </div>
        </div>

        {/* --- TRATAMENTO ADEQUADO DE NÃO CONFORMIDADE --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>Tratamento adequado de Não Conformidade - Stop & Call (C7, C10)</div>
          <div className={styles.fapSection_descricao}>Critério: Ao encontrar qualquer dificuldade real do processo, para com segurança, sinaliza e comunica.</div>
          <div className={styles.fapSection_linhas}>
            <div className={styles.fapSection_lin}>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q7_${iAba}`} id={`q7_sim_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q7_fap === 1} onChange={() => handleChange("n_q7_fap", 1)} />
                <label htmlFor={`q7_sim_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Atende</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q7_${iAba}`} id={`q7_nao_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q7_fap === 0} onChange={() => handleChange("n_q7_fap", 0)} />
                <label htmlFor={`q7_nao_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Não atende</label>
              </div>
            </div>
          </div>
        </div>

        {/* --- DISCIPLINA OPERACIONAL --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>DISCIPLINA OPERACIONAL (C1, C9, C10)</div>
          <div className={styles.fapSection_descricao}>Critério: Segue o POP fielmente, sem atalhos ou improvisos e com conduta correta.</div>
          <div className={styles.fapSection_linhas}>
            <div className={styles.fapSection_lin}>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q8_${iAba}`} id={`q8_sim_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q8_fap === 1} onChange={() => handleChange("n_q8_fap", 1)} />
                <label htmlFor={`q8_sim_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Atende</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q8_${iAba}`} id={`q8_nao_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q8_fap === 0} onChange={() => handleChange("n_q8_fap", 0)} />
                <label htmlFor={`q8_nao_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Não atende</label>
              </div>
            </div>
          </div>
        </div>

        {/* --- MONTAGEM CORRETA --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>MONTAGEM CORRETA (C4, C5, C6)</div>
          <div className={styles.fapSection_descricao}>Critério: Monta/desmonta conforme POP, torque correto, encaixe adequado e autocontrole.</div>
          <div className={styles.fapSection_colunas}>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q9_${iAba}`} id={`q9_4_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q9_fap === 4} onChange={() => handleChange("n_q9_fap", 4)} />
                <label htmlFor={`q9_4_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Avançado</b> - Montagem perfeita.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q9_${iAba}`} id={`q9_3_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q9_fap === 3} onChange={() => handleChange("n_q9_fap", 3)} />
                <label htmlFor={`q9_3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Adequado</b> - Ajustes leves necessários na operação seguinte.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q9_${iAba}`} id={`q9_2_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q9_fap === 2} onChange={() => handleChange("n_q9_fap", 2)} />
                <label htmlFor={`q9_2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Básico</b> - Montagem incorreta</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q9_${iAba}`} id={`q9_1_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q9_fap === 1} onChange={() => handleChange("n_q9_fap", 1)} />
                <label htmlFor={`q9_1_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Abaixo do Básico</b> - Montagem incorreta com peças danificadas</label>
              </div>
            </div>
          </div>
        </div>

        {/* --- ORGANIZAÇÃO DO POSTO - 5S --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>ORGANIZAÇÃO DO POSTO - 5S (C1, C3, C4)</div>
          <div className={styles.fapSection_descricao}>Critério: Mantém o posto organizado antes, durante e após o ciclo.</div>
          <div className={styles.fapSection_colunas}>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q10_${iAba}`} id={`q10_4_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q10_fap === 4} onChange={() => handleChange("n_q10_fap", 4)} />
                <label htmlFor={`q10_4_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Avançado</b> - Padrão exemplar, evitando desordem.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q10_${iAba}`} id={`q10_3_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q10_fap === 3} onChange={() => handleChange("n_q10_fap", 3)} />
                <label htmlFor={`q10_3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Adequado</b> - Desordem corrigida a cada ciclo ou observação.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q10_${iAba}`} id={`q10_2_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q10_fap === 2} onChange={() => handleChange("n_q10_fap", 2)} />
                <label htmlFor={`q10_2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Básico</b> - Padrões se repetem na passagem de ciclos.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q10_${iAba}`} id={`q10_1_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q10_fap === 1} onChange={() => handleChange("n_q10_fap", 1)} />
                <label htmlFor={`q10_1_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Abaixo do Básico</b> - Posto caótico, ferramental em desordem e peças que se confundem.</label>
              </div>
            </div>
          </div>
        </div>

        {/* --- ACOMPANHAMENTO DO TAKT TIME --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>ACOMPANHAMENTO DO TAKT TIME (C6, C8, C9)</div>
          <div className={styles.fapSection_descricao}>Critério: Conclui ciclos do takt; baixa variabilidade. (takt determinado conforme POPs da linha simulada).</div>
          <div className={styles.fapSection_colunas}>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q11_${iAba}`} id={`q11_4_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q11_fap === 4} onChange={() => handleChange("n_q11_fap", 4)} />
                <label htmlFor={`q11_4_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Avançado</b> - 85% dos ciclos dentro do takt; ritmo estável</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q11_${iAba}`} id={`q11_3_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q11_fap === 3} onChange={() => handleChange("n_q11_fap", 3)} />
                <label htmlFor={`q11_3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Adequado</b> - 60% a 85% do takt; pequenas oscilações</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q11_${iAba}`} id={`q11_2_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q11_fap === 2} onChange={() => handleChange("n_q11_fap", 2)} />
                <label htmlFor={`q11_2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Básico</b> - 40% a 60% no takt; variação perceptível.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q11_${iAba}`} id={`q11_1_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q11_fap === 1} onChange={() => handleChange("n_q11_fap", 1)} />
                <label htmlFor={`q11_1_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Abaixo do Básico</b> - &lt; 40% no takt.</label>
              </div>
            </div>
          </div>
        </div>

        {/* --- RESILIÊNCIA FÍSICA E MENTAL --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>RESILIÊNCIA FÍSICA E MENTAL (C9, C11)</div>
          <div className={styles.fapSection_descricao}>Critério: Mantém foco, postura e estabilidade ao longo do rodízio (montagem e desmontagem).</div>
          <div className={styles.fapSection_colunas}>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q12_${iAba}`} id={`q12_4_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q12_fap === 4} onChange={() => handleChange("n_q12_fap", 4)} />
                <label htmlFor={`q12_4_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Avançado</b> - Adapta-se rapidamente aos postos; mantém rítmo e foco</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q12_${iAba}`} id={`q12_3_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q12_fap === 3} onChange={() => handleChange("n_q12_fap", 3)} />
                <label htmlFor={`q12_3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Adequado</b> - Adapta-se com pequenas perdas de foco.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q12_${iAba}`} id={`q12_2_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q12_fap === 2} onChange={() => handleChange("n_q12_fap", 2)} />
                <label htmlFor={`q12_2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Básico</b> - Oscilações frequentes, mas continua engajado.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q12_${iAba}`} id={`q12_1_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q12_fap === 1} onChange={() => handleChange("n_q12_fap", 1)} />
                <label htmlFor={`q12_1_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Abaixo do Básico</b> - Perde o ritmo, demonstra resistência à mudança.</label>
              </div>
            </div>
          </div>
        </div>
      </div>

{/* OBSERVAÇÕES */}
<div className={`${styles.camposPreenchimento} ${abaObservacaoAberta && styles.camposPreenchimento_show}`}>
        <div className={styles.btn_mostrarCamposPreenchimento} onClick={() => setAbaObservacaoAberta(!abaObservacaoAberta)}>
          {/* 3. Removido o onClick={()=>{}} vazio daqui */}
          <Image src={abaObservacaoAberta ? "/assets/icons/arrow_down_w.svg" : "/assets/icons/arrow_up_w.svg"} alt="Mostrar/Ocultar" width={40} height={40} className={styles.btn_camposPreenchimento_img} />
        </div>
        <div className={styles.area_camposPreenchimento}>
          <div className={styles.area_camposPreenchimento_title}>CAMPOS DE OBSERVAÇÃO (para avaliadores)</div>
          
          <div className={styles.observacaoSection}>
            <div className={styles.observacaoSection_title}>Segurança - Comentários:</div>
            <div className={styles.observacaoSection_colunas}>
              <div className={styles.observacaoSection_field}>
                <input 
                  type="text" 
                  name={`q13_${iAba}`} 
                  id={`q13_1_${iAba}`} 
                  className={styles.fieldForm_input_fap} 
                  /* 1 e 2. Adicionado o value e capturando o e.target.value */
                  value={fap.s_q13_fap} 
                  onChange={(e) => handleChange("s_q13_fap", e.target.value)} 
                />
              </div>
            </div>
          </div>
          
          <div className={styles.observacaoSection}>
            <div className={styles.observacaoSection_title}>Qualidade - Comentários:</div>
            <div className={styles.observacaoSection_colunas}>
              <div className={styles.observacaoSection_field}>
                <input 
                  type="text" 
                  name={`q14_${iAba}`} 
                  id={`q14_1_${iAba}`} 
                  className={styles.fieldForm_input_fap} 
                  value={fap.s_q14_fap} 
                  onChange={(e) => handleChange("s_q14_fap", e.target.value)} 
                />
              </div>
            </div>
          </div>
          
          <div className={styles.observacaoSection}>
            <div className={styles.observacaoSection_title}>Produtividade - Comentários:</div>
            <div className={styles.observacaoSection_colunas}>
              <div className={styles.observacaoSection_field}>
                <input 
                  type="text" 
                  name={`q15_${iAba}`} 
                  id={`q15_1_${iAba}`} 
                  className={styles.fieldForm_input_fap} 
                  value={fap.s_q15_fap} 
                  onChange={(e) => handleChange("s_q15_fap", e.target.value)} 
                />
              </div>
            </div>
          </div>
          
          <div className={styles.observacaoSection}>
            <div className={styles.observacaoSection_title}>Comportamento Geral</div>
            <div className={styles.observacaoSection_colunas}>
              <div className={styles.observacaoSection_field}>
                <input 
                  type="text" 
                  name={`q16_${iAba}`} 
                  id={`q16_1_${iAba}`} 
                  className={styles.fieldForm_input_fap} 
                  value={fap.s_q16_fap} 
                  onChange={(e) => handleChange("s_q16_fap", e.target.value)} 
                />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}