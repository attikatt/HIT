'use strict';

Vue.component('ingredient', {
  name: 'ingredient',
  props: ['item','lang','name'],
  template: ' <div v-bind:class="[{highlight: chosen}, \'ingredient\']" v-on:click="putToChosen()">\
                  <label id="ing_tit">\
                  {{item["ingredient_" + lang]}}\
                  </label>\
                  <label id="ing_stock">\
                  {{item.stock}}\
                  </label>\
              </div>', //sätt lang = sv i main istället
    data: function(){
    return{
    chosen: false
}
},
    methods:{
        putToChosen: function() {
            vm.unmarkOtherIngredients();
            this.chosen = !this.chosen;
            this.$emit('ingredientchosen');
          }
        }
});

var vm = new Vue({
  el: '#lagerDiv',
  mixins: [sharedVueStuff],
  data: {
    chosenIng: 'No ingredient chosen',
    type: ''
  },
  methods: {
    updateChosen: function() {
      var saldo = Number(saldoLetterList.join(''))
      if (saldoLetterList.length > 0){
      socket.emit('updateStock', {ingredient:this.chosenIng}, saldo)
      vm.chosenIng.stock = saldo;
      clearSaldoField();
    }
    },
    unmarkOtherIngredients: function() {
      for (var i = 0; i < this.$refs.ingredient.length; i += 1) {
        this.$refs.ingredient[i].chosen = false;
      }
    }
  },
});

/*-------Scrollar i lagerlistan-----*/
function scrollFunction(value){
  var numericValue = (parseInt(value, 36)-9);
  var i = '';
  for (i = 0; i < vm.ingredients.length; i++){
    if ((parseInt(vm.ingredients[i].ingredient_sv[0].toUpperCase(), 36)-9)===numericValue){
      console.log("Ifsats");
      var element = document.getElementById(vm.ingredients[i].ingredient_id);
      element.scrollIntoView();
      break;
    } else if ((parseInt(vm.ingredients[i].ingredient_sv[0].toUpperCase(), 36)-9) > numericValue){
      var element = document.getElementById(vm.ingredients[i-1].ingredient_id);
      element.scrollIntoView();
      break;
    } else { //håller sålänge systemet ej innehåller överdrivet många ingredienser på z, å, ä, ö
      var element = document.getElementById(vm.ingredients[i].ingredient_id);
      element.scrollIntoView();
    }
  }
}

/*---------Supports console--------*/
var saldoLetterList = [];

function numberPressed(letterButton){
    if (vm.chosenIng != "No ingredient chosen"){
    var letterButton = letterButton.value;
    saldoLetterList.push(letterButton);
    document.getElementById("changeSaldoConsoleChild").innerHTML = saldoLetterList.join("");
  }
}

function backSpaceLetter(){
    saldoLetterList.pop();
    document.getElementById("changeSaldoConsoleChild").innerHTML = saldoLetterList.join("");
}

function clearSaldoField(){
    saldoLetterList = [];
    document.getElementById("changeSaldoConsoleChild").innerHTML = saldoLetterList.join("");
}
