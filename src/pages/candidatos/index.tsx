import Topo from "@/components/Topo/Topo"
import styles from "@/styles/Candidatos.module.css"
import { tCandidadoCard } from "@/utils/Types"
import Image from "next/image"
import CardCandidatos from "@/components/CardCandidatos/CardCandidatos"
import { useState } from "react"

export default function Candidatos(){
    const [candidatos,setCandidatos]=useState<tCandidadoCard[]>([])
    const [nome,setNome]=useState<string>('')
    const [email,setEmail]=useState<string>('')

    const iniciar=()=>{

    }

    const addCandidato=()=>{
        if(nome!=='' && email!==''){
            setCandidatos([...candidatos,{s_nome_candidato:nome,s_email_candidato:email}])
            setNome('')
            setEmail('')
        }else{
            alert('Preencha os campos para adicionar um candidato')
        }
    }

    const removerCandidato=(index:number)=>{
        const novaLista=candidatos.filter((c,i)=>i!==index)
        setCandidatos(novaLista)
    }

    return(
        <div className='page'>
            <Topo />
            <main className='main'>
                <div className={styles.form}>
                    <h1 className={styles.titulo}>Adicionar Candidatos</h1>
                    <div className={styles.fieldFormColunas}>
                        <div className={styles.fieldFormCol}>
                            <label>Nome Candidato</label>
                            <input type="text" placeholder="Digite o nome do candidato" value={nome} onChange={(evt)=>setNome(evt.target.value)}/>
                        </div>
                        <div className={styles.fieldFormCol}>
                            <label>E-Mail Candidato</label>
                            <input type="text" placeholder="Digite o E-Mail do candidato" value={email} onChange={(evt)=>setEmail(evt.target.value)}/>
                        </div>
                    </div>
                    <div className={styles.fieldForm}>
                        <button className={styles.btnAdd} onClick={()=>addCandidato()}>Adicionar</button>
                    </div>
                    <div className={styles.fieldListaCandidatos}>
                        Candidatos adicionados para o teste
                        <div className={styles.listaCandidatos}>
                            {candidatos.length>0 && candidatos.map((c,i)=>
                                <CardCandidatos nome={c.s_nome_candidato} email={c.s_email_candidato} removerCandidato={()=>removerCandidato(i)}/>
                            )}
                        </div>
                    </div>
                    <div className={styles.fieldFormBotton}>
                        <button className='btnPadrao' onClick={()=>iniciar()}>Iniciar</button>
                    </div>
                </div>
            </main>
        </div>
    )
}