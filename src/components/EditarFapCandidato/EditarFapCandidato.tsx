import styles from "@/styles/EditarFapCandidato.module.css"
import { tFap } from "@/utils/Types";
import { useState,useEffect } from "react";

export interface EditarFapCandidatoProps {
    comandoFechar: (f:boolean) => void;
    comandoSalvar: (q13:string,q14:string,q15:string,q16:string) => void;
    fapCandidato:tFap|undefined;
    nomeCandidato:string
}

export default function EditarFapCandidato(props:EditarFapCandidatoProps) {
    const [q13, setQ13] = useState<string>("");
    const [q14, setQ14] = useState<string>("");
    const [q15, setQ15] = useState<string>("");
    const [q16, setQ16] = useState<string>("");

    useEffect(()=>{
        setQ13(props.fapCandidato?.s_q13_fap || "");
        setQ14(props.fapCandidato?.s_q14_fap || "");
        setQ15(props.fapCandidato?.s_q15_fap || "");
        setQ16(props.fapCandidato?.s_q16_fap || "");
    },[])

    return (
        <div className={styles.editarFapCand}>
            <div className={styles.editarFapCand_conteudo}>
                <div className={styles.editarFapCand_conteudo_titulo}>
                    Editar Comentários da Fap
                </div>
                <div className={styles.editarFapCand_conteudo_corpo}>
                    <div className={styles.editarFapCand_conteudo_field}>
                        <div>Nome Candidato: {props.nomeCandidato}</div>
                    </div>
                    <div className={styles.editarFapCand_conteudo_field}>
                        <div>Segurança</div>
                        <input type="text" title="Segurança" value={q13} onChange={(evt)=>setQ13(evt.target.value)}/>
                    </div>
                    <div className={styles.editarFapCand_conteudo_field}>
                        <div>Qualidade</div>
                        <input type="text" title="Qualidade" value={q14} onChange={(evt)=>setQ14(evt.target.value)}/>
                    </div>
                    <div className={styles.editarFapCand_conteudo_field}>
                        <div>Produtividade</div>
                        <input type="text" title="Produtividade" value={q15} onChange={(evt)=>setQ15(evt.target.value)}/>
                    </div>
                    <div className={styles.editarFapCand_conteudo_field}>
                        <div>Comportamento</div>
                        <input type="text" title="Comportamento" value={q16} onChange={(evt)=>setQ16(evt.target.value)}/>
                    </div>
                </div>
                <div className={styles.editarFapCand_conteudo_rodape}>
                    <button className={styles.editarFapCand_btn} onClick={()=>props.comandoSalvar(q13,q14,q15,q16)}>salvar</button>
                    <button className={styles.editarFapCand_btn} onClick={()=>props.comandoFechar(false)}>fechar</button>
                </div>
            </div>
        </div>
    );
}