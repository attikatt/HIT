/*jslint es5:true, indent: 2 */
/*global io, Vue */
/*exported sharedVueStuff */
'use strict';

var socket = io();

Vue.component('order-item', {
  props: ['uiLabels', 'order', 'orderId', 'lang'],
  template: '<div id="section"><p class="headOrderInfo">#{{orderId}} {{order.name}}</p> <p id="orderSize"> {{order.size}}</p>\
  </br> <hr> <ul> <li v-for="item in order.ingredients" :class="item.ingredient_color">\
  <span>{{item["ingredient_" + lang]}}</span> <span id="antalIngredienser"> {{getNum(order.size,item)}}</span></li></ul></div>',
  methods: {
    getNum: function(size,order){
      if (size == 'small'){
        if (order.juice_base || order.smoothie_base){
          return '2'
        }
        else {
          return '1'
        }
      }
      if (size == 'medium'){
        if (order.juice_base || order.smoothie_base){
          return '4'
        }
        else {
          return '2'
        }
      }
      if (size == 'large'){
        if (order.juice_base || order.smoothie_base){
          return '6'
        }
        else {
          return '3'
        }
      }
    }
  }
});

Vue.component('order-item-short',{
  props: ['uiLabels', 'order', 'type', 'orderId','lang', 'name'],
  template : '<div>#{{orderId}} </br> {{order.name}} </br> (<span>{{order.size}} {{order.type}}</span>)</div>'
});

// Stuff that is used both in the ordering system and in the kitchen
var sharedVueStuff = {
  data: {
    orders: {},
    uiLabels: {},
    ingredients: {},
    readymade: {},
    lang: "en"
  },
  created: function () {
    socket.on('initialize', function (data) {
      this.orders = data.orders;
      this.uiLabels = data.uiLabels;
      this.ingredients = data.ingredients;
        this.readymade = data.readymade;
    }.bind(this));

    socket.on('switchLang', function (data) {
      this.uiLabels = data;
    }.bind(this));

    socket.on('currentQueue', function (data) {
      this.orders = data.orders;
      if (typeof data.ingredients !== 'undefined') {
        this.ingredients = data.ingredients;
      }
    }.bind(this));
  },
  methods: {
    switchLang: function () {
      if (this.lang === "en") {
        this.lang = "sv";
      } else {
        this.lang = "en";
      }
      socket.emit('switchLang', this.lang);
    }
  }
};
