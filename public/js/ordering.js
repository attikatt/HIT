/*jslint es5:true, indent: 2 */
/*global sharedVueStuff, Vue, socket */
'use strict';
//Ska finnas v-on:click="incrementCounter" också enl. original
Vue.component('ingredient', {
  props: ['item', 'type', 'lang'],
  template: ' <div class="ingredient">\
                  <label>\
                    <button v-bind:id="item.ingredient_id" class="ingredientSquareB" v-on:click="changePage(true)"><img class="ingImg" v-bind:src="item.ingredient_img">\ <br>\{{item["ingredient_"+ lang]}} </button>\
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
      this.$emit('increment'); //meddelar html att den ska anropa addItemToOrder
    },
    resetCounter: function () {
      this.counter = 0;
    },
    changePage: function (goesForward) {
        if (vm.baseShown || vm.ingShown || vm.piffShown) {
            this.incrementCounter(); // behöver vi verkligen countern? Funkar ej nu: ändras nu ej när ingredienser byts ut. Men this.$emit('increment') behövs!
            vm.changeStep(true);
        }
        else if (vm.changeIngShown) {
            vm.swapIng(this.item.ingredient_id); // sending id of ingredient user is swapping to.
            vm.showPage("showYourDrink");
        }
    }
  }
});

//Hämtar ordeing number
Vue.component('item-and-id', {
  props: ['uiLabels', 'order', 'orderId', 'lang'],
  template: '<div id="yourOrderDiv"><h2 v-bind:class="order.name" class="lowerCaseHeadline"> #{{orderId}}</h2></br></div>'
});


