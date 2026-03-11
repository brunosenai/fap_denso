export type tAvaliacao = {
    n_id_avaliacao:number
    n_id_candidato:number
    n_id_fap:number
    dt_data_avaliacao:string
    n_1id_avaliador:number
    n_2id_avaliador:number
    n_nota_avaliacao:number
    n_id_resultado:number
}

export type tCandidado={
    n_id_candidato:number
    s_nome_candidato:string
    s_cpf_candidato:string
    s_email_candidato:string
}

export type tCandidadoCard={
    s_nome_candidato:string
    s_email_candidato:string
}