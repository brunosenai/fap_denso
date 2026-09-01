import styles from "@/styles/Fap.module.css";
import { tFap, tConfigFap } from "@/utils/Types";
import Image from "next/image";

interface FapProps {
  iAba: number;
  fap: tFap;
  setFap: React.Dispatch<React.SetStateAction<tFap[]>>;
  fapConfig: tConfigFap;
  abaObservacaoAberta: boolean; 
  setAbaObservacaoAberta: React.Dispatch<React.SetStateAction<boolean>>; 
  abrirPopup: (questaoInfo: any) => void;
}

export default function Fap({ iAba, fap, setFap, fapConfig, abaObservacaoAberta, setAbaObservacaoAberta, abrirPopup}: FapProps) {

  // Dynamic answers handler
  const handleDynamicChange = (campo: string, valor: number | string) => {
    setFap((prevFap) => {
      const novoFap = [...prevFap];
      const jResp = novoFap[iAba].j_respostas as any || {};
      jResp[campo] = valor;
      novoFap[iAba] = { ...novoFap[iAba], j_respostas: jResp };
      return novoFap;
    });
  };

  // Fixed legacy field handler for backwards compatibility or specific needs
  const handleChange = (campo: keyof tFap, valor: number | string) => {
    setFap((prevFap) => {
      const novoFap = [...prevFap];
      novoFap[iAba] = { ...novoFap[iAba], [campo]: valor };
      return novoFap;
    });
  };

  const respostas = (fap.j_respostas as any) || {};

  return (
    <div className={styles.fapComponent_container}>
      <div className={styles.fapComponent}>
        
        {/* --- POSTOS PERCORRIDOS --- */}
        {fapConfig.postos && fapConfig.postos.filter(p => p.habilitado).length > 0 && (() => {
          const postosAtivos = fapConfig.postos.filter(p => p.habilitado);
          const meio = Math.ceil(postosAtivos.length / 2);
          const primeiraMetade = postosAtivos.slice(0, meio);
          const segundaMetade = postosAtivos.slice(meio);

          return (
            <div className={styles.fapSection}>
              <div className={styles.fapSection_title}>Postos de Trabalho</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingTop: '10px', width: '100%', overflowX: 'auto' }}>
                
                {/* Linha 1 */}
                <div className={styles.fapSection_colunas} style={{ flexWrap: 'nowrap', gap: '25px', width: 'max-content' }}>
                  {primeiraMetade.map((posto) => (
                    <div key={posto.id} className={styles.fapSection_col} style={{ width: '200px', alignItems: 'flex-start' }}>
                      <div className={styles.fapSection_field}>
                        <input 
                          type="checkbox" 
                          className={styles.fieldForm_checkbox_fap} 
                          id={`posto_${posto.id}_${iAba}`} 
                          checked={respostas[`posto_${posto.id}`] === 1} 
                          onChange={(e) => handleDynamicChange(`posto_${posto.id}`, e.target.checked ? 1 : 0)} 
                        />
                        <label htmlFor={`posto_${posto.id}_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>
                          {posto.nome}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Linha 2 */}
                {segundaMetade.length > 0 && (
                  <div className={styles.fapSection_colunas} style={{ flexWrap: 'nowrap', gap: '25px', width: 'max-content' }}>
                    {segundaMetade.map((posto) => (
                      <div key={posto.id} className={styles.fapSection_col} style={{ width: '200px', alignItems: 'flex-start' }}>
                        <div className={styles.fapSection_field}>
                          <input 
                            type="checkbox" 
                            className={styles.fieldForm_checkbox_fap} 
                            id={`posto_${posto.id}_${iAba}`} 
                            checked={respostas[`posto_${posto.id}`] === 1} 
                            onChange={(e) => handleDynamicChange(`posto_${posto.id}`, e.target.checked ? 1 : 0)} 
                          />
                          <label htmlFor={`posto_${posto.id}_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>
                            {posto.nome}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
              </div>
            </div>
          );
        })()}

        {/* --- QUESTÕES DINÂMICAS --- */}
        {fapConfig.questoes && fapConfig.questoes.filter(q => q.habilitada).map((questao) => (
          <div key={questao.id} className={styles.fapSection}>
            <div className={styles.fapSection_title}>
              {questao.titulo}
              <div onClick={() => abrirPopup(questao)}>
                <Image src="/assets/icons/info.svg" alt="Info" width={20} height={20} className={styles.fapSection_title_icon} />
              </div>
            </div>
            {questao.mediacao && (
              <div className={styles.fapSection_descricao}>
                Mediação: {questao.mediacao}
              </div>
            )}
            <div className={styles.fapSection_linhas}>
              <div className={styles.fapSection_lin}>
                {questao.tipo === 'sn' ? (
                  <>
                    <div className={styles.fapSection_field}>
                      <input 
                        type="radio" 
                        name={`q_${questao.id}_${iAba}`} 
                        id={`q_${questao.id}_sim_${iAba}`} 
                        className={styles.fieldForm_checkbox_fap} 
                        checked={respostas[`q_${questao.id}`] === 1} 
                        onChange={() => handleDynamicChange(`q_${questao.id}`, 1)} 
                      />
                      <label htmlFor={`q_${questao.id}_sim_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>
                        {questao.opcoes?.find(o => o.valor === 1)?.rotulo || "Atende"}
                      </label>
                    </div>
                    <div className={styles.fapSection_field}>
                      <input 
                        type="radio" 
                        name={`q_${questao.id}_${iAba}`} 
                        id={`q_${questao.id}_nao_${iAba}`} 
                        className={styles.fieldForm_checkbox_fap} 
                        checked={respostas[`q_${questao.id}`] === 0} 
                        onChange={() => handleDynamicChange(`q_${questao.id}`, 0)} 
                      />
                      <label htmlFor={`q_${questao.id}_nao_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>
                        {questao.opcoes?.find(o => o.valor === 0)?.rotulo || "Não atende"}
                      </label>
                    </div>
                  </>
                ) : (
                  <div className={styles.fapSection_colunas}>
                    <div className={styles.fapSection_col}>
                      {[4, 3, 2, 1].map((nota) => {
                        const opt = questao.opcoes?.find(o => o.valor === nota);
                        const defaultTitle = nota === 4 ? "Avançado" : nota === 3 ? "Adequado" : nota === 2 ? "Básico" : "Abaixo do Básico";
                        const rotulo = opt?.rotulo || defaultTitle;
                        const dashIdx = rotulo.indexOf(' - ');
                        const titlePart = dashIdx !== -1 ? rotulo.substring(0, dashIdx) : rotulo;
                        const descPart = dashIdx !== -1 ? rotulo.substring(dashIdx + 3) : '';

                        return (
                          <div key={nota} className={styles.fapSection_field}>
                            <input 
                              type="radio" 
                              name={`q_${questao.id}_${iAba}`} 
                              id={`q_${questao.id}_${nota}_${iAba}`} 
                              className={styles.fieldForm_checkbox_fap} 
                              checked={respostas[`q_${questao.id}`] === nota} 
                              onChange={() => handleDynamicChange(`q_${questao.id}`, nota)} 
                            />
                            <label htmlFor={`q_${questao.id}_${nota}_${iAba}`} className={styles.fieldForm_checkbox_fapLabel}>
                              {dashIdx !== -1 ? <><b>{titlePart}</b> - {descPart}</> : (opt?.rotulo ? rotulo : <b>{defaultTitle}</b>)}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
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
                  value={fap.s_q13_fap || ""} 
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
                  value={fap.s_q14_fap || ""} 
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
                  value={fap.s_q15_fap || ""} 
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
                  value={fap.s_q16_fap || ""} 
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