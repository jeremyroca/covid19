export interface User {
    uid: string;
    displayName: string;
    email: string;
}

export class Summary {  
    Global: Global;  
    Countries: Array<Country>;  
    Date: Date;  
}

export class Global {  
    NewConfirmed: number;  
    NewDeaths: number;  
    NewRecovered: number;  
    TotalConfirmed: number;  
    TotalDeaths: number;  
    TotalRecovered: number  
}  
  
export class Country extends Global {
    Country: string;  
    CountryCode: string;  
    Date: Date;  
    Slug: string;
    ID: string;
  
    
} 


export class SpecificCountry {
    Country:string;
    Date:Date;
    Deaths:number;
    Confirmed:number;
    Recovered:number;
}