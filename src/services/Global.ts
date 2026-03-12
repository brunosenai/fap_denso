interface GlobalVars {
    n_id_pessoa:number|null;
    tokenTemporario:string;
}

// Criando o objeto (Singleton)
export const Global: GlobalVars = {
    n_id_pessoa:null,
    tokenTemporario:"",
}