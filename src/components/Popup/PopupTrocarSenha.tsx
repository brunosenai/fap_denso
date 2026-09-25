import styles from "@/styles/PopupTrocarSenha.module.css"
import Image from "next/image"
import { useState } from "react"
import Load from "../Load/Load"

export interface PopupTrocarSenhaProps{
    email: string;
    comandoOK: () => void;
    comandoCancelar: () => void;
}

export default function PopupTrocarSenha(props:PopupTrocarSenhaProps){
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [load, setLoad] = useState(false)
    const [tipoCampo1, setTipoCampo1] = useState('password')
    const [tipoCampo2, setTipoCampo2] = useState('password')

    const trocarSenha = async () => {
        if(novaSenha === '' || confirmarSenha === ''){
            alert('Preencha os campos de senha')
            return
        }
        if(novaSenha !== confirmarSenha){
            alert('As senhas não coincidem')
            return
        }
        setLoad(true)
        try {
            const res = await fetch(`/api/apiLogin`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: 'trocarSenha',
                    email: props.email,
                    password: novaSenha,
                    apiKey: process.env.NEXT_PUBLIC_API_KEY
                })
            })
            if (res.status === 200) {
                alert('Senha alterada com sucesso!')
                props.comandoOK()
            } else {
                alert('Erro ao alterar senha')
            }
        } catch (error) {
            console.error(error)
            alert('Erro de conexão ao alterar senha')
        } finally {
            setLoad(false)
        }
    }

    return(
        <>
            {load && <Load />}
            <div className={styles.popupFap}>
                <div className={styles.popupFap_conteudo}>
                    <div className={styles.popupFap_conteudo_titulo}>Trocar Senha</div>
                    <div className={styles.popupFap_conteudo_corpo}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', width: '100%'}}>
                            <label style={{fontWeight: 'bold', fontSize: '14px', color: '#000'}}>Nova Senha:</label>
                            <div style={{display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '5px', padding: '0 5px'}}>
                                <input 
                                    type={tipoCampo1} 
                                    value={novaSenha} 
                                    onChange={(e)=>setNovaSenha(e.target.value)} 
                                    style={{flex: 1, border: 'none', padding: '10px', outline: 'none', color: '#000'}}
                                    placeholder="Digite a nova senha"
                                />
                                <Image 
                                    src={tipoCampo1=='password'?'/assets/icons/visibility_off_b.svg':'/assets/icons/visibility_on_b.svg'} 
                                    alt="Mostrar" width={25} height={25} 
                                    style={{cursor: 'pointer'}}
                                    onClick={() => setTipoCampo1(tipoCampo1 === 'password' ? 'text' : 'password')}
                                />
                            </div>
                            <label style={{fontWeight: 'bold', fontSize: '14px', color: '#000'}}>Confirmar Nova Senha:</label>
                            <div style={{display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '5px', padding: '0 5px'}}>
                                <input 
                                    type={tipoCampo2} 
                                    value={confirmarSenha} 
                                    onChange={(e)=>setConfirmarSenha(e.target.value)} 
                                    style={{flex: 1, border: 'none', padding: '10px', outline: 'none', color: '#000'}}
                                    placeholder="Redigite a nova senha"
                                />
                                <Image 
                                    src={tipoCampo2=='password'?'/assets/icons/visibility_off_b.svg':'/assets/icons/visibility_on_b.svg'} 
                                    alt="Mostrar" width={25} height={25} 
                                    style={{cursor: 'pointer'}}
                                    onClick={() => setTipoCampo2(tipoCampo2 === 'password' ? 'text' : 'password')}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.popupFap_conteudo_rodape}>
                        <div className={styles.popupFap_btnSim} onClick={trocarSenha}>Salvar</div>
                        <div className={styles.popupFap_btnNao} onClick={props.comandoCancelar}>Cancelar</div>
                    </div>
                </div>
            </div>
        </>
    )
}
