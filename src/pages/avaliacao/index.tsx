import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Topo from "@/components/Topo/Topo";
import TopoSelecaoCandidato from "@/components/Topo/TopoSelecaoCandidato";
import { tAvaliacao } from "@/utils/Types";

export default function Avaliacao() {
  const router=useRouter()
  const [avaliacoes,setAvaliacoes]=useState<tAvaliacao[]>([])
  const [avaliacaoSelecionada,setAvaliacaoSelecionada]=useState<number>(0)

  useEffect(()=>{

  },[])

  const goto=(path:string)=>{
    router.push(path)
  }

  return (
    <div>
        <Topo titulo="Avaliação"/>
    </div>
  );
}
