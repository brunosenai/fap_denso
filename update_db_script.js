const mysql = require('mysql2/promise');

async function updateDB() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'root',
      database: 'fap_denso'
    });

    console.log('Connected to MySQL server.');

    // Add JSON column to config
    try {
      await connection.query('ALTER TABLE config ADD COLUMN j_config_fap JSON;');
      console.log('Added j_config_fap to config');
    } catch(e) { console.log('Column j_config_fap might already exist:', e.message); }

    // Add JSON column to fap
    try {
      await connection.query('ALTER TABLE fap ADD COLUMN j_respostas JSON;');
      console.log('Added j_respostas to fap');
    } catch(e) { console.log('Column j_respostas might already exist:', e.message); }

    // Insert default JSON config to initialize the UI
    const defaultFapConfig = {
      notaDeCorte: 13,
      postos: [
        { id: 1, nome: "Montagem 1", habilitado: true },
        { id: 2, nome: "Montagem 2", habilitado: true },
        { id: 3, nome: "Montagem 3", habilitado: true },
        { id: 4, nome: "Desmontagem 4", habilitado: true },
        { id: 5, nome: "Desmontagem 5", habilitado: true },
        { id: 6, nome: "Desmontagem 6", habilitado: true }
      ],
      questoes: [
        {
          id: 1,
          titulo: "CONDUÇÃO SEGURA DO CICLO (C2, C3, C4, C5, C8)",
          mediacao: "O candidato utiliza corretamente todos os EPI's obrigatórios e conduz o ciclo de trabalho de maneira segura...",
          evidencias: "EPIs colocados quando orientado...",
          tipo: "sn",
          peso: 1,
          eliminatoria: true,
          habilitada: true
        },
        {
          id: 2,
          titulo: "TRATAMENTO ADEQUADO DE NÃO CONFORMIDADE - STOP & CALL (C7, C10)",
          mediacao: "O candidato detectou corretamente eventuais não conformidades...",
          evidencias: "Analisa criticamente o processo...",
          tipo: "sn",
          peso: 1,
          eliminatoria: true,
          habilitada: true
        },
        {
          id: 3,
          titulo: "DISCIPLINA OPERACIONAL (C1, C9, C10)",
          mediacao: "O candidato segue a documentação padrão de montagem/desmontagem com rigor...",
          evidencias: "Segue a sequência passo a passo...",
          tipo: "num",
          peso: 1,
          eliminatoria: false,
          habilitada: true
        },
        {
          id: 4,
          titulo: "MONTAGEM CORRETA (C4, C5, C6)",
          mediacao: "O candidato realiza a correta montagem/desmontagem do subconjunto conforme especificação...",
          evidencias: "Encaixes perfeitos...",
          tipo: "num",
          peso: 1,
          eliminatoria: false,
          habilitada: true
        },
        {
          id: 5,
          titulo: "MANUTENÇÃO DO POSTO DE TRABALHO – 5S (C1, C3, C4)",
          mediacao: "O candidato mantém o posto organizado e funcional...",
          evidencias: "Ferramenta mantidas no local designado...",
          tipo: "num",
          peso: 1,
          eliminatoria: false,
          habilitada: true
        },
        {
          id: 6,
          titulo: "ACOMPANHAMENTO DO TAKT TIME (C6, C8, C9)",
          mediacao: "O candidato realiza ciclos de montagem dentro do takt time...",
          evidencias: "Deslocamentos laterais...",
          tipo: "num",
          peso: 1,
          eliminatoria: false,
          habilitada: true
        },
        {
          id: 7,
          titulo: "RESILIÊNCIA FÍSICA E MENTAL (C9, C11)",
          mediacao: "O candidato mantém foco, postura, constância e estabilidade emocional...",
          evidencias: "Constância de ritmo...",
          tipo: "num",
          peso: 1,
          eliminatoria: false,
          habilitada: true
        }
      ]
    };

    await connection.query('UPDATE config SET j_config_fap = ?', [JSON.stringify(defaultFapConfig)]);
    console.log('Updated config with default setup');

    await connection.end();
  } catch (err) {
    console.error('Error updating database:', err);
  }
}

updateDB();
