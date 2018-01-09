'use strict';

/*--------Stor version av active order----*/
Vue.component('order-item-to-prepare',{
  props: ['uiLabels', 'order', 'orderId', 'lang'],
  template: '<div>\
          <order-item\
            :ui-labels="uiLabels"\
            :lang="lang"\
            :order-id="orderId"\
            :order="order">\
          </order-item>\
         </div>',
  methods: {
    orderDone: function () {
      this.$emit('done');
    },
    cancelOrder: function () {

    }
  }
});

/*---------Samtliga avslutade ordrar----*/
Vue.component('order-list',{
  props: ['uiLabels', 'order', 'orderId', 'lang', 'type'],
  template: '<div v-bind:class="order.type" v-on:click ="setActive()">\
          <order-item-short\
            :ui-labels="uiLabels"\
            :lang="lang"\
            :order-id="orderId"\
            :order="order">\
          </order-item-short>\
         </div>',
         data: function(){
           return {
             active: false
           }
         },
         methods:{
           setActive: function(){
             vm.displayChosenDrink(this.order, this.orderId);
             this.active = !this.active;
             this.$emit('activate-order');
           }
        }
});

/*------------Vue----------*/
var vm = new Vue({
  el: '#mainDiv',
  mixins: [sharedVueStuff], // include stuff that is used both in the ordering system and in the kitchen
  data: {
    activeOrder: "no order chosen",
  },
  methods: {
    markDone: function (orderid) {
      socket.emit("orderDone", orderid);
    },

    displayChosenDrink: function(order, orderId) {
      var ingredientList =[]
      var ingred = []
      for (var i = 0; i < order.ingredients.length; i++){
        ingredientList.push(order.ingredients[i].ingredient_en)
      }
    },
      takeOrderBackButton: function(order){
        socket.emit("orderNotDone", order.orderId);
    },
    searchForOrder: function() {
      console.log(numLetterList.join(''));
      if (Object.keys(this.orders).length == 0){
        document.getElementById('noSearchMatch').innerHTML = "Order #" + Number(numLetterList.join('')) + " finns inte i historiken";
      }

      for(var i = 1; i < Object.keys(this.orders).length +1; i +=1){
        if(Number(numLetterList.join(''))===this.orders[i].orderId){
          this.activeOrder = this.orders[i];
          modal.style.display = "none";
        } else if (Number(numLetterList.join('')) === 0){
            document.getElementById('noSearchMatch').innerHTML = "Vänligen ange ett ordernummer";
          } else {
          document.getElementById('noSearchMatch').innerHTML = "Order #" + Number(numLetterList.join('')) + " finns inte i historiken";
        }
      }
      clearSaldoConsoleChild();
    }
    }
  });

  function clearSaldoConsoleChild(){
      numLetterList = [];
      document.getElementById("changeSaldoConsoleChild").innerHTML = numLetterList.join("");
  }

/*---Modal---*/
 var modal = document.getElementById('myModal');
 var btn = document.getElementById("searchButton");
 var span = document.getElementsByClassName("close")[0];

/* Open on click */
 btn.onclick = function() {
     modal.style.display = "block";
     document.getElementById("noSearchMatch").innerHTML = '';
 }

 /* Close on (X) and outside */
 span.onclick = function() {
     modal.style.display = "none";
 }
 window.onclick = function(event) {
     if (event.target == modal) {
         modal.style.display = "none";
     }
 }

 /*------Supports console search----*/
 var numLetterList = [];

  function numberPressed(letterButton){
      var letterButton = letterButton.value;
      numLetterList.push(letterButton);
      document.getElementById("changeSaldoConsoleChild").innerHTML = numLetterList.join("");
  }

  function backSpaceLetter(){
      numLetterList.pop();
      document.getElementById("changeSaldoConsoleChild").innerHTML = numLetterList.join("");
  }

  function clearSaldoField(){
      numLetterList = [];
      document.getElementById("changeSaldoConsoleChild").innerHTML = numLetterList.join("");
  }
