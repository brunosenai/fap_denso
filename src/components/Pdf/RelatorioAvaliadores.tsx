import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 0, fontFamily: 'Helvetica' },
  headerTop: { backgroundColor: '#E3000F', height: 75, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40 },
  logo: { height: 38, width: 115, objectFit: 'contain' },
  body: { paddingHorizontal: 40, paddingTop: 30, paddingBottom: 20 },
  mainTitle: { fontSize: 18, color: '#E3000F', fontWeight: 'bold', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase' },
  periodText: { fontSize: 11, color: '#555', textAlign: 'center', marginBottom: 25 },
  sectionTitle: { fontSize: 14, color: '#E3000F', fontWeight: 'bold', marginTop: 15, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#CCC', paddingBottom: 5 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#FFF0F0', borderBottomWidth: 1, borderBottomColor: '#CCC', paddingVertical: 8, paddingHorizontal: 10, marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 8, paddingHorizontal: 10 },
  colAvaliador: { width: '70%', fontSize: 11, color: '#333' },
  colQuantidade: { width: '30%', fontSize: 11, color: '#333', textAlign: 'center', fontWeight: 'bold' },
  headerText: { fontSize: 11, color: '#E3000F', fontWeight: 'bold' },
  emptyState: { fontSize: 11, color: '#888', fontStyle: 'italic', padding: 15, textAlign: 'center' },
  colData: { width: '25%', fontSize: 11, color: '#333' },
  colHora: { width: '25%', fontSize: 11, color: '#333', textAlign: 'center' },
  colQtdDia: { width: '25%', fontSize: 11, color: '#333', textAlign: 'center', fontWeight: 'bold' }
});

export interface IAvaliadorCount {
    nome: string;
    quantidade: number;
}

export interface IResumoDia {
    data: string;
    primeiraTurma: string;
    ultimaTurma: string;
    candidatos: number;
}

interface PropsPDF {
    titulo: string;
    periodoDescritivo: string;
    dadosSGT?: IAvaliadorCount[];
    dadosSGE?: IAvaliadorCount[];
    resumoDiario?: IResumoDia[];
}

export const RelatorioAvaliadores = ({ titulo, periodoDescritivo, dadosSGT, dadosSGE, resumoDiario }: PropsPDF) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerTop}>
          <Image src="/assets/denso_logo.png" style={styles.logo} />
        </View>

        <View style={styles.body}>
          <Text style={styles.mainTitle}>{titulo}</Text>
          <Text style={styles.periodText}>{periodoDescritivo}</Text>

          {dadosSGT ? (
            <View>
              {dadosSGE ? <Text style={styles.sectionTitle}>SGT - TECNOLOGIA</Text> : null}
              <View style={styles.tableHeader}>
                <Text style={[styles.colAvaliador, styles.headerText]}>Avaliador</Text>
                <Text style={[styles.colQuantidade, styles.headerText]}>Candidatos Avaliados</Text>
              </View>
              {dadosSGT.length > 0 ? dadosSGT.map((av, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.colAvaliador}>{av.nome}</Text>
                  <Text style={styles.colQuantidade}>{String(av.quantidade)}</Text>
                </View>
              )) : (
                <Text style={styles.emptyState}>Nenhum registro encontrado para este período.</Text>
              )}
            </View>
          ) : null}

          {dadosSGE ? (
            <View style={{ marginTop: dadosSGT ? 30 : 0 }}>
              {dadosSGT ? <Text style={styles.sectionTitle}>SGE - EDUCAÇÃO</Text> : null}
              <View style={styles.tableHeader}>
                <Text style={[styles.colAvaliador, styles.headerText]}>Avaliador</Text>
                <Text style={[styles.colQuantidade, styles.headerText]}>Candidatos Avaliados</Text>
              </View>
              {dadosSGE.length > 0 ? dadosSGE.map((av, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.colAvaliador}>{av.nome}</Text>
                  <Text style={styles.colQuantidade}>{String(av.quantidade)}</Text>
                </View>
              )) : (
                <Text style={styles.emptyState}>Nenhum registro encontrado para este período.</Text>
              )}
            </View>
          ) : null}

          {resumoDiario ? (
            <View style={{ marginTop: 40 }}>
              <Text style={styles.sectionTitle}>RESUMO DIÁRIO</Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.colData, styles.headerText]}>Data</Text>
                <Text style={[styles.colHora, styles.headerText]}>Primeira Turma</Text>
                <Text style={[styles.colHora, styles.headerText]}>Última Turma</Text>
                <Text style={[styles.colQtdDia, styles.headerText]}>Candidatos Avaliados</Text>
              </View>
              {resumoDiario.length > 0 ? resumoDiario.map((dia, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.colData}>{String(dia.data || "-")}</Text>
                  <Text style={styles.colHora}>{String(dia.primeiraTurma || "-")}</Text>
                  <Text style={styles.colHora}>{String(dia.ultimaTurma || "-")}</Text>
                  <Text style={styles.colQtdDia}>{String(dia.candidatos || "0")}</Text>
                </View>
              )) : (
                <Text style={styles.emptyState}>Nenhum registro de turmas no período.</Text>
              )}
            </View>
          ) : null}

        </View>
      </Page>
    </Document>
  );
};
