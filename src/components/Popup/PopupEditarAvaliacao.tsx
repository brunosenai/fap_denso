import styles from "@/styles/PopupConfirmation.module.css";
import { useState, useEffect } from "react";
import Load from "../Load/Load";
import { tAvaliacao } from "@/utils/Types";

export interface PopupEditarAvaliacaoProps {
    avaliacao: tAvaliacao;
    comandoOK: () => void;
    comandoCancelar: () => void;
}

export default function PopupEditarAvaliacao(props: PopupEditarAvaliacaoProps) {
    const [nome, setNome] = useState("");
    const [data, setData] = useState("");
    const [load, setLoad] = useState(false);

    useEffect(() => {
        setNome(props.avaliacao.s_nome_avaliacao);
        const dt = new Date(props.avaliacao.dt_data_avaliacao);
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        const hh = String(dt.getHours()).padStart(2, '0');
        const min = String(dt.getMinutes()).padStart(2, '0');
        setData(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    }, [props.avaliacao]);

    const salvarEdicao = async () => {
        if (nome.trim() === "" || data.trim() === "") {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }
        
        setLoad(true);
        try {
            const endpoint = `/api/apiAvaliacao`;
            const res = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: 'editarAvaliacao',
                    id_avaliacao: props.avaliacao.n_id_avaliacao,
                    s_nome_avaliacao: nome,
                    dt_data_avaliacao: data,
                    apiKey: process.env.NEXT_PUBLIC_API_KEY
                })
            });
            
            if (res.status === 200) {
                props.comandoOK();
            } else {
                alert('Erro ao atualizar avaliação!');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao processar a avaliação!');
        } finally {
            setLoad(false);
        }
    };

    return (
        <>
            {load && <Load />}
            <div className={styles.popupFap}>
                <div className={styles.popupFap_conteudo}>
                    <div className={styles.popupFap_conteudo_titulo}>Editar Avaliação</div>
                    <div className={styles.popupFap_conteudo_corpo}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', width: '100%', marginTop: '10px'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                <label style={{fontWeight: 'bold', fontSize: '14px', color: '#000'}}>Nome Avaliação:</label>
                                <input 
                                    type="text"
                                    value={nome} 
                                    onChange={(e)=>setNome(e.target.value)} 
                                    style={{border: '1px solid #ccc', borderRadius: '5px', padding: '10px', outline: 'none', color: '#000', width: '100%'}}
                                />
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                <label style={{fontWeight: 'bold', fontSize: '14px', color: '#000'}}>Data e Hora:</label>
                                <input 
                                    type="datetime-local"
                                    value={data} 
                                    onChange={(e)=>setData(e.target.value)} 
                                    style={{border: '1px solid #ccc', borderRadius: '5px', padding: '10px', outline: 'none', color: '#000', width: '100%'}}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.popupFap_conteudo_rodape}>
                        <button title="cancelar" className={styles.popupFap_btnNao} onClick={props.comandoCancelar}>Cancelar</button>
                        <button title="salvar" className={styles.popupFap_btnSim} onClick={salvarEdicao}>Salvar</button>
                    </div>
                </div>
            </div>
        </>
    );
}
