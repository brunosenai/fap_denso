// import CryptoJS from "crypto-js";
// import pool from "@/components/Banco/Banco";

export const verifyIsTablet=()=>{
  const userAgent = navigator.userAgent.toLowerCase();
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
  localStorage.setItem('isTablet',isTablet.toString())
  return isTablet
}

export const formatDateToText = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
  
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
  
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC"
    }).format(date);
};

export const formatDateToText_onlyDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
  
    if (isNaN(date.getTime())) {
      return "Data inválida";
    } 
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
};
  
export const formatForDatetToTimeInput = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
  
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
  
    const pad = (num: number) => num.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // getMonth() retorna de 0 a 11
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// export const generateToken = () => {
//     const currentTimestamp = new Date();
//     const expiresTimestamp = new Date(currentTimestamp.getTime() + 24 * 60 * 60 * 1000); // +24h
//     const tokenBase = `${expiresTimestamp}-username-ccoil`;
//     const token = CryptoJS.AES.encrypt(JSON.stringify(tokenBase), secretKey).toString();
//     return token;
// }

export const timeStampNow_js_to_mysql = (): number => {
    return Math.floor(Date.now() / 1000)
}

export const timeStamp_mysql_to_js = (ts_mysql: number): number => {
    return ts_mysql * 1000;
}

export const timeStamp_mysql_validade = (ts_mysql: number, moreTimeSeconds: number): number => {
    return ts_mysql + moreTimeSeconds;
}

export const dateTimeMySQL_to_timestampMySQL = (dateTimeMysql: string): number => {
    const date = new Date(dateTimeMysql.replace(" ", "T") + "Z");
    return Math.floor(date.getTime() / 1000);
}