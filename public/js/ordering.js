/*jslint es5:true, indent: 2 */
/*global sharedVueStuff, Vue, socket */
'use strict';

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
      if (vm.page === "chooseBase" || vm.page === "chooseIng" || vm.page === "choosePiff") {
          this.incrementCounter();
          vm.changeStep(true);
      }
      else if (vm.page === "changeIng") {
          vm.swapIng(this.item.ingredient_id); // sending id of ingredient user is swapping to.
          vm.showPage("yourDrink");
      }
    }
  }
});

var vm = new Vue({
  el: '#ordering',
  mixins: [sharedVueStuff], // include stuff that is used both in the ordering system and in the kitchen
  data: {
    // page being shown
    page: "start",
    step: 1,
    ingType: 'fruit',
    // drink currently being composed
    drinkPath: '',
    type: '',
    chosenIngredients: [],
    tempDrink: '',
    chosenSize: 'medium',
    // To change ingredient
    changeFromIdIndex: [0, 0],
    changeIngType: '', 
    //all drinks in current order
    fullOrder: [],
    allOrders: [],
    // to go back to previous page after being in cart
    pageBeforeCart: 'start',
    comingFromCart: false
  },

 created: function() {
    socket.on("orderNumber",function(orderIdAndName) {
      vm.showOrderedItems(orderIdAndName);
    });
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
  			if(this.page !== "drinkInfo"){ 
  			vm.showStepImg(item);
  			}
  		}
  		else if (this.type === "juice") {
  			this.volume += +item.vol_juice;
  			// if the drink is not one of juicifers, making the ingredient panel
  			if (this.page !== "drinkInfo") {
  				vm.showStepImg(item);
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

  	showStepImg: function (ingItem) {
  		var ingImg = ingItem.ingredient_img;
  		var img = document.createElement("img");
  		img.setAttribute("src",ingImg);
  		img.style.position ="absolute";
  		img.style.width ="100%";
  		img.style.hight = "40vh";
  		img.style.marginLeft ="-9vw";
  		img.style.overflow ="hidden";
		  img.setAttribute("id",this.step + "img");

  		var numStep = document.createTextNode(this.step);
  		var p = document.createElement("p");
  		p.appendChild(numStep);
		  p.style.position ="relative";
  		p.style.color= "black";
  		p.style.backgroundColor = "transparent";
  		p.style.width ="100%";
  		p.style.marginLeft ="0vw";
  		p.style.marginTop ="-14vw";
		  p.setAttribute("id",this.step + "p");

  		var currentStep = document.getElementById("step" + this.step);
  		currentStep.appendChild(img);
  		currentStep.appendChild(p);
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
        compType: this.drinkPath
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
      this.volume = 0;
      this.type = '';
      this.chosenIngredients = [];
    },

/*----------- To identify/present ingredients ---------- */
    getIngredientById: function (id) {
      for (var i =0; i < this.ingredients.length; i += 1) {
        if (this.ingredients[i].ingredient_id === id){
          return this.ingredients[i];
        }
      }
    },

/*----------- For replacing an ingredient ---------- */
  	markChangeFrom: function([ingredient_id, index]){
  		this.changeFromIdIndex = [ingredient_id, index];
  	},

  	swapIng: function (changeToId) {
      this.chosenIngredients[this.changeFromIdIndex[1]] = this.getIngredientById(changeToId);
  	},

    showPage: function(page) {
      if (page === "chooseBase") {
        this.page = "chooseBase";
      }
      else if (page === "chooseIng") {
        this.page = "chooseIng";
      }
      else if (page === "choosePiff") {
        this.page = "choosePiff";
      }
      else if (page === "chooseType") {
        this.page = "chooseType";
      }
      else if(page === "start") {
        this.page = "start";
      }
      else if(page === "startAgain") {
        this.page = "startAgain";
          // set all drink order counters to 0.
        this.step = 1;
        this.ingType = "fruit";
        this.type = '';
        this.chosenIngredients = [];
      }
      else if(page === "yourDrink") {
        this.page = "yourDrink";
      }
      else if(page === "chooseSize") {
        if (this.comingFromCart) {
          this.removeDrinkFromOrder(this.fullOrder[2]);
        }
        this.page = "chooseSize";
      }
      else if(page === "cart") {
        // för att kunden ska komma tillbaka till basval om hen väljer att kolla på kundkorgen:
        if (this.page === "chooseIng" ||  this.page === "choosePiff") {
          this.pageBeforeCart = "chooseBase";
          this.step = 1;
          this.chosenIngredients = [];
        }
        // annars kommer kunden som vanligt tillbaka till föregående sida:
        else {
          this.pageBeforeCart = this.page;
        }
        this.page = "cart";
      }
      else if(page === "favorites") {
        this.page = "favorites";
      }
      else if (page === "drinkInfo") {
        this.page = "drinkInfo";
      }
      else if (page === "thanks") {
        this.page = "thanks";
      }
      else if (page === "changeIng") {
        this.ingType = 'fruit';
        this.page = "changeIng";
        var id = this.changeFromIdIndex[0];
        var index = this.changeFromIdIndex[1];

        if (index === 0) {
          this.changeIngType = 'base';
        }
        else if (this.getIngredientById(id).ingredient_category === 'piff') {
          this.changeIngType = 'piff';
        }
        else {
          this.changeIngType = 'ing';
        }
      }
      else if (page === "showFavOrMyo") {
        if (this.drinkPath === 'fav') {
          this.page = "favorites";
        }
        else if (this.drinkPath === 'myo') {
          this.page = "chooseBase";
        }
      }
      this.comingFromCart = false;
    },
  	  
  	goBackDrinkInfo: function() {
  		this.showPage('yourDrink');
  	},

    changeStep: function(goesForward) {
      var steps = document.getElementsByClassName("stepCircle");

      for (var i = 0; i < steps.length; i++) {
        steps[i].style.color = "grey";
        steps[i].style.backgroundColor = "lightgrey";
	      steps[i].style.boxShadow ="none";
      }

      if (goesForward) {
        if (this.step <= 1) {
          this.showPage("chooseIng");
		      this.step = 1;
        }
        else if (this.step === 2) {
          this.showPage("chooseIng");
        }
        else if (this.step === 3) {
          this.showPage("chooseIng");
        }
        else if (this.step === 4) {
          this.showPage("choosePiff");
        }
        else if (this.step === 5){
          this.showPage("yourDrink");
		    this.step = 4;
        }
        this.step += 1;
      }

      else {
      
        if (this.step <= 1) {
          this.showPage("chooseType");
          this.step =1;
        }
        else if (this.step === 2) {
          this.showPage("chooseBase");
        }
        else if (this.step === 3) {
          this.showPage("chooseIng");
        }
        else if (this.step === 4) {
          this.showPage("chooseIng");
        }
        else if (this.step === 5){
          this.showPage("chooseIng");
        }
        else if(this.step ===6){
          this.showPage("choosePiff");
          this.step = 5;
        }
    
        if(this.step > 1) {
          this.step -= 1;
          var currentStepDivId = document.getElementById("step"+this.step);
          var removeP = document.getElementById(this.step + "p");
          var removeImg = document.getElementById(this.step + "img");
          currentStepDivId.removeChild(removeP);
          currentStepDivId.removeChild(removeImg);  
        }
      }

      // For highlighting the right step
      var stylingSteps = document.getElementById("step"+this.step);
  	  stylingSteps.style.color = "black";
  	  stylingSteps.style.backgroundColor = "white";
  	  stylingSteps.style.boxShadow ="0px 0px 6px 3px #fff, 0px 0px 8px 5px rgb(215,83,14), 0px 0px 11px 7px #FFFFE0";
      return this.step;
    },

    filterIngType: function(chosenIngType) {
      this.ingType = chosenIngType;
      var categories = document.getElementsByClassName("categoryB");
      for (var i = 0; i < categories.length; i++) {
        categories[i].style.color = "grey";
        categories[i].style.boxShadow = "none";
        categories[i].style.borderColor = "rgb(215,83,14)";
      }
      if (this.step > 1 || this.step < 5 ) {
        document.getElementById(chosenIngType+"B").style.color = "black";
        document.getElementById(chosenIngType+"B").style.boxShadow ="0px 0px 6px 3px #fff, 0px 0px 8px 5px rgb(215,83,14), 0px 0px 11px 7px #FFFFE0";
        document.getElementById(chosenIngType+"B").style.borderColor = "rgb(215,83,14)";
      }
    },

    setComingFromCart: function() {
      this.comingFromCart = true;
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
      if (this.lang === "sv") {
        return this.chosenSize;
		  }
    },

    showOrderedItems: function(orderIdAndName) {
      var allOrders = this.orders;

      var h4 = document.createElement("h4");
      var nodeRef = document.getElementById("orderedItems");

      if (orderIdAndName[1] === 'Egen juice' && this.lang === 'en') {
        orderIdAndName[1] = 'Own juice'
      }
      if (orderIdAndName[1] === 'Egen smoothie' && this.lang === 'en') {
        orderIdAndName[1] = 'Own smoothie'
      }

      var text = document.createTextNode(orderIdAndName[1]+" #" + orderIdAndName[0]);
      var br = document.createElement("br");
      h4.appendChild(text);
      nodeRef.appendChild(h4);
      nodeRef.appendChild(br);
    },

/*------------- Checking if favourites have all ingredients available ---------------*/
    isDrinkAvailable: function (drinkIngs) {
      for (var i = 0; i < drinkIngs.length; i++) {
        var item = this.getIngredientById(drinkIngs[i]);
        if (item.stock < 5) {
          return false;
        }
      }
      return true;
    },

/*------------- Getting number of drinks in the order ---------------*/
    getLengthOfOrder: function() {
      return this.fullOrder.length;
    },
/*------------- Cancelling order ---------------*/
    emptyOrder: function () {
      this.fullOrder = [];
  		this.ingredientList = [];
  		this.step = 1;
  		this.chosenIngredients = [];
      this.chosenSize = 'medium';
  		this.ingType = "fruit";
    }
  }
});
