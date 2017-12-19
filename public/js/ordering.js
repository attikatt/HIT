/*jslint es5:true, indent: 2 */
/*global sharedVueStuff, Vue, socket */
'use strict';
//Ska finnas v-on:click="incrementCounter" också enl. original
Vue.component('ingredient', {
  props: ['item', 'type', 'lang'],
  template: ' <div class="ingredient">\
                  <label>\
                    <button class="ingredientSquareB" v-on:click="changePage"><img class="ingImg" v-bind:src="item.ingredient_img">\ <br>\{{item["ingredient_"+ lang]}} </button>\
                  </label>\
              </div>',
  data: function () {
    return {
      counter: 0
    };
  },
  methods: {
    incrementCounter: function () {
      this.counter += 1;
      this.$emit('increment');
    },
    resetCounter: function () {
      this.counter = 0;
    },
    changePage: function (goesForward) {
        vm.changePage(true);
    }
  }
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getOrderNumber() {
  // It's probably not a good idea to generate a random order number, client-side. 
  // A better idea would be to let the server decide.
  return "#" + getRandomInt(1, 1000000);
}

var vm = new Vue({
  el: '#ordering',
  mixins: [sharedVueStuff], // include stuff that is used both in the ordering system and in the kitchen
  data: {
    type: '',
    chosenIngredients: [],
    volume: 0,
    price: 0,
    baseShown: true,
    piffShown: false,
    ingShown: false,
    step: 1,
    ingType: 'fruit' 
  },
  methods: {
    addToOrder: function (item, type) {
      this.chosenIngredients.push(item);
      this.type = type;
      if (type === "smoothie") {
        this.volume += +item.vol_smoothie;
      } else if (type === "juice") {
        this.volume += +item.vol_juice;
      }
      this.price += +item.selling_price;
    },
    placeOrder: function () {
      var i,
      //Wrap the order in an object
        order = {
          ingredients: this.chosenIngredients,
          volume: this.volume,
          type: this.type,
          price: this.price
        };
      // make use of socket.io's magic to send the stuff to the kitchen via the server (app.js)
      socket.emit('order', {orderId: getOrderNumber(), order: order});
      //set all counters to 0. Notice the use of $refs
      for (i = 0; i < this.$refs.ingredient.length; i += 1) {
        this.$refs.ingredient[i].resetCounter();
      }
      this.volume = 0;
      this.price = 0;
      this.type = '';
      this.chosenIngredients = [];
    },
      
    getIngredientById: function (id) {
      for (var i =0; i < this.ingredients.length; i += 1) {
        if (this.ingredients[i].ingredient_id === id){
          return this.ingredients[i];
        }
      }
    },
    orderReadymade: function(rm) {
      for (var i = 0; i < rm.rm_ingredients.length; i += 1) {
        this.addToOrder(this.getIngredientById(rm.rm_ingredients[i]), rm.rm_type);
      }
    },
    
    getIngredientNameList: function (idArr) {
        console.log(typeof idArr);
      var ingredientList = "", tempIngredient;
      for (var i = 0; i < idArr.length ; i += 1) {
        tempIngredient = this.getIngredientById(idArr[i]);
        ingredientList += tempIngredient["ingredient_" + this.lang] + ", ";
      }
      return ingredientList;
    },
    
    showBase: function() {
      this.baseShown = true;
        this.ingShown = false;
      this.piffShown = false;
    },
    showIng: function() {
      this.baseShown = false;
    this.ingShown = true;
      this.piffShown = false;
    },
    showPiff: function() {
      this.baseShown = false;
        this.ingShown = false;
      this.piffShown = true;
    },
    
    changePage: function(goesForward) {
        var steps = document.getElementsByClassName("stepCircle");
        for (var i = 0; i < steps.length; i++) {
            steps[i].style.color = "grey";
            steps[i].style.backgroundColor = "lightgrey";  
        }
        
        if (goesForward) {
            if(this.step === 1) {
                this.showIng();
            }
            else if (this.step === 2) {
                this.showIng();
            }
            else if (this.step === 3) {
                this.showIng();
            }
            else if (this.step === 4) {
                this.showPiff();
            }
            else {
                this.showPiff();
            }
            this.step += 1;
        }

        else {
            if (this.step === 1) {
                this.showBase();
                // Här ska vi egentligen gå till föregående sida.
            }
            else if (this.step === 2) {
                this.showBase();
            }
            else if (this.step === 3) {
                this.showIng();
            }
            else if (this.step === 4) {
                this.showIng();
            }
            else {
                this.showIng();
            }
            this.step -= 1;
        }
        document.getElementById("step"+this.step).style.color = "black"; document.getElementById("step"+this.step).style.backgroundColor = "white";
        console.log(this.step);
        return this.step;
    },
      
    filterIngType: function(choosenIngType) {
        this.ingType = choosenIngType;
        var categories = document.getElementsByClassName("categoryB");
        for (var i = 0; i < categories.length; i++) {
            categories[i].style.color = "grey";
            categories[i].style.borderColor = "grey";
        }
        document.getElementById(choosenIngType+"B").style.color = "black"; document.getElementById(choosenIngType+"B").style.borderColor = "rgb(215,83,14)"; 
        // när man går tillbaka från steg 5 till 4, ska det vara förvalt frukter (knappen är så nu) eller senast valda kategori? (filtreringen så nu)
    }

  }
});