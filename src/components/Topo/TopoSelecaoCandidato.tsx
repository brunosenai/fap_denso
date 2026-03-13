import Image from "next/image"
import styles from "@/styles/TopoSelecaoCandidato.module.css"

export default function TopoSelecaoCandidato(){
    return(
        <div className={styles.topo}>
            <div className={styles.topoLogos}>
                <Image src={'/assets/logo-stellantis-branco.png'} alt={'Logo Stellantis'} width={473} height={102} />
                <Image src={'/assets/logo-centro-branco.png'} alt={'Logo Stellantis'} width={152} height={152} />
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