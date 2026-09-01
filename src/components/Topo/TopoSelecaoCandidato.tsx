import Image from "next/image"
import styles from "@/styles/TopoSelecaoCandidato.module.css"
import { DensoLogo } from "@/components/DensoLogo";

export default function TopoSelecaoCandidato(){
    return(
        <div className={styles.topo}>
            <div className={styles.topoLogos}>
                <DensoLogo fillColor="white" width={473} />
                <Image src={'/assets/logo-centro-branco.png'} alt={'Logo Denso'} width={152} height={152} />
            </div>
            <div className={styles.topoSelecaoCandidato}>
                <div className={styles.titulo}>seleção de candidatos</div>
                <div className={styles.fieldSelect}>
                    <label htmlFor="selecao">Selecione a avaliação</label>
                    <select name="selecao" id="selecao">
                        <option value={''}>Selecione a avaliação</option>
                    </select>
                </div>
            </div>
        </div>
    )
}