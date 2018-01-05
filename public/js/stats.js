'use strict';
/*-------------------Klocka------------*/
function updateClock(){
var now = new Date(),
    hours = now.getHours(),
    minutes = now.getMinutes(),
    seconds = now.getSeconds();
    if (minutes < 10) {
        minutes = "0" + minutes
    };
document.getElementById('clock').innerHTML = [hours,minutes,seconds].join(':');
setTimeout(updateClock,1000);
}
 updateClock();

 /*-------------------VueData------------*/

 var dataVm = new Vue({
   el: '#VueDiv',
   mixins: [sharedVueStuff], // include stuff that is used both in the ordering system and in the kitchen
   data: {
     amountSmoothies: 0,
     amountJuices: 0
   },
   methods: {
     getOrderData: function() {
       this.amountJuices = 0;
       this.amountSmoothies = 0;
     for (var i = 1; i < Object.keys(this.orders).length +1; i += 1) {
       if (this.orders[i].type === 'juice'){
         this.amountJuices += 1;
       }
       else if (this.orders[i].type === 'smoothie'){
         this.amountSmoothies += 1;
       }
     }
     return ([
       ['Type of drink', 'Amount ordered'],
       ['Smoothie',     this.amountSmoothies],
       ['Juice',      this.amountJuices]
     ])
   },
   getIngredientData: function (){
     var contentArr = [
       ['Ingredient', 'Amount ordered'],
       ['Pear',     5],
       ['Orange',   2]
     ];
  /*   for (var i = 1; i < 2; i += 1) {
       //console.log(this.orders[i].ingredients)
       //console.log(contentArr[i]);
       //console.log("Order "+i);
       console.log(this.orders[i].ingredients.length);
      for(var j =0; j < (this.orders[i].ingredients.length); j+=1){
            //console.log(this.orders[i].ingredients[j].ingredient_en);
         for (var i = 0; i< contentArr.length; i+=1){
           //console.log(contentArr[i]);
         }
     }
   }*/
     return (contentArr)
   }
 }
});

/*-------------------Grafer------------*/

google.charts.load("current", {packages:["corechart"]});
google.charts.setOnLoadCallback(drawChart);

//dataVm.createData();
function drawChart() {
  var orderData = google.visualization.arrayToDataTable(dataVm.getOrderData());
  var orderOptions = {
    title: 'Distribution of orders',
    pieHole: 0.4,
    colors: ['blue', 'green'],
    'backgroundColor':'transparent',
    'titleTextStyle': {color:'white', fontName: 'champagne__limousinesregular', fontSize:'20', bold:'false'},
    legend: {textStyle: {color: 'white', fontName: 'champagne__limousinesregular', fontSize:'16'}}
  };

  var ingredientData = google.visualization.arrayToDataTable(dataVm.getIngredientData());
  var ingredientOptions = {
    title: 'Distribution of ordered ingredients',
    pieHole: 0.4,
    colors: ['hotpink', 'limegreen', 'purple', 'yellow','orange'],
    'backgroundColor':'transparent',
    'titleTextStyle': {color:'white', fontName: 'champagne__limousinesregular', fontSize:'20', bold:'false'},
    legend: {textStyle: {color: 'white', fontName: 'champagne__limousinesregular', fontSize:'16'}}
  };


  var chart1 = new google.visualization.PieChart(document.getElementById('donutchartOrders'));
  chart1.draw(orderData, orderOptions);

  var chart2 = new google.visualization.PieChart(document.getElementById('donutchartIngred'));
  chart2.draw(ingredientData, ingredientOptions);

  setTimeout(drawChart,1000); //här regleras hur ofta grafen uppdateras, kan behöva sänkas om många klienter
}
