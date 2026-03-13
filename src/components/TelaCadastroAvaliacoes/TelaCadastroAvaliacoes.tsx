import styles from "@/styles/TelaAvaliacoes.module.css";
import CardAvaliacao from "../CardAvaliacao/CardAvaliacao";
import { useState, useEffect } from "react";
import { tAvaliacao } from "@/utils/Types";

export default function TelaCadastroAvaliacoes(){
    const [avaliacoes, setAvaliacoes]=useState<tAvaliacao[]>([])
    const [nomeAvaliacao, setNomeAvaliacao]=useState('')
    const [dataAvaliacao, setDataAvaliacao]=useState('')

    useEffect(()=>{
        getAllAvaliacao()
    },[])

    const getAllAvaliacao=async()=>{
        const endpoint=`api/apiSelecionarCandidato?action=getAllAvaliacao`
        fetch(endpoint)
        .then(response=>response.json())
        .then(data=>{
            setAvaliacoes(data)
        })        
    }

    const registrarAvaliacao=async()=>{
        if(nomeAvaliacao==''||dataAvaliacao==''){
            alert('Preencha todos os campos!')
            return
        }
        const response = await fetch('/api/apiRegistrarAvaliacao', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            s_nome_avaliacao: `${nomeAvaliacao}`,
            dt_data_avaliacao: `${dataAvaliacao}`,
            action:'login'
            }),
        }); 
        if (response.ok) {
            const data = await response.json();
        } else {
            alert('Usuário ou Senha incorretos!')
            console.error('Login failed:', response.statusText);
        }
    }

    return(
        <div className={styles.telaAvaliacoes}>
            <div className={styles.colunaTelaAvaliacoes}>
                <div>Lista de avaliações</div>
                <div className={styles.listaTelaAvaliacoes}>
                    <div className={styles.titulosListaAvaliacoes}>
                        <div className={`${styles.coluna} ${styles.c1}`}>Id</div>
                        <div className={`${styles.coluna} ${styles.c2}`}>Avaliação</div>
                        <div className={`${styles.coluna} ${styles.c3}`}>Data</div>
                        <div className={`${styles.coluna} ${styles.c4}`}></div>
                    </div>
                    <div className={styles.dadosListaAvaliacoes}>
                        {avaliacoes.length>0&&avaliacoes.map((avaliacao:tAvaliacao)=>
                            <CardAvaliacao key={avaliacao.n_id_avaliacao} id={avaliacao.n_id_avaliacao} nome={avaliacao.s_nome_avaliacao} data={new Date(avaliacao.dt_data_avaliacao).toLocaleDateString('pt-BR')}/>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.colunaTelaAvaliacoes}>
                <div>Cadastro de nova avaliação</div>
                <div className={styles.formNovaAvaliacao}>
                    <div className={styles.formNovaAvaliacao_field}>
                        <label htmlFor="nome">Nome da avaliação</label>
                        <input type="text" name="nome" id="nome" value={nomeAvaliacao} onChange={(evt)=>setNomeAvaliacao(evt.target.value)}/>
                    </div>
                    <div className={styles.formNovaAvaliacao_field}>
                        <label htmlFor="data">Data da avaliação</label>
                        <input type="datetime-local" name="data" id="data" value={dataAvaliacao} onChange={(evt)=>setDataAvaliacao(evt.target.value)}/>
                    </div>
                    <div className={styles.formNovaAvaliacao_field}>
                        <button className="btnPadrao" onClick={()=>registrarAvaliacao()}>Cadastrar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}