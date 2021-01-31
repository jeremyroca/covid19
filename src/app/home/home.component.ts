import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { addNews, Country, SpecificCountry, Summary, User } from '../user.model';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color } from 'ng2-charts';
import { DatePipe } from '@angular/common';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { sleep } from 'igniteui-angular-core';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  user!: User;
  addCountry: string;
  addDescription: string;
  summary: Summary;
  specificCountries: SpecificCountry;
  activeCase: number;
  recoveryRate : string;
  mortalityRate: string;
  
  pieChartOptions: ChartOptions={
    responsive: true,
  };
  pieChartLabels: Label[] = [['Dead Cases'], ['Recovered Cases'], ['Active Cases']];
  pieChartData: number[] = [];
   pieChartType: ChartType ='pie';
   pieChartLegend = true;
   pieChartPlugins = [];
   piechartColors=[
    {
      backgroundColor:['rgba(255,173,51,1)','rgba(128,252,145,1)','rgba(144,236,224,1)'],
  },
];
  date: Date;
  latest_date: string | null;
  latest_date_7: string | null;
  url: string;

  barChartOptions: ChartOptions = {
    responsive: true,
  };
  barChartLabels: Label[] = [];
  barChartType: ChartType ='bar';
  barChartLegend = true;
  barChartPlugins = [];
  barChartData: ChartDataSets[] = [   
  ];

  public barChartColors: Color[] = [
    { backgroundColor: 'rgba(255,173,51,1)' },
    { backgroundColor: 'rgba(128,252,145,1)' },
    {backgroundColor: 'rgba(144,236,224,1)'}
  ];


  //line chart variables
  lineChartData: ChartDataSets[] = [];
  lineChartLabels: Label[] = [];
  lineChartOptions={responsive:true};
  lineChartColor:Color[] = [
    { backgroundColor: 'rgba(255,173,51,0.68)', borderColor: 'black' },
    { backgroundColor: 'rgba(128,252,145,0.38)', borderColor: 'rgba(128,252,145,1)' },
    {backgroundColor: 'rgba(144,236,224,0.38)', borderColor: 'rgba(144,236,224,1)'}
  ];

  lineChartLegend=true;
  lineChartPlugins=[];
  lineChartType:ChartType='line';
  latest_date_30: string | null;

 

  



 

  constructor(public covidService: ServiceService, private http:HttpClient,public datepipe: DatePipe) {
      monkeyPatchChartJsTooltip();
      monkeyPatchChartJsLegend();
  }

  ngOnInit(): void {
    this.user= this.covidService.getUser();
    this.getAllData();
    this.getAllDatagraph();
    this.getAllDatagraph2();
    
    

    this.date=new Date();


     this.latest_date =this.datepipe.transform(this.date, 'YYYY-MM-dThh:mm:ss');
     this.date.setDate(this.date.getDate() - 7); 
     this.latest_date_7 =this.datepipe.transform(this.date, 'YYYY-MM-d');
     this.latest_date = this.latest_date!.concat("Z");
     this.latest_date_7 = this.latest_date_7!.concat("T00:00:00Z");
     this.url = "https://api.covid19api.com/world?from=";
     this.url = this.url.concat(this.latest_date_7,"&to=", this.latest_date); //url for worlwidegraph

     var array: Array<string> = [];
     for(let i =0;i<6;i++){
       var dated = this.datepipe.transform(this.date, "d MMM");
       array.push(dated!);
       this.date.setDate(this.date.getDate()+1);
     }
     
    array.push(this.datepipe.transform(this.date, "d MMM")!);
     this.barChartLabels = array;

     var array2: Array<string> = [];
     this.date.setDate(this.date.getDate() - 29);
     this.latest_date_30=this.datepipe.transform(this.date, 'YYYY-MM-d');
     for(let i =0;i<29;i++){
      var dated = this.datepipe.transform(this.date, "d MMM");
      array2.push(dated!);
      this.date.setDate(this.date.getDate()+1);
    }
    array2.push(this.datepipe.transform(this.date, "d MMM")!);
    this.lineChartLabels = array2;


    
    
  }

  getAllDatagraph(){
    this.covidService.getDatagraph().subscribe(
      responsegraph => {
       
        let tweekcases: Array<number>  = Object.values(responsegraph["cases"]);
        let tweekrecovered: Array<number> = Object.values(responsegraph["recovered"]);
        let tweekdeaths: Array<number>  = Object.values(responsegraph["deaths"]);
        
        let tweekcases2: Array<number>  = []
        let tweekrecovered2: Array<number> = [];
        let tweekdeaths2: Array<number> = []


        for(let i =0; i<7; i++){
          let tampon: number = tweekcases[i+1] - tweekcases[i];
          tweekcases2.push(tampon);
          tampon = tweekrecovered[i+1] - tweekrecovered[i];
          tweekrecovered2.push(tampon);
          tampon = tweekdeaths[i+1] - tweekdeaths[i];
          tweekdeaths2.push(tampon);

        }
     
        this.barChartData = [
          { data: tweekdeaths2, label: 'Daily Deaths'},
          { data: tweekrecovered2, label: 'Daily Recovered'},
          { data: tweekcases2, label: 'Daily New Cases'}
        ];
        
      }
    )
  }


  getAllDatagraph2(){
    this.covidService.getDatagraph2().subscribe(
      responsegraph2 => {

        let tworldcases: Array<number>  = Object.values(responsegraph2["cases"]);
        let tworldrecovered: Array<number> = Object.values(responsegraph2["recovered"]);
        let tworlddeaths: Array<number>  = Object.values(responsegraph2["deaths"]);
        let tworldlabel: Array<Label>  = Object.keys(responsegraph2["deaths"]);
        
        //this.lineChartLabels = tworldlabel;

        this.lineChartData = [
          { data: tworlddeaths, label: 'Total Deaths last 30 days'},
          { data: tworldrecovered, label: 'Total Recovered last 30 days'},
          { data: tworldcases, label: 'Total Cases last 30 days'}
        ];

      }
    )

  }


  getAllData() {  
    this.covidService.getData().subscribe(  
      response => {  
        this.summary = response;
        this.activeCase = this.summary?.Global?.TotalConfirmed - this.summary?.Global?.TotalRecovered;
        this.recoveryRate = (this.summary.Global.TotalRecovered * 100 / this.summary.Global.TotalConfirmed).toFixed(2);
        this.mortalityRate = (this.summary.Global.TotalDeaths * 100 / this.summary.Global.TotalConfirmed).toFixed(2);
        this.pieChartData = [this.summary.Global.TotalDeaths , this.summary.Global.TotalRecovered, this.summary.Global.TotalConfirmed];
        
      
      
        var test: Array<Country> = [];
        for (let i in this.summary.Countries) {
              let x = this.summary.Countries[i];
              test.push(x);
              //console.log(x);
          
      }
      //console.log(test);

      
    
      
      }  
    )  
  }


  addNews(){
    let news: addNews = {
      Country : this.addCountry,
      Description: this.addDescription
    };
    console.log(this.addCountry);
    console.log(this.addDescription);
    //this.covidService.addNews(news);
    sleep(2000);
    this.addDescription = undefined as any;
    this.addCountry = undefined as any;

  }
  
  
  getSortedData(s :number) {  
    
    if(s==1){
      this.summary.Countries = this.summary.Countries.sort((a, b) => (a.NewConfirmed < b.NewConfirmed ? -1 : 1));
    }else if(s==2){
      this.summary.Countries = this.summary.Countries.sort((a, b) => (a.TotalConfirmed < b.TotalConfirmed ? -1 : 1));
    }else if(s==3){
      this.summary.Countries = this.summary.Countries.sort((a, b) => (a.NewRecovered < b.NewRecovered ? -1 : 1));
    }else if(s==4){
      this.summary.Countries = this.summary.Countries.sort((a, b) => (a.TotalRecovered < b.TotalRecovered ? -1 : 1));
    }else if(s==5){
      this.summary.Countries = this.summary.Countries.sort((a, b) => (a.NewDeaths < b.NewDeaths ? -1 : 1));
    }else if(s==6){
      this.summary.Countries = this.summary.Countries.sort((a, b) => (a.TotalDeaths < b.TotalDeaths ? -1 : 1));
    }else{
      this.summary.Countries = this.summary.Countries.sort((a,b)=>(a.Slug < b.Slug ? -1 : 1));
    }  
  } 


  getInvSortedData(s :number) {  
    
    if(s==1){
      this.summary.Countries = this.summary.Countries.sort((a, b) => (a.NewConfirmed < b.NewConfirmed ? 1 : -1));
    }else if(s==2){
      this.summary.Countries = this.summary.Countries.sort((a, b) => (a.TotalConfirmed < b.TotalConfirmed ? 1 : -1));
    }else if(s==3){
      this.summary.Countries = this.summary.Countries.sort((a, b) => (a.NewRecovered < b.NewRecovered ? 1 : -1));
    }else if(s==4){
      this.summary.Countries = this.summary.Countries.sort((a, b) => (a.TotalRecovered < b.TotalRecovered ? 1 : -1));
    }else if(s==5){
      this.summary.Countries = this.summary.Countries.sort((a, b) => (a.NewDeaths < b.NewDeaths ? 1 : -1));
    }else if(s==6){
      this.summary.Countries = this.summary.Countries.sort((a, b) => (a.TotalDeaths < b.TotalDeaths ? 1 : -1));
    }else{
      this.summary.Countries = this.summary.Countries.sort((a,b)=>(a.Slug < b.Slug ? 1 : -1));
    }
  } 





}
