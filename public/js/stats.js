'use strict';

 /*-------------------Generera data------------*/
 var vm = new Vue({
   el: '#VueDiv',
   mixins: [sharedVueStuff],
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
  return colors;
}

function drawChart() {
  console.log("Jag ritar");
  var orderData = google.visualization.arrayToDataTable(vm.getOrderData());
  var orderOptions = {
    title: 'Fördelning av beställningar',
    pieHole: 0.4,
    colors: ['rgb(244,66,66)', 'rgb(64,246,96)'],
    'backgroundColor':'transparent',
    'titleTextStyle': {color:'white', fontName: 'champagne__limousinesregular', fontSize:'25', bold:'false'},
    legend: {textStyle: {color: 'white', fontName: 'champagne__limousinesregular', fontSize:'16'}}
  };
  console.log(orderData);

  var ingredientData = google.visualization.arrayToDataTable(vm.getIngredientData());
  var ingredientOptions = {
    title: 'Fördelning av beställda ingredienser',
    pieHole: 0.4,
    colors: getColors(vm.getIngredientData().length),
    'backgroundColor':'transparent',
    'titleTextStyle': {color:'white', fontName: 'champagne__limousinesregular', fontSize:'25', bold:'false'},
    legend: {textStyle: {color: 'white', fontName: 'champagne__limousinesregular', fontSize:'16'}, maxLines: '6'},
    pieResidueSliceLabel: 'Övriga',
    sliceVisibilityThreshold: 6/100
  };
  console.log(ingredientData);

  /*---- Only show graphs if there is data----*/
  if (Object.keys(vm.getCurrentStatus()).length > 0){
    document.getElementById('errorSpan').innerHTML = "";
    var chart1 = new google.visualization.PieChart(document.getElementById('donutchartOrders'));
    chart1.draw(orderData, orderOptions);

    if (vm.getIngredientData().length > 1){
      var chart2 = new google.visualization.PieChart(document.getElementById('donutchartIngred'));
      chart2.draw(ingredientData, ingredientOptions);
    }

} else if (document.getElementById('errorSpan').innerHTML === ""){
  document.getElementById('errorSpan').innerHTML = "Inte tillräckligt många ordrar för att visa grafer";
  document.getElementById('donutchartIngred').innerHTML ="";
  document.getElementById('donutchartOrders').innerHTML ="";

}
  setTimeout(drawChart,2000); //här regleras hur ofta graferna uppdateras, kan behöva sänkas om många klienter
}
