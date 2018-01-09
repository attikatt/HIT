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
       ['Drinktyp', 'Antal beställda'],
       ['Smoothie',     this.amountSmoothies],
       ['Juice',      this.amountJuices]
     ])
   },
   getIngredientData: function (){
     var contentArr = [
       ['Ingrediens', 'Antal beställda']
     ];
     /*--- Initiera contentArr---*/
     for (var i = 0; i < this.ingredients.length; i ++){
       contentArr.push([this.ingredients[i].ingredient_sv, 0]);
     }
     /*--- Gå igenom ordrar, dess ingredienser och jämför---*/
     for (var i = 1; i < Object.keys(this.orders).length +1; i += 1) { //loopa över alla ordrar
       for (var j = 0; j < this.orders[i].ingredients.length; j++){ //loopa över varje orders ingredienser
         for (var k = 1; k < contentArr.length; k++){ //loopa över alla ingredienser (för att jämföra)
           if (contentArr[k][0] == this.orders[i].ingredients[j].ingredient_sv){
             contentArr[k][1] ++;
           }
         }
       }
      }
      console.log(contentArr.sort());
      /*---Rensa ut ingredienser som inte är beställda tillräckligt ofta--*/
      var m = 1;
      while (m < contentArr.length){
        if(contentArr[m][1] < 2){
          console.log("Remove");
          contentArr.splice(m,1);
        } else {m++;}
      }
      console.log(contentArr);
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
    title: 'Fördelning av beställningar',
    pieHole: 0.4,
    colors: ['blue', 'green'],
    'backgroundColor':'transparent',
    'titleTextStyle': {color:'white', fontName: 'champagne__limousinesregular', fontSize:'20', bold:'false'},
    legend: {textStyle: {color: 'white', fontName: 'champagne__limousinesregular', fontSize:'16'}}
  };

  var ingredientData = google.visualization.arrayToDataTable(dataVm.getIngredientData());
  var ingredientOptions = {
    title: 'Fördelning av beställda ingredienser',
    pieHole: 0.4,
    colors: ['hotpink', 'limegreen', 'purple', 'yellow','orange'],
    'backgroundColor':'transparent',
    'titleTextStyle': {color:'white', fontName: 'champagne__limousinesregular', fontSize:'20', bold:'false'},
    legend: {textStyle: {color: 'white', fontName: 'champagne__limousinesregular', fontSize:'16'}},
    pieResidueSliceLabel: 'Övriga',
    pieResidueSliceColor: 'darkgreen',
    sliceVisibilityThreshold: 6/100
  };


  var chart1 = new google.visualization.PieChart(document.getElementById('donutchartOrders'));
  chart1.draw(orderData, orderOptions);

  var chart2 = new google.visualization.PieChart(document.getElementById('donutchartIngred'));
  chart2.draw(ingredientData, ingredientOptions);

  setTimeout(drawChart,1000); //här regleras hur ofta grafen uppdateras, kan behöva sänkas om många klienter
}
