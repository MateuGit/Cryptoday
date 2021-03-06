import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Chart } from 'chart.js';
import { cardObject } from './cardObject.model';
import { ChartService } from '../chart.service';


@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  chart;
  graphicChart:Chart;
  cryptoCurrencies:any;
  coins:any;
  subscription: Subscription;
  currencySubscription: Subscription;
  cryptoCurrencySubscription: Subscription;
  counter:number;
  card:cardObject;
  currency:string;
  cryptoCurrency:string;
  interval;
  graphicChartBitcoinNow:Chart;
  graphicChartEthereumNow:Chart;


  constructor(private dataService:DataService, private chartService: ChartService) { 
    this.currencySubscription = chartService.updateCurrency$.subscribe(
      currency => {
        this.currency = currency;
        this.loadCard();
    });

    this.cryptoCurrencySubscription = chartService.updateCrypto$.subscribe(
      cryptoCurrency => {
        this.cryptoCurrency = cryptoCurrency;
        this.loadCard();
    });

    this.chart = [];
    this.coins = this.dataService.GetCoins();
    this.card = new cardObject();
    this.counter = 0;
    this.currency = "USD";
    this.cryptoCurrency = "BTC";
    
  }

  ngOnInit(): void {
    this.loadCard();
  }

  loadCard() {
    this.getCardInformation(this.cryptoCurrency, this.currency);
    this.showCryptocurrenciesGraphic(this.cryptoCurrency, this.currency);
  }

  reloadCanvas(){
    var node = document.getElementById('chart');
    node.querySelectorAll('*').forEach(n => n.remove());
    var newCanvas = document.createElement('canvas');
    newCanvas.setAttribute("id", "chart-canvas");
    node.appendChild(newCanvas);
  }

  checkCardVariation(variation:string){
    let check = false;

    if(this.card.variation){ 
      if( this.card.variation.charAt(0)=='-')
        check = true;
    }

    return check;
  }

  getCardInformation(cryptoCurrencyName:string, currency:string){
    
    if(this.subscription)
      this.subscription.unsubscribe();

    this.subscription = timer(0, 10000).pipe(
      switchMap(() => this.dataService.GetTopListCoins(currency))
    ).subscribe((res) => {

      let allRegisters:Array<any> = res.Data;

      allRegisters.forEach((res) => {
        
        let name = res['CoinInfo']['Name'];

        if(name == cryptoCurrencyName){

          let price = res['DISPLAY'][currency]['PRICE'];
          let variation = res['DISPLAY'][currency]['CHANGEPCT24HOUR'];
          let image = res['CoinInfo']['ImageUrl'];
          let mktCap = res['DISPLAY'][currency]['MKTCAP'];
          let circSply = res['DISPLAY'][currency]['SUPPLY'];
          let allDayVol = res['DISPLAY'][currency]['TOTALVOLUME24HTO'];
          let dayHigh = res['DISPLAY'][currency]['HIGH24HOUR'];
          let dayLow = res['DISPLAY'][currency]['LOW24HOUR'];

          this.card = new cardObject(name, mktCap, circSply, allDayVol, dayHigh, dayLow, "https://www.cryptocompare.com" + image, price, variation);
        }

      });
      
    });
  }  

  showCryptocurrenciesGraphic(cryptoCurrency:string, currency:string){
    var activeElement:any = document.getElementsByClassName("active").item(0);

    switch (activeElement.id) {
      case "hour":
        this.showCryptocurrenciesGraphicHour(cryptoCurrency, currency);
        break;
      case "day":
        this.showCryptocurrenciesGraphicDay(cryptoCurrency, currency);
        break;
      case "week":
        this.showCryptocurrenciesGraphicWeek(cryptoCurrency, currency);
        break;
      case "month":
        this.showCryptocurrenciesGraphicMonth(cryptoCurrency, currency);
        break;
      case "year":
        this.showCryptocurrenciesGraphicYear(cryptoCurrency, currency);
        break;
    }
  }

  showCryptocurrenciesGraphicWeek(cryptoCurrency:string, currency:string){

    if(this.interval)
      clearInterval(this.interval);

    this.reloadCanvas();
    this.dataService.GetRegisterWeek(cryptoCurrency, currency).then((res) => {

      let allRegisters = res.Data.Data;
      let allDates = [];
      let allAverageQuotization = [];
      let allMinimumQuotization = [];
      let allMaximumQuotization = [];

      allRegisters.forEach((res) => {
        let jsDate = new Date(res.time * 1000);

        allDates.push(jsDate.toLocaleDateString('en', {month:'long', day:'numeric'}));

        allAverageQuotization.push( (((res.high + res.low) / 2).toFixed(2)) );
        allMinimumQuotization.push((res.low).toFixed(2));
        allMaximumQuotization.push((res.high).toFixed(2));
      });

      let currencyInfo = this.coins.find(element => element.id == currency);

      this.graphicChart = new Chart('chart-canvas', {
        type: 'line',
        data: {
          labels: allDates,
          datasets: [
            {
              label:"Average",
              data: allAverageQuotization,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true
            },
            {
              type:'bar',
              label: 'Minimum',
              data: allMinimumQuotization,
              borderColor: 'rgba(0, 0, 0, 0)',
              backgroundColor: 'rgba(192, 75, 192, 0.5)',
              fill: false
            },
            {
              type:'bar',
              label:'Maximum',
              data: allMaximumQuotization,
              borderColor: 'rgba(231, 208, 29, 0.77)',
              backgroundColor: 'rgba(231, 208, 29, 0.77)',
              fill: false
            }
          ]
        },
        options: {
          legend: {
            display: true
          },
          scales: {
            xAxes: [{
              display: true
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: (currencyInfo.name + '(' +currencyInfo.id + ')')
              }
            }]
          }
        }
      });
    });
  }

  showCryptocurrenciesGraphicDay(cryptoCurrency:string, currency:string){

    if(this.interval)
      clearInterval(this.interval);

    this.reloadCanvas();
    this.dataService.GetRegisterDay(cryptoCurrency, currency).then((res) => {

      let allRegisters = res.Data.Data;
      let allDates = [];
      let allAverageQuotization = [];
      let allMinimumQuotization = [];
      let allMaximumQuotization = [];
      let counter = 0;

      allRegisters.forEach((res) => {
        let jsDate = new Date(res.time * 1000);

        if(counter == 3){

          allDates.push(jsDate.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}));
  
          allAverageQuotization.push( (((res.high + res.low) / 2).toFixed(2)) );
          allMinimumQuotization.push((res.low).toFixed(2));
          allMaximumQuotization.push((res.high).toFixed(2));

          counter = 0
        }
        counter++;
      });

      let currencyInfo = this.coins.find(element => element.id == currency);

      this.graphicChart = new Chart('chart-canvas', {
        type: 'line',
        data: {
          labels: allDates,
          datasets: [
            {
              label:"Average",
              data: allAverageQuotization,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true
            },
            {
              type:'bar',
              label: 'Minimum',
              data: allMinimumQuotization,
              borderColor: 'rgba(0, 0, 0, 0)',
              backgroundColor: 'rgba(192, 75, 192, 0.5)',
              fill: false
            },
            {
              type:'bar',
              label:'Maximum',
              data: allMaximumQuotization,
              borderColor: 'rgba(231, 208, 29, 0.77)',
              backgroundColor: 'rgba(231, 208, 29, 0.77)',
              fill: false
            }
          ]
        },
        options: {
          legend: {
            display: true
          },
          scales: {
            xAxes: [{
              display: true
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: (currencyInfo.name + '(' +currencyInfo.id + ')')
              }
            }]
          }
        }
      });
    });

    this.interval = setInterval(() => {
      this.updateDayGraphic(this.graphicChart, cryptoCurrency, currency);
    }, 3600000);
  }

  updateDayGraphic(chart:Chart ,cryptoCurrency:string, currency:string){

    this.dataService.GetRegisterDay(cryptoCurrency, currency).then((res) => {

      let allRegisters:Array<any> = res.Data.Data;

      let lastRegisterTime = allRegisters[allRegisters.length-1]['time'];
      let lastRegisterHigh = allRegisters[allRegisters.length-1]['high'];
      let lastRegisterLow = allRegisters[allRegisters.length-1]['low'];
      let lastRegisterAverage = parseFloat(((lastRegisterHigh + lastRegisterLow) / 2).toFixed(2));
      let counter = 0;

      let jsDate = new Date(lastRegisterTime * 1000);  

      if(counter == 3){

        chart.data.labels.push(jsDate.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}));
        chart.data.labels.shift();
  
        chart.data.datasets[0].data.push(lastRegisterAverage);
        chart.data.datasets[0].data.shift();
  
        chart.data.datasets[1].data.push(lastRegisterLow);
        chart.data.datasets[1].data.shift();
  
        chart.data.datasets[2].data.push(lastRegisterHigh);
        chart.data.datasets[2].data.shift();
  
        chart.update();

        counter = 0;
      }
      counter++;
    });
  }

  showCryptocurrenciesGraphicHour(cryptoCurrency:string, currency:string){

    if(this.interval)
      clearInterval(this.interval);

    this.reloadCanvas();

    this.dataService.GetRegisterHour(cryptoCurrency, currency).then((res) => {

      let allRegisters = res.Data.Data;
      let allDates = [];
      let allAverageQuotization = [];
      let allMinimumQuotization = [];
      let allMaximumQuotization = [];

      allRegisters.forEach((res) => {
        let jsDate = new Date(res.time * 1000);

        if(parseInt(jsDate.toLocaleTimeString(navigator.language, {minute:'2-digit'})) % 5 == 0){

          allDates.push(jsDate.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}));
  
          allAverageQuotization.push( (((res.high + res.low) / 2).toFixed(2)) );
          allMinimumQuotization.push((res.low).toFixed(2));
          allMaximumQuotization.push((res.high).toFixed(2));
        }

      });

      let currencyInfo = this.coins.find(element => element.id == currency);

      this.graphicChart = new Chart('chart-canvas', {
        type: 'line',
        data: {
          labels: allDates,
          datasets: [
            {
              label:"Average",
              data: allAverageQuotization,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true
            },
            {
              type:'bar',
              label: 'Minimum',
              data: allMinimumQuotization,
              borderColor: 'rgba(0, 0, 0, 0)',
              backgroundColor: 'rgba(192, 75, 192, 0.5)',
              fill: false
            },
            {
              type:'bar',
              label:'Maximum',
              data: allMaximumQuotization,
              borderColor: 'rgba(231, 208, 29, 0.77)',
              backgroundColor: 'rgba(231, 208, 29, 0.77)',
              fill: false
            }
          ]
        },
        options: {
          legend: {
            display: true
          },
          scales: {
            xAxes: [{
              display: true
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: (currencyInfo.name + '(' +currencyInfo.id + ')')
              }
            }]
          }
        }
      });
    });

    this.interval = setInterval(() => {
      this.updateHourGraphic(this.graphicChart, cryptoCurrency, currency);
    }, 60000);
  }

  updateHourGraphic(chart:Chart ,cryptoCurrency:string, currency:string){

    this.dataService.GetRegisterHour(cryptoCurrency, currency).then((res) => {

      let allRegisters:Array<any> = res.Data.Data;

      let lastRegisterTime = allRegisters[allRegisters.length-1]['time'];
      let lastRegisterHigh = allRegisters[allRegisters.length-1]['high'];
      let lastRegisterLow = allRegisters[allRegisters.length-1]['low'];
      let lastRegisterAverage = parseFloat(((lastRegisterHigh + lastRegisterLow) / 2).toFixed(2));

      let jsDate = new Date(lastRegisterTime * 1000);  

      if(parseInt(jsDate.toLocaleTimeString(navigator.language, {minute:'2-digit'})) % 5 == 0){

        chart.data.labels.push(jsDate.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}));
        chart.data.labels.shift();
  
        chart.data.datasets[0].data.push(lastRegisterAverage);
        chart.data.datasets[0].data.shift();
  
        chart.data.datasets[1].data.push(lastRegisterLow);
        chart.data.datasets[1].data.shift();
  
        chart.data.datasets[2].data.push(lastRegisterHigh);
        chart.data.datasets[2].data.shift();
  
        chart.update();
      }

    });
  }

  showCryptocurrenciesGraphicMonth(cryptoCurrency:string, currency:string){
    
    if(this.interval)
      clearInterval(this.interval);

    this.reloadCanvas();

    this.dataService.GetRegisterMonth(cryptoCurrency, currency).then((res) => {

      let allRegisters = res.Data.Data;
      let allDates = [];
      let allAverageQuotization = [];
      let allMinimumQuotization = [];
      let allMaximumQuotization = [];
      let counter =2;

      allRegisters.forEach((res) => {
        let jsDate = new Date(res.time * 1000);

        if(counter == 2){

          allDates.push(jsDate.toLocaleDateString(navigator.language, {month: 'short', day:'2-digit'}));
  
          allAverageQuotization.push( (((res.high + res.low) / 2).toFixed(2)) );
          allMinimumQuotization.push((res.low).toFixed(2));
          allMaximumQuotization.push((res.high).toFixed(2));

          counter = 0;
        }
        counter++;

      });

      let currencyInfo = this.coins.find(element => element.id == currency);

      this.graphicChart = new Chart('chart-canvas', {
        type: 'line',
        data: {
          labels: allDates,
          datasets: [
            {
              label:"Average",
              data: allAverageQuotization,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true
            },
            {
              type:'bar',
              label: 'Minimum',
              data: allMinimumQuotization,
              borderColor: 'rgba(0, 0, 0, 0)',
              backgroundColor: 'rgba(192, 75, 192, 0.5)',
              fill: false
            },
            {
              type:'bar',
              label:'Maximum',
              data: allMaximumQuotization,
              borderColor: 'rgba(231, 208, 29, 0.77)',
              backgroundColor: 'rgba(231, 208, 29, 0.77)',
              fill: false
            }
          ]
        },
        options: {
          legend: {
            display: true
          },
          scales: {
            xAxes: [{
              display: true
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: (currencyInfo.name + '(' +currencyInfo.id + ')')
              }
            }]
          }
        }
      });
    });

  }

  showCryptocurrenciesGraphicYear(cryptoCurrency:string, currency:string){
    
    if(this.interval)
      clearInterval(this.interval);

    this.reloadCanvas();

    this.dataService.GetRegisterYear(cryptoCurrency, currency).then((res) => {

      let allRegisters = res.Data.Data;
      let allDates = [];
      let allAverageQuotization = [];
      let allMinimumQuotization = [];
      let allMaximumQuotization = [];
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');


      allRegisters.forEach((res) => {
        let jsDate = new Date(res.time * 1000);

        if(jsDate.toLocaleDateString(navigator.language, {day:'2-digit'}) == dd){

          allDates.push(jsDate.toLocaleDateString(navigator.language, {month: 'short', day:'2-digit'}));
  
          allAverageQuotization.push( (((res.high + res.low) / 2).toFixed(2)) );
          allMinimumQuotization.push((res.low).toFixed(2));
          allMaximumQuotization.push((res.high).toFixed(2));
        }

      });

      let currencyInfo = this.coins.find(element => element.id == currency);

      this.graphicChart = new Chart('chart-canvas', {
        type: 'line',
        data: {
          labels: allDates,
          datasets: [
            {
              label:"Average",
              data: allAverageQuotization,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true
            },
            {
              type:'bar',
              label: 'Minimum',
              data: allMinimumQuotization,
              borderColor: 'rgba(0, 0, 0, 0)',
              backgroundColor: 'rgba(192, 75, 192, 0.5)',
              fill: false
            },
            {
              type:'bar',
              label:'Maximum',
              data: allMaximumQuotization,
              borderColor: 'rgba(231, 208, 29, 0.77)',
              backgroundColor: 'rgba(231, 208, 29, 0.77)',
              fill: false
            }
          ]
        },
        options: {
          legend: {
            display: true
          },
          scales: {
            xAxes: [{
              display: true
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: (currencyInfo.name + '(' +currencyInfo.id + ')')
              }
            }]
          }
        }
      });
    });

  }

  onShowCryptocurrenciesGraphicHour(){
    var activeElement:any = document.getElementsByClassName("active").item(0);
    var elementToActivate:any = document.getElementById("hour");

    if(activeElement.id != elementToActivate.id){

      activeElement.classList.remove("active");
      elementToActivate.classList.add("active");
      this.showCryptocurrenciesGraphicHour(this.cryptoCurrency, this.currency);
    }
  }

  onShowCryptocurrenciesGraphicDay(){
    var activeElement:any = document.getElementsByClassName("active").item(0);
    var elementToActivate:any = document.getElementById("day");

    if(activeElement.id != elementToActivate.id){

      activeElement.classList.remove("active");
      elementToActivate.classList.add("active");
      this.showCryptocurrenciesGraphicDay(this.cryptoCurrency, this.currency);
    }
  }

  onShowCryptocurrenciesGraphicWeek(){

    var activeElement:any = document.getElementsByClassName("active").item(0);
    var elementToActivate:any = document.getElementById("week");

    console.log(activeElement.id);
    if(activeElement.id != elementToActivate.id){

      activeElement.classList.remove("active");
      elementToActivate.classList.add("active");
      this.showCryptocurrenciesGraphicWeek(this.cryptoCurrency, this.currency);
    }
  }  

  onShowCryptocurrenciesGraphicMonth(){
    var activeElement:any = document.getElementsByClassName("active").item(0);
    var elementToActivate:any = document.getElementById("month");

    if(activeElement.id != elementToActivate.id){

      activeElement.classList.remove("active");
      elementToActivate.classList.add("active");
      this.showCryptocurrenciesGraphicMonth(this.cryptoCurrency, this.currency);
    }
  }

  onShowCryptocurrenciesGraphicYear(){
    var activeElement:any = document.getElementsByClassName("active").item(0);
    var elementToActivate:any = document.getElementById("year");

    if(activeElement.id != elementToActivate.id){

      activeElement.classList.remove("active");
      elementToActivate.classList.add("active");
      this.showCryptocurrenciesGraphicYear(this.cryptoCurrency, this.currency);
    }
  }

}