var vm = new Vue({
  el: '#ordering',
  mixins: [sharedVueStuff], // include stuff that is used both in the ordering system and in the kitchen
  data: {
    // ev. ta bort dessa
    volume: 0,
    price: 0,
    // page being shown
    startShown: true,
    chooseTypeShown: false,
    baseShown: false,
    piffShown: false,
    ingShown: false,
    yourDrinkShown: false,
    startAgainShown: false,
    favShown: false,
    drinkInfoShown: false,
    sizeShown: false,
    cartShown: false,
	thanksShown:false,
	changeIngShown: false,
    step: 1,
    ingType: 'fruit',
    // drink currently being composed
    drinkPath: '',
    type: '',
    chosenIngredients: [],
    tempDrink: '',
    chosenSize: 'medium',
	changeFromId: 0,
    //all drinks in current order
    fullOrder: [],
	allOrders: []
  },
  methods:{
      
/*----------- Adding to order and placing order ---------- */
      // ordering readymades
    orderReadymade: function() {
      for (var i = 0; i < this.tempDrink.rm_ingredients.length; i += 1) {
          this.addItemToOrder(this.getIngredientById(this.tempDrink.rm_ingredients[i]));
      }
    },
      // adds an ingredient to the drink being composed
    addItemToOrder: function (item) {
      this.chosenIngredients.push(item);
		if (this.type === "smoothie") {
        	this.volume += +item.vol_smoothie;
			// if the drink is not one of juicifers, making the ingredient panel 
			if(!this.drinkInfoShown){
				vm.ingText(item);
			}
		}
		else if(this.type === "juice"){
			this.volume += +item.vol_juice;
			// if the drink is not one of juicifers, making the ingredient panel 
			if(!this.drinkInfoShown){
				vm.ingText(item);
			}
      }
    },
      
    removeItemFromOrder: function () {
        this.chosenIngredients.pop();
    },
    removeFavFromOrder: function () {
        this.chosenIngredients = [];
    },


/*------  Making the text of the chosing ingredient so it occurs in the circle-----*/
// TRIED TO CONTACINATE... LOOK INTO MORE OBS	  
	ingText: function (ingitem){
		var ingredientCircle;
		if(this.lang === 'en') {
			ingredientCircle = ingitem.ingredient_en;
		}
	  	else if(this.lang === 'sv'){
			ingredientCircle = ingitem.ingredient_sv;	
		}
		var currentStep = document.getElementById("step" + this.step);
		var textIng = document.createTextNode(ingredientCircle);
		
		var h5 = document.createElement("h5");
		h5.style.position ="absolute";
		h5.style.letterSpacing = "0em";
		h5.style.maxWidth = "7vw";
		h5.style.verticalAlign = "center";
		h5.style.color = "black";
		h5.style.width = "100%";
		h5.style.paddingLeft = "12vw";
		h5.style.paddingRight ="4vw";
		h5.style.margin ="-6vh";
		h5.appendChild(textIng);
		currentStep.appendChild(h5);
	},
     
      // adds drink to order
    addDrinkToOrder: function () {
        // give drink its name
        var name;
        if (this.drinkPath === 'fav') {
            name = this.tempDrink.rm_name;
        }
        else if (this.drinkPath === 'myo') {
            if (this.type === 'juice') {
                name = 'Egen juice';
            }
            else if (this.type === 'smoothie') {
                name = 'Egen smoothie';
            }
        }
        var i,
        //Wrap the order (a single drink) in an object
        order = {
          ingredients: this.chosenIngredients,
          type: this.type,
            size: this.chosenSize,
            name: name,
        };
        //Add drink to the full order 
        this.fullOrder.push(order); 
    },
	  
	  //removes the drink from order
	removeDrinkFromOrder: function (drink) {
	  var index = this.fullOrder.indexOf(drink);
	  this.fullOrder.splice(index,1);
	},  
	  
    placeOrder: function () {
      // make use of socket.io's magic to send the stuff to the kitchen via the server (app.js)
        for (var i = 0; i < this.fullOrder.length; i += 1) {
            // sending each drink in full order to kitchen
            socket.emit('order', {order: this.fullOrder[i]});
        }
      
      //set all counters to 0. Notice the use of $refs
        /* CV: 'counter' ska nog bort:
      for (i = 0; i < this.$refs.ingredient.length; i += 1) {
        this.$refs.ingredient[i].resetCounter();
      }  */
      this.volume = 0;
      this.type = '';
      this.chosenIngredients = [];
        console.log("placerat order");
    },
      
/*----------- To identify/present ingredients ---------- */
    getIngredientById: function (id) {
      for (var i =0; i < this.ingredients.length; i += 1) {
        if (this.ingredients[i].ingredient_id === id){
          return this.ingredients[i];
        }
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
    
      
/*----------- For replacing an ingredient ---------- */
	markChangeFrom: function(ingredient_id){
		this.changeFromId = ingredient_id;
	},
      
    findIngToReplace: function(ingredient) {
        return ingredient.ingredient_id === this.changeFromId; 
    },
	  
	swapIng: function (changeToId) {
		var changeIndex = this.chosenIngredients.findIndex(this.findIngToReplace);
        this.chosenIngredients[changeIndex] = this.getIngredientById(changeToId);
	},
	  
	  
/*----------- For showing the right page/view ---------- */
    hideAllPages: function(){
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
		this.changeIngShown =false;
    },  
      
    showPage: function(page) {
        this.hideAllPages();
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
            // set all drink order counters to 0.
            this.type = '';
            this.chosenIngredients = [];
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
		else if (page === "showChangeIng"){
			this.changeIngShown = true;
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
      
    changeStep: function(goesForward) {
        var steps = document.getElementsByClassName("stepCircle");
		// Här har vi försökt markera med färg vilka ingredienser som har valts, så att det syns när man klickar bakåt. Ej färdig, ska ev. tas bort.
        //var itemClass = document.getElementsByClassName("ingredientSquareB");
		//var itemId = document.getElementById(3).style.backgroundColor ="pink";
		//console.log(itemClass);
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
				this.step =1;
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
      
    filterIngType: function(chosenIngType) {
        this.ingType = chosenIngType;
        var categories = document.getElementsByClassName("categoryB");
        for (var i = 0; i < categories.length; i++) {
            categories[i].style.color = "grey";
            categories[i].style.borderColor = "grey";
        }
        document.getElementById(chosenIngType+"B").style.color = "black"; document.getElementById(chosenIngType+"B").style.borderColor = "rgb(215,83,14)"; 
        // när man går tillbaka från steg 5 till 4, ska det vara förvalt frukter (knappen är så nu) eller senast valda kategori? (filtreringen så nu)
    },
    
/*--------- For composing drink ------------*/
    choosePath: function (fav_or_myo) {
        if (fav_or_myo === 'fav') {
            this.drinkPath = 'fav';
        }
        else if (fav_or_myo === 'myo') {
            this.drinkPath = 'myo';
        }
    },
      
    chooseType: function (juice_or_smoothie) {
        if (juice_or_smoothie === 'juice') {
            this.type = 'juice';
        }
        else if (juice_or_smoothie === 'smoothie') {
            this.type = 'smoothie';
        }
    },
      
    // marks which readymade drink customer is choosing
    markDrink: function (drink) {
        this.tempDrink = drink;
    },
	  
    // NOTE: Fix so when you go back, the property will not be null and the marked button is shown not the medium  
    setSize: function (size) {
		this.chosenSize = size;
    },
	  
	 getPrice: function(size) {
		if(size === "small"){
			return "36 kr";
		} 
		else if(size === "medium"){
			return "42 kr";
		} 
		else if(size === "large"){
			return "49 kr";
		} 		 
	 },
	  
	 calcPrice: function() {
		 var totalPrice = 0;
		 for (var i = 0; i < this.fullOrder.length; i++){
			if (this.fullOrder[i].size === "small") {
				totalPrice += 36; 
			}
			else if (this.fullOrder[i].size === "medium") {
				totalPrice += 42; 
			}
			else if (this.fullOrder[i].size === "large") {
				totalPrice += 49; 
			}	
		 }
		 return totalPrice;
		  
	 },
	  
	 getSize: function() {
		 if (this.lang === "sv"){
			 return this.chosenSize; 
		 }
	 },
	
	getLastOrders: function() {
		var orderLength = this.fullOrder.length;
		console.log(this.orders);
	  },
/*------------- Cancelling order ---------------*/
    emptyOrder: function () {
        this.fullOrder = [];
		this.ingredientList = [];
		this.step = 1;
		this.chosenIngredients = [];
        this.chosenSize = 'medium';
		
    }

  }
});