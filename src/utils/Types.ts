export type tAvaliacao = {
    n_id_avaliacao:number
    s_nome_avaliacao:string
    dt_data_avaliacao:string
    n_status_avaliacao:number
}

export type tAvaliador={
    n_id_pessoa:number
    n_id_tipoPessoa:number
    s_nome_pessoa:string
    s_cpf_pessoa:string
    s_telefone_pessoa:string
    s_email_pessoa:string
    s_senha_pessoa:string
}

export type tCandidatoFap={
    n_id_candidato:number
    s_nome_candidato: string
    s_email_candidato: string
    s_cpf_candidato:string
    relatorios: []
    n_resultado_fap:number
}

export type tCandidato={
    n_id_candidato:number
    s_nome_candidato:string
    s_cpf_candidato:string
    s_email_candidato:string
}
export interface tcandidatoAvaliacao extends tCandidato{
    n_id_pessoa:number
}

export type tcandidatoCard={
    s_nome_candidato:string
    s_email_candidato:string
}

export type tFap={
    iAba:number
    n_id_avaliacao:number
    n_id_candidato:number
    n_id_pessoa:number
    n_status_fap:number
    dt_date_fap:string
    n_nota_fap:number
    n_resultado_fap:number
    n_posto1_fap:number
    n_posto2_fap:number
    n_posto3_fap:number
    n_posto4_fap:number
    n_posto5_fap:number
    n_posto6_fap:number
    n_q6_fap:number
    n_q7_fap:number
    n_q8_fap:number
    n_q9_fap:number
    n_q10_fap:number
    n_q11_fap:number
    n_q12_fap:number
    s_q13_fap:string
    s_q14_fap:string
    s_q15_fap:string
    s_q16_fap:string
    s_relatorio_fap:string  
}

export type tPessoa={
    n_id_pessoa:number,
    n_id_tipoPessoa:number,
    s_nome_pessoa:string,
    s_cpf_pessoa:string,
    s_telefone_pessoa:string,
    s_email_pessoa:string,
    s_senha_pessoa:string,
    s_codredef_pessoa:string

}

export type tInfoAva={
    infoAvaliacao:tAvaliacao[],
    infoCandidatos:tCandidatoFap[],
    infoAvaliadores:tPessoa[],
}