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
         for (var k = 1; k < contentArr.length; k++){ //loopa över alla ingredienser
           if (contentArr[k][0] == this.orders[i].ingredients[j].ingredient_sv){ //jämför
             contentArr[k][1] ++;
           }
         }
       }
      }
      /*---Rensa ut ingredienser som inte är beställda tillräckligt ofta--*/
      var m = 1;
      while (m < contentArr.length){
        if(contentArr[m][1] < 1){
          contentArr.splice(m,1);
        } else {m++;}
      }
     return (contentArr)
   },
   getCurrentStatus(){
     return this.orders;
   }
 }
});

/*--------------Rita grafer------------*/
google.charts.load("current", {packages:["corechart"]});
google.charts.setOnLoadCallback(drawChart);

function getColors(size){
  var colors = [];
  var red = 244;
  var green = 66;
  var blue = 66;
  var step = 30;
  for (var i = 0; i < size; i ++){
    var currColor = 'rgb(' + red + ',' + green + ',' + blue + ')';
    colors.push(currColor);
    if (green < 244){
      green += step;
    } else if (red > 69) {
      red -= step
    } else if (blue < 244) {
      blue += step;
    }
  }
  console.log(colors);
  return colors;

}

function drawChart() {
  var orderData = google.visualization.arrayToDataTable(dataVm.getOrderData());
  var orderOptions = {
    title: 'Fördelning av beställningar',
    pieHole: 0.4,
    colors: ['rgb(255,51,153)', 'rgb(220,220,51)'],
    'backgroundColor':'transparent',
    'titleTextStyle': {color:'white', fontName: 'champagne__limousinesregular', fontSize:'20', bold:'false'},
    legend: {textStyle: {color: 'white', fontName: 'champagne__limousinesregular', fontSize:'16'}}
  };

  var ingredientData = google.visualization.arrayToDataTable(dataVm.getIngredientData());
  var ingredientOptions = {
    title: 'Fördelning av beställda ingredienser',
    pieHole: 0.4,
    colors: getColors(dataVm.getIngredientData().length),
    //colors: ['rgb(0, 140, 0)', 'rgb(10,150,10)', 'rgb(20,160,20)', 'rgb(30,170,30)'],
    //colors: ['rgb(0, 60, 0)', 'rgb(0,80,0)'],
    'backgroundColor':'transparent',
    'titleTextStyle': {color:'white', fontName: 'champagne__limousinesregular', fontSize:'20', bold:'false'},
    legend: {textStyle: {color: 'white', fontName: 'champagne__limousinesregular', fontSize:'16'}},
    pieResidueSliceLabel: 'Övriga',
    //pieResidueSliceColor: '#365888',
    sliceVisibilityThreshold: 6/100
  };

  /* Vanliga
  var chart1 = new google.visualization.PieChart(document.getElementById('donutchartOrders'));
  chart1.draw(orderData, orderOptions);

  var chart2 = new google.visualization.PieChart(document.getElementById('donutchartIngred'));
  chart2.draw(ingredientData, ingredientOptions);
  */

  /* Med ifsatser */
  if (Object.keys(dataVm.getCurrentStatus()).length > 0){
    var chart1 = new google.visualization.PieChart(document.getElementById('donutchartOrders'));
    chart1.draw(orderData, orderOptions);

    if (dataVm.getIngredientData().length > 1){
      var chart2 = new google.visualization.PieChart(document.getElementById('donutchartIngred'));
      chart2.draw(ingredientData, ingredientOptions);
    } else  { //denna visas beorende på vad gränsen för sållningen är
      document.getElementById('donutchartIngred').innerHTML = "<span style='font-size:1.5vw;margin: 5vw;'>Not enough data on ingredients to display chart</span>";
  }

} else {
  document.getElementById('VueDiv').innerHTML = "<span style='font-size:4vw;margin: 15vw;'>Not enough recived orders to display data</span>";
}
  setTimeout(drawChart,1000); //här regleras hur ofta graferna uppdateras, kan behöva sänkas om många klienter
}

function test(){
  var colors = [];
  var red = 244;
  var green = 66;
  var blue = 66;
  var step = 30;
  for (var i = 0; i < 70; i ++){
    var currColor = 'rgb(' + red + ',' + green + ',' + blue + ')';
    colors.push(currColor);
    if (green < 244){
      green += step;
    } else if (red > 69) {
      red -= step
    } else if (blue < 244) {
      blue += step;
    }
  }
  console.log(colors);
}
test();
