import Image from "next/image"
import styles from "@/styles/TopoSelecaoAvaliacao.module.css"
import { tAvaliacao } from "@/utils/Types";

interface TopoSelecaoAvaliacaoProps{
    setAvaliacao:(avaliacao:number)=>void
    avaliacoes:tAvaliacao[]
    //setQtdAvaliadores:React.Dispatch<React.SetStateAction<number>>
    setQtdAvaliadores:(dtq:number)=>void
    qtdAvaliadores:number
    setMostrarTelaTrazerCandidato:(b:boolean)=>void
    setMostrarTelaMovimentacaoAvancada:(b:boolean)=>void
    finalizarAvaliacao:()=>void
    nomeAvaliador:string
    incluirPassadas?: boolean
    onTogglePassadas?: (v: boolean) => void
}

export default function TopoSelecaoAvaliacao(props:TopoSelecaoAvaliacaoProps){
    return(
        <div className={styles.topo}>
            <div className={styles.topoLogos}>
                <Image src={'/assets/logo-stellantis-branco.png'} alt={'Logo Stellantis'} width={200} height={-1} />
                <div>
                    <Image src={'/assets/logo-centro-branco.png'} alt={'Logo Stellantis'} width={75} height={-1} />
                    {/* <Image src={'/assets/icons/fullscreen_w.svg'} alt={'Fullscreen'} width={50} height={-1} /> */}
                </div>
            </div>
            <div className={styles.topoSelecaoCandidato}>
                <div className={styles.areaTitulo}>
                    <div className={styles.titulo}>seleção de avaliação</div>
                    <div className={styles.avaliador}>{props.nomeAvaliador}</div>
                </div>
                <div className={styles.selects}>
                    {props.onTogglePassadas && (
                        <div className={styles.fieldSelect_toggle}>
                            <label className={styles.toggleContainer} title="Mostrar avaliações de datas passadas ainda não enviadas">
                                <span className={styles.toggleText}>Passadas</span>
                                <span className={styles.switch}>
                                    <input 
                                        type="checkbox" 
                                        checked={props.incluirPassadas || false} 
                                        onChange={(e) => props.onTogglePassadas && props.onTogglePassadas(e.target.checked)} 
                                    />
                                    <span className={styles.slider}></span>
                                </span>
                            </label>
                        </div>
                    )}
                    <div className={styles.fieldSelect_c1}>
                        <label className={styles.label} htmlFor="selecao">Selecione a avaliação</label>
                        <select className={styles.fieldForm} name="selecao" id="selecao" onChange={(evt)=>props.setAvaliacao(Number(evt.target.value))}>
                            <option value={-1}>Selecione a avaliação</option>
                            {props.avaliacoes.length>0 && props.avaliacoes.map((item,index) => {
                                let dataFormatada = "";
                                if (item.dt_data_avaliacao) {
                                    const d = new Date(item.dt_data_avaliacao);
                                    if (!isNaN(d.getTime())) {
                                        dataFormatada = ` (${d.toLocaleDateString("pt-BR")})`;
                                    }
                                }
                                return (
                                    <option key={index} value={item.n_id_avaliacao}>
                                        {item.s_nome_avaliacao}{dataFormatada}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className={styles.fieldSelect_c2}>
                        <button className={styles.btnPadrao} onClick={()=>props.setMostrarTelaTrazerCandidato(true)} title="Trazer Candidato de outra avaliação">
                            <Image src={'/assets/icons/transfer.svg'} alt={'Trazer Candidato de outra avaliação'} width={20} height={-1} />
                        </button>
                    </div>
                    <div className={styles.fieldSelect_c2}>
                        <button className={styles.btnPadrao} onClick={()=>props.setMostrarTelaMovimentacaoAvancada(true)} title="Gerenciar Avaliação">
                            <Image src={'/assets/icons/edit_square.svg'} alt={'Gerenciar Avaliação'} width={20} height={-1} />
                        </button>
                    </div>
                    <div className={styles.fieldSelect_c2}>
                        <button className={styles.btnFinalizar} onClick={()=>props.finalizarAvaliacao()} title="Finalizar Avaliação">
                            <Image src={'/assets/icons/flag_check.svg'} alt={'Finalizar Avaliação'} width={20} height={-1} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}