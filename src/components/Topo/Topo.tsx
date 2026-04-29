import Image from "next/image"
import styles from "@/styles/Topo.module.css"
import { useEffect,useState } from "react";
import router from "next/router";

interface TopoProps {
    titulo?: string;
}

export default function Topo({ titulo = "" }: TopoProps){
    const [userType, setUserType] = useState<number>(-1)

    useEffect(()=>{
        getAtualUserType()
    },[])

    const getAtualUserType=()=>{
        try{
            const endpoint=`/api/apiPessoa?action=getAtualUserType&n_id_pessoa=${localStorage.getItem('n_id_pessoa')}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;
            fetch(endpoint,{
                method:'GET'
            })
            .then(res=>res.json())
            .then(data=>{
                if(data.length>0){
                    setUserType(data[0].n_id_tipoPessoa)
                }else{
                    setUserType(-1)
                }
            })
        }catch(e){
            console.error(`Erro:${e}`)
        }
    }

    const sair=async()=>{
        await fetch('/api/apiLogout');
        localStorage.removeItem('n_id_pessoa');
        localStorage.removeItem('menuCadastroSelected');
        localStorage.removeItem('modo');
        localStorage.removeItem('n_id_avaliacao');
        localStorage.removeItem('candidatos');
        localStorage.clear
        router.replace('/');
    }

    const config=async()=>{
        router.push('/configuracao');
    }

    return(
        <div className={styles.topo}>
            <div className={styles.topoImages}>
                <Image className={styles.logoStellantis} src={'/assets/logo-stellantis-branco.png'} alt={'Logo Stellantis'} width={230} height={-1} />
                <div className={styles.areaDireira}>
                    <Image className={styles.topoCentro40} src={'/assets/logo-centro-branco.png'} alt={'Logo Stellantis'} width={60} height={-1} />
                    {userType!=2&&
                        <div className={styles.logoutIcon}>
                            <Image  src={'/assets/icons/arrow_back_w.svg'} alt={'Logo Stellantis'} onClick={()=>router.back()} width={30} height={-1} />
                            voltar
                        </div>                
                    }
                    <div className={styles.logoutIcon}>
                        <Image  src={'/assets/icons/settings_w.svg'} alt={'Logo Stellantis'} onClick={()=>config()} width={30} height={-1} />
                        Config
                    </div>
                    <div className={styles.logoutIcon}>
                        <Image  src={'/assets/icons/logout_w.svg'} alt={'Logo Stellantis'} onClick={()=>sair()} width={30} height={-1} />
                        SAIR
                    </div>
                </div>
            </div>
            <div className={styles.topoTitulo}>
                {titulo}
            </div>
        </div>
    )
}