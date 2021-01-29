import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { Country, SpecificCountry, Summary, User } from '../user.model';
import { ServiceService } from '../service.service';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color } from 'ng2-charts';
import { HttpClient } from '@angular/common/http';
import { CompletionObserver, Observable } from 'rxjs';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {
  name: string;
  nameCountry: string;
  summary: Summary;
  country: Country;
  activeCase: number;
  recoveryRate : string;
  mortalityRate: string;

  date: Date;
  latest_date: string | null;
  latest_date_7: string | null;
  url: string;

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
  url2: string;


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




  constructor(
  private route: ActivatedRoute,
  public covidService: ServiceService,
  //private location: Location,
  private http:HttpClient,
  public datepipe: DatePipe
  ) { 
    monkeyPatchChartJsTooltip();
      monkeyPatchChartJsLegend();
      this.getAllData();
  }

  ngOnInit(): void {

    this.name = this.route.snapshot.params['id'];
    
    this.date=new Date();

   


  }



  getAllData() {  
    this.covidService.getData().subscribe(  
      response => {  
        this.summary = response;
        
        for (let i in this.summary.Countries) {
              let x = this.summary.Countries[i];
              if (x.Slug == this.name)
              {
                
                this.nameCountry = this.summary.Countries[i].Country;
                this.country = this.covidService.addCountryToGoogle(this.summary.Countries[i]);

               

                this.activeCase = this.country.TotalConfirmed - this.country.TotalRecovered;
                this.recoveryRate = (this.country.TotalRecovered * 100 / this.country.TotalConfirmed).toFixed(2);
                this.mortalityRate = (this.country.TotalDeaths * 100 / this.country.TotalConfirmed).toFixed(2);
                this.pieChartData = [this.country.TotalDeaths , this.country.TotalRecovered, this.country.TotalConfirmed];
                
                this.date.setDate(this.date.getDate() - 1); 
                this.latest_date =this.datepipe.transform(this.date, 'YYYY-MM-dThh:mm:ss');
                this.date.setDate(this.date.getDate() + 1); 
                this.date.setDate(this.date.getDate() - 8); 
                this.latest_date_7 =this.datepipe.transform(this.date, 'YYYY-MM-d');
                this.latest_date = this.latest_date!.concat("Z");
                this.latest_date_7 = this.latest_date_7!.concat("T00:00:00Z");
                this.url = "https://api.covid19api.com/country/";
                this.url = this.url.concat(this.country.Slug,"?from=");
                this.url = this.url.concat(this.latest_date_7,"&to=", this.latest_date); 
               
                this.getAllDataCountries(this.url)

                this.url2 ="https://api.covid19api.com/total/dayone/country/";
                this.url2 = this.url2.concat(this.country.Slug);
                this.getAllDataDayOne(this.url2);
              }        
        }
      }  
    )  
  }


  getAllDataCountries(s:string) {
    this.covidService.getDataCountry(s).subscribe(
      responsegraph => {
        

        let tweekcases: Array<number>  = [];
        let tweekrecovered: Array<number> = [];
        let tweekdeaths: Array<number> = [];
        let tweekcases2: Array<number>  = [];
        let tweekrecovered2: Array<number> = [];
        let tweekdeaths2: Array<number> = [];
        let tweeklabel: Array<Label> = [];

        for(let i in responsegraph){
      
          tweekcases.push(responsegraph[i].Confirmed);
          tweekrecovered.push(responsegraph[i].Recovered);
          tweekdeaths.push(responsegraph[i].Deaths)
          tweeklabel.push(this.datepipe.transform(responsegraph[i].Date, 'd MMM')!); 
          
        }
        
        for(let j=0;j<8;j++){
          
          let tampon: number = tweekdeaths[j+1] - tweekdeaths[j];
          tweekdeaths2.push(tampon);

          tampon = tweekrecovered[j+1] - tweekrecovered[j];
          tweekrecovered2.push(tampon);

          tampon = tweekcases[j+1] - tweekcases[j];
          tweekcases2.push(tampon);
          //console.log(tampon);
        }
        
        this.barChartData = [
          { data: tweekdeaths2, label: 'Daily Deaths'},
          { data: tweekrecovered2, label: 'Daily Recovered'},
          { data: tweekcases2, label: 'Daily New Cases'}
        ];

        tweeklabel.shift();

        this.barChartLabels = tweeklabel;
       

      }
    )
  }

  getAllDataDayOne(s:string){
    this.covidService.getDataCountryDayOne(s).subscribe(
      responsegraph => {

        let tweekcases: Array<number>  = [];
        let tweekrecovered: Array<number> = [];
        let tweekdeaths: Array<number> = [];
        let tweeklabel: Array<Label> = [];

        for(let i in responsegraph){
      
          tweekcases.push(responsegraph[i].Confirmed);
          tweekrecovered.push(responsegraph[i].Recovered);
          tweekdeaths.push(responsegraph[i].Deaths)
          tweeklabel.push(this.datepipe.transform(responsegraph[i].Date, 'd MMM')!); 

        }

        this.lineChartData = [
          { data: tweekdeaths, label: 'Total Deaths'},
          { data: tweekrecovered, label: 'Total Recovered'},
          { data: tweekcases, label: 'Total Cases'}
        ];

        this.lineChartLabels = tweeklabel;

      })
  }




}
