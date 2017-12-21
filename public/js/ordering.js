/*jslint es5:true, indent: 2 */
/*global sharedVueStuff, Vue, socket */
'use strict';
//Ska finnas v-on:click="incrementCounter" också enl. original
Vue.component('ingredient', {
  props: ['item', 'type', 'lang'],
  template: ' <div class="ingredient">\
                  <label>\
                    <button class="ingredientSquareB" v-on:click="changePage(true);incrementCounter()"><img class="ingImg" v-bind:src="item.ingredient_img">\ <br>\{{item["ingredient_"+ lang]}} </button>\
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
    startShown: true,
    chooseTypeShown: false,
    baseShown: false,
    piffShown: false,
    ingShown: false,
    yourDrinkShown: false,
    startAgainShown: false,
    step: 0,
    ingType: 'fruit',
    favShown: false,
    drinkInfoShown: false,
    sizeShown: false,
    cartShown: false,
	thanksShown:false,
    tempDrink: '',
    drinkPath: '',
    tempType: ''
	
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
		console.log(this.chosenIngredients);
    },
    markDrink: function (drink) {
        this.tempDrink = drink;
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
      var ingredientList = "", tempIngredient;
      for (var i = 0; i < idArr.length ; i += 1) {
        tempIngredient = this.getIngredientById(idArr[i]);
        ingredientList += tempIngredient["ingredient_" + this.lang] + ", ";
      }
      return ingredientList;
    },
      
    //below changed
      
    allpages: function(){
        this.startShown = false;
        this.chooseTypeShown = false;
        this.baseShown = false;
        this.ingShown = false;
        this.piffShown = false;
        this.yourDrinkShown = false;
        this.startAgainShown = false;
        this.sizeShown = false;
        this.cartShown = false;
        this.favShown = false;
        this.drinkInfoShown = false;
		this.thanksShown = false;
    },  
      
    showPage: function(page) {
        this.allpages();
        if(page === "showBase") {
            this.baseShown = true;
        }
        else if (page === "showIng"){
            this.ingShown = true;
        }
        else if (page === "showPiff"){
            this.piffShown = true;
        }
        else if (page === "showChooseType"){
            this.chooseTypeShown = true;
        }
        else if(page === "showStart"){
            this.startShown = true;
        }
        else if(page === "showStartAgain"){
            this.startAgainShown = true;
        }
        else if(page === "showYourDrink"){
            this.yourDrinkShown = true;
        }
        else if(page === "showSize") {
            this.sizeShown = true;
        }
        else if(page=== "showCart"){
            this.cartShown = true;
        }
        
        else if(page ==="showFav"){
            this.favShown = true;
        }
        else if (page === "showFavInfo"){
            this.drinkInfoShown = true;
        }
		else if (page ==="showThanks"){
			this.thanksShown = true;
		}
		
        else if (page === "showFavOrMyo") {
            if (this.drinkPath === 'fav') {
                this.favShown = true;
            }
            else if (this.drinkPath === 'myo') {
                this.baseShown = true;
            }
        }
        
    },
    
      
    changePage: function(goesForward) {
        var steps = document.getElementsByClassName("stepCircle");
        for (var i = 0; i < steps.length; i++) {
            steps[i].style.color = "grey";
            steps[i].style.backgroundColor = "lightgrey";  
        }

        if (goesForward) {
            if (this.step <= 1) {
                this.showPage("showIng");
				this.step = 1;
            }
            else if (this.step === 2) {
                this.showPage("showIng");
            }
            else if (this.step === 3) {
                this.showPage("showIng");
            }
            else if (this.step === 4) {
                this.showPage("showPiff");
            }
            else if (this.step === 5){
                this.showPage("showYourDrink");
				this.step = 4;
            }

            this.step += 1;
        }

        else {
            if (this.step <= 1) {
                this.showPage("showChooseType");
				this.step =2;
            }
            else if (this.step === 2) {
                this.showPage("showBase");
            }
            else if (this.step === 3) {
                this.showPage("showIng");
            }
            else if (this.step === 4) {
                this.showPage("showIng");
            }
            else if (this.step === 5){
                this.showPage("showIng");
            }
			else if(this.step ===6){
				this.showPage("showPiff");
				this.step = 5;
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
    },
    
    choosePath: function (fav_or_myo) {
        if (fav_or_myo === 'fav') {
            this.drinkPath = 'fav';
        }
        else if (fav_or_myo === 'myo') {
            this.drinkPath = 'myo';
        }
    },
      
    chooseTempType: function (juice_or_smoothie) {
        if (juice_or_smoothie === 'juice') {
            this.tempType = 'juice';
        }
        else if (juice_or_smoothie === 'smoothie') {
            this.tempType = 'smoothie';
        }
    }

  }
});