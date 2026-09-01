import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { tCandidato, tFap } from "@/utils/Types";

// Estilos restaurados para as proporções reais do A4
const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 0, fontFamily: 'Helvetica' },
  
  headerTop: { backgroundColor: '#E3000F', height: 75, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40 },
  logo: { height: 38, width: 115, objectFit: 'contain' },
  
  // Margens normais restauradas
  body: { paddingHorizontal: 30, paddingTop: 15, paddingBottom: 20 },
  
  mainTitle: { fontSize: 16, color: '#E3000F', fontWeight: 'bold', textAlign: 'center', marginBottom: 15, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 11, color: '#E3000F', fontWeight: 'bold', marginTop: 12, marginBottom: 6, textTransform: 'uppercase' },
  
  row: { flexDirection: 'row', marginBottom: 3, alignItems: 'center' },
  label: { fontSize: 10, fontWeight: 'bold', color: '#333' },
  value: { fontSize: 10, color: '#333', marginLeft: 4 },
  
  resultContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  boxLeft: { width: '65%', backgroundColor: '#FFF0F0', padding: 12, borderRadius: 5 },
  boxRight: { width: '32%', backgroundColor: '#FFF0F0', padding: 12, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  statusTextAprovado: { color: '#00C853', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  statusTextReprovado: { color: '#FF5252', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  
  grid3Cols: { flexDirection: 'row', flexWrap: 'wrap' },
  checkboxItem: { width: '33%', flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  boxUnchecked: { width: 10, height: 10, borderWidth: 1, borderColor: '#555', borderRadius: 2, marginRight: 5 },
  boxChecked: { width: 10, height: 10, backgroundColor: '#333', borderRadius: 2, marginRight: 5 },
  checkboxText: { fontSize: 9, color: '#555' },
  
  criterionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  criterionText: { fontSize: 9, color: '#333' },
  
  badge: { paddingVertical: 3, paddingHorizontal: 12, borderRadius: 10, minWidth: 75, textAlign: 'center' },
  badgeText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
  badgeGreen: { backgroundColor: '#00C853' },
  badgeRed: { backgroundColor: '#FF5252' },
  badgeLightGreen: { backgroundColor: '#8BC34A' },
  badgeOrange: { backgroundColor: '#FFB300' },
  
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#CCC', paddingBottom: 3, marginBottom: 6 },
  tableHeaderText: { fontSize: 9, color: '#666', fontWeight: 'bold' },
  
  obsBox: { backgroundColor: '#FFF0F0', padding: 12, borderRadius: 5, marginTop: 8 },
  obsTitle: { fontSize: 11, color: '#E3000F', fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  
  // Novo estilo para as observações (Rótulo e valor na mesma linha para poupar espaço vertical)
  obsLine: { flexDirection: 'row', marginBottom: 4 },
  obsLabel: { fontSize: 9, fontWeight: 'bold', color: '#333' },
  obsText: { fontSize: 9, color: '#555', marginLeft: 4, flex: 1 }
});

interface PropsPDF {
  candidato: tCandidato;
  fapCandidato: tFap;
}

const getDesempenhoBadge = (nota: number) => {
  switch (nota) {
    case 4: return { text: "Avançado", style: styles.badgeGreen };
    case 3: return { text: "Adequado", style: styles.badgeLightGreen };
    case 2: return { text: "Básico", style: styles.badgeOrange };
    case 1: return { text: "Abaixo do Básico", style: styles.badgeRed };
    default: return { text: "-", style: styles.badgeRed };
  }
};

const getOperacionalBadge = (nota: number) => {
  return nota === 1 
    ? { text: "Atende", style: styles.badgeGreen } 
    : { text: "Não atende", style: styles.badgeRed };
};

export const RelatorioFap = ({ candidato, fapCandidato }: PropsPDF) => {
  const isAprovado = fapCandidato?.n_resultado_fap === 1;
  const notaFinal = fapCandidato?.n_nota_fap || 0;
  
  // ATUALIZADO: O divisor agora é 22 (pontuação máxima)
  const percentual = Math.round((notaFinal / 22) * 100); 
  const classificacaoText = isAprovado ? "ADEQUADO" : "INADEQUADO"; 
  
  const dataAvaliacao = fapCandidato?.dt_date_fap 
    ? new Date(fapCandidato.dt_date_fap).toLocaleDateString('pt-BR') 
    : new Date().toLocaleDateString('pt-BR');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.headerTop}>
          <Image 
            src={`${typeof window !== 'undefined' ? window.location.origin : ''}/assets/logo-centro-branco.png`} 
            style={styles.logo} 
          /> 
          <Image 
            src={`${typeof window !== 'undefined' ? window.location.origin : ''}/assets/denso_logo.png`} 
            style={styles.logo} 
          />
        </View>

        <View style={styles.body}>
          <Text style={styles.mainTitle}>Relatório de Avaliação</Text>

          {/* INFORMAÇÕES */}
          <Text style={styles.sectionTitle}>INFORMAÇÕES</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Data:</Text>
            <Text style={styles.value}>{dataAvaliacao}</Text> 
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Candidato:</Text>
            <Text style={styles.value}>{candidato?.s_nome_candidato || 'Não informado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ID Avaliador:</Text>
            <Text style={styles.value}>{fapCandidato?.n_id_pessoa || '-'}</Text>
          </View>

          {/* RESULTADO */}
          <Text style={styles.sectionTitle}>RESULTADO</Text>
          <View style={styles.resultContainer}>
            <View style={styles.boxLeft}>
              <View style={styles.row}>
                <Text style={styles.label}>RESULTADO FINAL:</Text>
                <Text style={styles.value}>{notaFinal}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>PERCENTUAL:</Text>
                <Text style={styles.value}>{percentual}%</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>CLASSIFICAÇÃO:</Text>
                <Text style={styles.value}>{classificacaoText}</Text>
              </View>
            </View>
            
            <View style={styles.boxRight}>
              <Text style={isAprovado ? styles.statusTextAprovado : styles.statusTextReprovado}>
                {isAprovado ? 'APROVADO' : 'REPROVADO'}
              </Text>
            </View>
          </View>

          {/* POSTOS PERCORRIDOS */}
          <Text style={styles.sectionTitle}>POSTOS PERCORRIDOS</Text>
          <View style={styles.grid3Cols}>
            <View style={styles.checkboxItem}>
              <View style={fapCandidato?.n_posto1_fap === 1 ? styles.boxChecked : styles.boxUnchecked} />
              <Text style={styles.checkboxText}>Montagem 1</Text>
            </View>
            <View style={styles.checkboxItem}>
              <View style={fapCandidato?.n_posto3_fap === 1 ? styles.boxChecked : styles.boxUnchecked} />
              <Text style={styles.checkboxText}>Montagem 2</Text>
            </View>
            <View style={styles.checkboxItem}>
              <View style={fapCandidato?.n_posto5_fap === 1 ? styles.boxChecked : styles.boxUnchecked} />
              <Text style={styles.checkboxText}>Montagem 3</Text>
            </View>
            <View style={styles.checkboxItem}>
              <View style={fapCandidato?.n_posto2_fap === 1 ? styles.boxChecked : styles.boxUnchecked} />
              <Text style={styles.checkboxText}>Desmontagem 4</Text>
            </View>
            <View style={styles.checkboxItem}>
              <View style={fapCandidato?.n_posto4_fap === 1 ? styles.boxChecked : styles.boxUnchecked} />
              <Text style={styles.checkboxText}>Desmontagem 5</Text>
            </View>
            <View style={styles.checkboxItem}>
              <View style={fapCandidato?.n_posto6_fap === 1 ? styles.boxChecked : styles.boxUnchecked} />
              <Text style={styles.checkboxText}>Desmontagem 6</Text>
            </View>
          </View>

          {/* CRITÉRIOS OPERACIONAIS */}
          <Text style={styles.sectionTitle}>CRITÉRIOS OPERACIONAIS</Text>
          
          <View style={styles.criterionRow}>
            <Text style={styles.criterionText}>Condução segura do ciclo (C2, C3, C4, C5, C8)</Text>
            <View style={[styles.badge, getOperacionalBadge(fapCandidato?.n_q6_fap).style]}>
              <Text style={styles.badgeText}>{getOperacionalBadge(fapCandidato?.n_q6_fap).text}</Text>
            </View>
          </View>

          <View style={styles.criterionRow}>
            <Text style={styles.criterionText}>Tratamento adequado de Não Conf. - Stop & Call</Text>
            <View style={[styles.badge, getOperacionalBadge(fapCandidato?.n_q7_fap).style]}>
              <Text style={styles.badgeText}>{getOperacionalBadge(fapCandidato?.n_q7_fap).text}</Text>
            </View>
          </View>

          {/* AVALIAÇÃO DE DESEMPENHO */}
          <Text style={styles.sectionTitle}>AVALIAÇÃO DE DESEMPENHO</Text>
          
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>CRITÉRIO</Text>
            <Text style={styles.tableHeaderText}>PONTUAÇÃO</Text>
          </View>

          <View style={styles.criterionRow}>
            <Text style={styles.criterionText}>Disciplina Operacional (C1, C9, C10)</Text>
            <View style={[styles.badge, getDesempenhoBadge(fapCandidato?.n_q8_fap).style]}>
              <Text style={styles.badgeText}>{getDesempenhoBadge(fapCandidato?.n_q8_fap).text}</Text>
            </View>
          </View>

          <View style={styles.criterionRow}>
            <Text style={styles.criterionText}>Montagem Correta (C4, C5, C6)</Text>
            <View style={[styles.badge, getDesempenhoBadge(fapCandidato?.n_q9_fap).style]}>
              <Text style={styles.badgeText}>{getDesempenhoBadge(fapCandidato?.n_q9_fap).text}</Text>
            </View>
          </View>

          <View style={styles.criterionRow}>
            <Text style={styles.criterionText}>Manutenção do Posto de Trabalho - 5S (C1, C3, C4)</Text>
            <View style={[styles.badge, getDesempenhoBadge(fapCandidato?.n_q10_fap).style]}>
              <Text style={styles.badgeText}>{getDesempenhoBadge(fapCandidato?.n_q10_fap).text}</Text>
            </View>
          </View>

          <View style={styles.criterionRow}>
            <Text style={styles.criterionText}>Acompanhamento do Takt Time (C6, C8, C9)</Text>
            <View style={[styles.badge, getDesempenhoBadge(fapCandidato?.n_q11_fap).style]}>
              <Text style={styles.badgeText}>{getDesempenhoBadge(fapCandidato?.n_q11_fap).text}</Text>
            </View>
          </View>

          <View style={styles.criterionRow}>
            <Text style={styles.criterionText}>Resiliência Física e Mental (C9, C11)</Text>
            <View style={[styles.badge, getDesempenhoBadge(fapCandidato?.n_q12_fap).style]}>
              <Text style={styles.badgeText}>{getDesempenhoBadge(fapCandidato?.n_q12_fap).text}</Text>
            </View>
          </View>

          {/* OBSERVAÇÕES */}
          <View style={styles.obsBox}>
            <Text style={styles.obsTitle}>OBSERVAÇÕES</Text>
            
            <View style={styles.obsLine}>
              <Text style={styles.obsLabel}>Segurança:</Text>
              <Text style={styles.obsText}>{(fapCandidato as any)?.s_q13_fap || "-"}</Text>
            </View>

            <View style={styles.obsLine}>
              <Text style={styles.obsLabel}>Qualidade:</Text>
              <Text style={styles.obsText}>{(fapCandidato as any)?.s_q14_fap || "-"}</Text>
            </View>

            <View style={styles.obsLine}>
              <Text style={styles.obsLabel}>Produtividade:</Text>
              <Text style={styles.obsText}>{(fapCandidato as any)?.s_q15_fap || "-"}</Text>
            </View>

            <View style={styles.obsLine}>
              <Text style={styles.obsLabel}>Comportamento Geral:</Text>
              <Text style={styles.obsText}>{(fapCandidato as any)?.s_q16_fap || "-"}</Text>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  );
};