import Image from "next/image"
import styles from "@/styles/TopoSelecaoAvaliacao.module.css"
import { tAvaliacao } from "@/utils/Types";

interface TopoSelecaoAvaliacaoProps{
    setAvaliacao:(avaliacao:number)=>void
    avaliacoes:tAvaliacao[]
}

export default function TopoSelecaoAvaliacao(props:TopoSelecaoAvaliacaoProps){
    return(
        <div className={styles.topo}>
            <div className={styles.topoLogos}>
                <Image src={'/assets/logo-stellantis-branco.png'} alt={'Logo Stellantis'} width={473} height={102} />
                <Image src={'/assets/logo-centro-branco.png'} alt={'Logo Stellantis'} width={152} height={152} />
            </div>
            <div className={styles.topoSelecaoCandidato}>
                <div className={styles.titulo}>seleção de avaliação</div>
                <div className={styles.fieldSelect}>
                    <label htmlFor="selecao">Selecione a avaliação</label>
                    <select name="selecao" id="selecao" onChange={(evt)=>props.setAvaliacao(Number(evt.target.value))}>
                        <option value={-1}>Selecione a avaliação</option>
                        {props.avaliacoes.length>0 && props.avaliacoes.map((item,index)=>
                            <option key={index} value={item.n_id_avaliacao}>{item.s_nome_avaliacao}</option>
                        )}
                    </select>
                </div>
            </div>
        </div>
    )
}