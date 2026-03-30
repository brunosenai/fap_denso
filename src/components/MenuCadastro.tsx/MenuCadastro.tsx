import styles from '@/styles/MenuCadastro.module.css';
import { useState, useEffect } from 'react';

interface MenuCadastroProps {
    // menuSelected:number
    setMenuSelected:React.Dispatch<React.SetStateAction<number>>
}

export default function MenuCadastro(props:MenuCadastroProps){
    const [menuSelected,setMenuSelected]=useState<number>(1)

    useEffect(()=>{
        const menuSelectedStorage=localStorage.getItem('menuCadastroSelected')||'1'
        localStorage.setItem('menuCadastroSelected',menuSelectedStorage.toString())
        setMenuSelected(parseInt(menuSelectedStorage))
    },[])

    const clickMenu=(menu:number)=>{
        setMenuSelected(menu)
        props.setMenuSelected(menu)
        localStorage.setItem('menuCadastroSelected',menu.toString())
    }

    return(
        <div className={styles.menuCadastro}>
            <div className={`${styles.menuCadastroAba} ${menuSelected==1&&styles.menuCadastroAba_selecionada}`} onClick={()=>clickMenu(1)}>Avaliação</div>
            <div className={`${styles.menuCadastroAba} ${menuSelected==2&&styles.menuCadastroAba_selecionada}`} onClick={()=>clickMenu(2)}>Avaliador</div>
            <div className={`${styles.menuCadastroAba} ${menuSelected==3&&styles.menuCadastroAba_selecionada}`} onClick={()=>clickMenu(3)}>Candidato</div>
            <div className={`${styles.menuCadastroAba} ${menuSelected==4&&styles.menuCadastroAba_selecionada}`} onClick={()=>clickMenu(4)}>Candidato/Avaliação</div>
            <div className={`${styles.menuCadastroAba} ${styles.esconderMenu} ${menuSelected==5&&styles.menuCadastroAba_selecionada}`} onClick={()=>clickMenu(5)}>Dashboard</div>
        </div>
    )
}