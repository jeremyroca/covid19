import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { Country, User } from './user.model';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private user!: User;
  private url: string = "https://api.covid19api.com/summary";

  constructor(private afAuth: AngularFireAuth, 
  private router: Router, private firestore: AngularFirestore, private http: HttpClient) {
    
   }

  async signInWithGoogle(){
    const credentials = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.user = {
      uid: credentials.user?.uid!,
      displayName: credentials.user?.displayName!,
      email: credentials.user?.email!
    };
    localStorage.setItem("user", JSON.stringify(this.user));
    this.updateUserData();
    this.router.navigate(["home"]);
  }

  private updateUserData(){
    this.firestore.collection("users").doc(this.user.uid).set({
      uid: this.user.uid,
      displayName: this.user.displayName,
      email: this.user.email
    }, {merge: true});
  }


  addCountryToGoogle(country : Country) : Country{

    this.firestore.collection("countries").doc(country.Slug).get().subscribe((doc) =>{
      if(doc.exists){

         
          let mArray: any[] = [];
          mArray.push(doc.data());
          if(mArray[0].newconfirmed != country.NewConfirmed ||
            mArray[0].totalconfirmed != country.TotalConfirmed ||
            mArray[0].newrecovered != country.NewRecovered ||
            mArray[0].totalrecovered != country.TotalRecovered ||
            mArray[0].newdeaths != country.NewDeaths ||
            mArray[0].totaldeaths != country.TotalDeaths){


              this.firestore.collection("countries").doc(country.Slug).set({
                name: country.Slug,
                totalconfirmed: country.TotalConfirmed,
                newconfirmed: country.NewConfirmed,
                totalrecovered: country.TotalRecovered,
                newrecovered: country.NewRecovered,
                totaldeaths: country.TotalDeaths,
                newdeaths: country.NewDeaths
              }, {merge:true});


            }
          
          
        

      }else{
        this.firestore.collection("countries").doc(country.Slug).set({
          name: country.Slug,
          totalconfirmed: country.TotalConfirmed,
          newconfirmed: country.NewConfirmed,
          totalrecovered: country.TotalRecovered,
          newrecovered: country.NewRecovered,
          totaldeaths: country.TotalDeaths,
          newdeaths: country.NewDeaths
        }, {merge:true});   
      }
    })

    
    
    
    return country;
  }


  getCountry(name: string) : Observable<unknown>{
    return this.firestore.collection("countries")
    .doc(name).valueChanges();

  }

 

  getUser(){
    if(this.user == null && this.userSignedIn()){
      this.user = JSON.parse(localStorage.getItem("user")!);
    }
    return this.user;
  }

  userSignedIn(): boolean{
    return JSON.parse(localStorage.getItem("user")!) != null
 }

 signOut(){
  this.afAuth.signOut();
  localStorage.removeItem("user");
  this.user = {} as any;
  this.router.navigate(["signin"]);
}


getData(): Observable<any> {  
  return this.http.get(this.url)  
    .pipe((response) => response);  
}


getDatagraph(): Observable<any> {
  return this.http.get("https://corona.lmao.ninja/v2/historical/all?lastdays=8")
  .pipe((responsegraph)=> responsegraph);
}


getDatagraph2(): Observable<any> {
  return this.http.get("https://corona.lmao.ninja/v2/historical/all")
  .pipe((responsegraph2)=> responsegraph2);
}


getDataCountry(s:string): Observable<any> {
  return this.http.get(s).pipe((responseCountry)=> responseCountry);
}

getDataCountryDayOne(s:string): Observable<any> {
  return this.http.get(s).pipe((responseCountry)=> responseCountry);
}





}
