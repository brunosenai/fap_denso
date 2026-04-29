import styles from "@/styles/Fap.module.css";
import { tFap } from "@/utils/Types";
import Image from "next/image";

interface FapProps {
  iAba: number;
  fap: tFap;
  setFap: React.Dispatch<React.SetStateAction<tFap[]>>;
  abaObservacaoAberta: boolean; 
  setAbaObservacaoAberta: React.Dispatch<React.SetStateAction<boolean>>; 
  abrirPopup: (i: number) => void;
}

export default function Fap({ iAba, fap, setFap, abaObservacaoAberta, setAbaObservacaoAberta, abrirPopup}: FapProps) {

  const handleChange = (campo: keyof tFap, valor: number | string) => {
    setFap((prevFap) => {
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
                <label htmlFor={`d1_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Desmontagem 4</label>
              </div>
            </div>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="checkbox" className={styles.fieldForm_checkbox_fap} id={`m2_${iAba}`} checked={Boolean(fap.n_posto3_fap)} onChange={(e) => handleChange("n_posto3_fap", e.target.checked ? 1 : 0)} />
                <label htmlFor={`m2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Montagem 2</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="checkbox" className={styles.fieldForm_checkbox_fap} id={`d2_${iAba}`} checked={Boolean(fap.n_posto4_fap)} onChange={(e) => handleChange("n_posto4_fap", e.target.checked ? 1 : 0)} />
                <label htmlFor={`d2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Desmontagem 5</label>
              </div>
            </div>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="checkbox" className={styles.fieldForm_checkbox_fap} id={`m3_${iAba}`} checked={Boolean(fap.n_posto5_fap)} onChange={(e) => handleChange("n_posto5_fap", e.target.checked ? 1 : 0)} />
                <label htmlFor={`m3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Montagem 3</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="checkbox" className={styles.fieldForm_checkbox_fap} id={`d3_${iAba}`} checked={Boolean(fap.n_posto6_fap)} onChange={(e) => handleChange("n_posto6_fap", e.target.checked ? 1 : 0)} />
                <label htmlFor={`d3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>Desmontagem 6</label>
              </div>
            </div>
          </div>
        </div>

        {/* --- Condução segura do ciclo --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>
            Condução segura do ciclo (C2, C3, C4, C5, C8)
            <div onClick={()=>{abrirPopup(1)}}>
              <Image src="/assets/icons/info.svg" alt="Info" width={20} height={20} className={styles.fapSection_title_icon} />
            </div>
          </div>
          <div className={styles.fapSection_descricao}>Mediação: O candidato utiliza corretamente todos os EPI's obrigatórios e conduz o ciclo de trabalho de maneira segura, demonstrando percepção e ação preventiva frente a eventuais situações de risco ambiental e de segurança ao longo de toda a avaliação?</div>
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
          <div className={styles.fapSection_title}>
            Tratamento adequado de Não Conformidade - Stop & Call (C7, C10)
            <div onClick={()=>{abrirPopup(2)}}>
              <Image src="/assets/icons/info.svg" alt="Info" width={20} height={20} className={styles.fapSection_title_icon} />
            </div>            
          </div>
          <div className={styles.fapSection_descricao}>Mediação: O candidato detectou corretamente eventuais não conformidades ao logo do teste e acionou devidamente o protocolo "Parar e Sinalizar" ou Ignorou desvios, e/ou montou  peças defeituosas, sendo esta condição causada ou não por ele.</div>
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
          <div className={styles.fapSection_title}>
            DISCIPLINA OPERACIONAL (C1, C9, C10)
            <div onClick={()=>{abrirPopup(3)}}>
              <Image src="/assets/icons/info.svg" alt="Info" width={20} height={20} className={styles.fapSection_title_icon} />
            </div>
          </div>
          <div className={styles.fapSection_descricao}>Mediação: O candidato segue a documentação padrão de montagem/desmontagem com rigor, sem atalhos, sem quebras de sequência e mantendo conduta operacional adequada.</div>
          <div className={styles.fapSection_colunas}>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q8_${iAba}`} id={`q8_4_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q8_fap === 4} onChange={() => handleChange("n_q8_fap", 4)} />
                <label htmlFor={`q8_4_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Avançado</b> - Executa 100% da sequência SEM hesitação, conduta exemplar. (4 pontos)</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q8_${iAba}`} id={`q8_3_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q8_fap === 3} onChange={() => handleChange("n_q8_fap", 3)} />
                <label htmlFor={`q8_3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Adequado</b> - Hesitações LEVES (conferência constante da documentação), SEM quebras de padrão. (3 pontos)</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q8_${iAba}`} id={`q8_2_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q8_fap === 2} onChange={() => handleChange("n_q8_fap", 2)} />
                <label htmlFor={`q8_2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Básico</b> - Quebras de sequências corrigidas APENAS mediante avisos CONSTANTES. (2 pontos)</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q8_${iAba}`} id={`q8_1_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q8_fap === 1} onChange={() => handleChange("n_q8_fap", 1)} />
                <label htmlFor={`q8_1_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Abaixo do Básico</b> - Desrespeito total a sequência/Risco operacional. (1 ponto)</label>
              </div>
            </div>
          </div>
        </div>      

        {/* --- MONTAGEM CORRETA --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>
            MONTAGEM CORRETA (C4, C5, C6)
            <div onClick={()=>{abrirPopup(4)}}>
              <Image src="/assets/icons/info.svg" alt="Info" width={20} height={20} className={styles.fapSection_title_icon} />
            </div>
          </div>
          <div className={styles.fapSection_descricao}>Mediação: O candidato realiza a correta montagem/desmontagem do subconjunto conforme especificação sem danos e com autochecagem: documentação/físico.</div>
          <div className={styles.fapSection_colunas}>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q9_${iAba}`} id={`q9_4_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q9_fap === 4} onChange={() => handleChange("n_q9_fap", 4)} />
                <label htmlFor={`q9_4_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Avançado</b> - Montagem correta COM visível e evidente autochecagem do realizado.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q9_${iAba}`} id={`q9_3_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q9_fap === 3} onChange={() => handleChange("n_q9_fap", 3)} />
                <label htmlFor={`q9_3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Adequado</b> - Montagem correta SEM visível e evidente autochecagem do realizado.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q9_${iAba}`} id={`q9_2_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q9_fap === 2} onChange={() => handleChange("n_q9_fap", 2)} />
                <label htmlFor={`q9_2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Básico</b> - Montagens incorretas corrigidas na próxima operação.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q9_${iAba}`} id={`q9_1_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q9_fap === 1} onChange={() => handleChange("n_q9_fap", 1)} />
                <label htmlFor={`q9_1_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Abaixo do Básico</b> - Montagem incorreta gerando parada de linha (Tempo excessivo para correção ou impossibilidade de sequência de operações).</label>
              </div>
            </div>
          </div>
        </div>

        {/* --- MANUTENÇÃO DO POSTO DE TRABALHO - 5S --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>
            MANUTENÇÃO DO POSTO DE TRABALHO – 5S (C1, C3, C4)
            <div onClick={()=>{abrirPopup(5)}}>
              <Image src="/assets/icons/info.svg" alt="Info" width={20} height={20} className={styles.fapSection_title_icon} />
            </div>
          </div>
          <div className={styles.fapSection_descricao}>Mediação: O candidato mantém o posto organizado e funcional durante toda a operação, sustentando a posição padronizada da ferramenta, devida alocação das peças observando sua quantidade padronizada de maneira racional.</div>
          <div className={styles.fapSection_colunas}>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q10_${iAba}`} id={`q10_4_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q10_fap === 4} onChange={() => handleChange("n_q10_fap", 4)} />
                <label htmlFor={`q10_4_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Avançado</b> - Padrões exemplares, antecipando-se à necessidades.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q10_${iAba}`} id={`q10_3_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q10_fap === 3} onChange={() => handleChange("n_q10_fap", 3)} />
                <label htmlFor={`q10_3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Adequado</b> - Correções APÓS erros observados.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q10_${iAba}`} id={`q10_2_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q10_fap === 2} onChange={() => handleChange("n_q10_fap", 2)} />
                <label htmlFor={`q10_2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Básico</b> - Rotinas logísticas NÃO respeitadas em sua integralidade.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q10_${iAba}`} id={`q10_1_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q10_fap === 1} onChange={() => handleChange("n_q10_fap", 1)} />
                <label htmlFor={`q10_1_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Abaixo do Básico</b> - Ferramental fora da alocação,  peças que se confundem e rotinas não respeitadas.</label>
              </div>
            </div>
          </div>
        </div>

        {/* --- ACOMPANHAMENTO DO TAKT TIME --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>
            ACOMPANHAMENTO DO TAKT TIME (C6, C8, C9)
            <div onClick={()=>{abrirPopup(6)}}>
              <Image src="/assets/icons/info.svg" alt="Info" width={20} height={20} className={styles.fapSection_title_icon} />
            </div>
          </div>
          <div className={styles.fapSection_descricao}>Mediação: O candidato realiza ciclos de montagem dentro do takt time, mantendo baixa variabilidade entre ciclos e demonstra boa desenvoltura com o uso de ferramentas manuais.</div>
          <div className={styles.fapSection_colunas}>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q11_${iAba}`} id={`q11_4_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q11_fap === 4} onChange={() => handleChange("n_q11_fap", 4)} />
                <label htmlFor={`q11_4_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Avançado</b> - Utiliza o ferramental do segurança e destreza.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q11_${iAba}`} id={`q11_3_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q11_fap === 3} onChange={() => handleChange("n_q11_fap", 3)} />
                <label htmlFor={`q11_3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Adequado</b> - Adapta-se à atividade com o passar dos ciclos.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q11_${iAba}`} id={`q11_2_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q11_fap === 2} onChange={() => handleChange("n_q11_fap", 2)} />
                <label htmlFor={`q11_2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Básico</b> - Apresenta dificuldades/limitações na operação do posto (Posicionamento das porcas e/ou uso da ferramenta e/ou cruzamento das mãos)</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q11_${iAba}`} id={`q11_1_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q11_fap === 1} onChange={() => handleChange("n_q11_fap", 1)} />
                <label htmlFor={`q11_1_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Abaixo do Básico</b> - Possui dificuldades EVIDENTES (gerais) para acompanhamento dos ciclos.</label>
              </div>
            </div>
          </div>
        </div>

        {/* --- RESILIÊNCIA FÍSICA E MENTAL --- */}
        <div className={styles.fapSection}>
          <div className={styles.fapSection_title}>
            RESILIÊNCIA FÍSICA E MENTAL (C9, C11)
            <div onClick={()=>{abrirPopup(7)}}>
              <Image src="/assets/icons/info.svg" alt="Info" width={20} height={20} className={styles.fapSection_title_icon} />
            </div>
          </div>
          <div className={styles.fapSection_descricao}>Mediação: O candidato mantém foco, postura, constância e estabilidade emocional durante toda a atividade, mesmo sob repetitividade, desconforto controlado e micropressões.</div>
          <div className={styles.fapSection_colunas}>
            <div className={styles.fapSection_col}>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q12_${iAba}`} id={`q12_4_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q12_fap === 4} onChange={() => handleChange("n_q12_fap", 4)} />
                <label htmlFor={`q12_4_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Avançado</b> - Adapta-se rápido a mudanças SEM perda de foco.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q12_${iAba}`} id={`q12_3_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q12_fap === 3} onChange={() => handleChange("n_q12_fap", 3)} />
                <label htmlFor={`q12_3_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Adequado</b> - Adapta-se a mudanças COM perda do foco momentaneamente.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q12_${iAba}`} id={`q12_2_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q12_fap === 2} onChange={() => handleChange("n_q12_fap", 2)} />
                <label htmlFor={`q12_2_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Básico</b> - Oscilações perceptíveis, mas mantém o engajamento à atividade.</label>
              </div>
              <div className={styles.fapSection_field}>
                <input type="radio" name={`q12_${iAba}`} id={`q12_1_${iAba}`} className={styles.fieldForm_checkbox_fap} checked={fap.n_q12_fap === 1} onChange={() => handleChange("n_q12_fap", 1)} />
                <label htmlFor={`q12_1_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}><b>Abaixo do Básico</b> - Perde o ritmo, o foco e demonstra resistência.</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OBSERVAÇÕES */}
      <div className={`${styles.camposPreenchimento} ${abaObservacaoAberta && styles.camposPreenchimento_show}`}>
        <div className={styles.btn_mostrarCamposPreenchimento} onClick={() => setAbaObservacaoAberta(!abaObservacaoAberta)}>
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