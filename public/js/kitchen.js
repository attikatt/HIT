/*jslint es5:true, indent: 2 */
/*global sharedVueStuff, Vue, socket */
'use strict';

/* Active orders */
Vue.component('order-item-to-prepare',{
  props: ['uiLabels', 'order', 'orderId', 'lang'],
  template: '<div :class="[{active : order.status},order.type]">\
          <order-item\
            :ui-labels="uiLabels"\
            :lang="lang"\
            :order-id="orderId"\
            :order="order">\
          </order-item>\
          <div id ="radioButtons">\
              <label class="containerEP">EJ PÅBÖRJAD\
                <input name = "radioButton" value="ejpåbörjad" id="notDone2" type="radio" v-on:click="ejPaborjad">\
                <span class="checkmark"></span>\
              </label>\
              <label class="containerP">PÅBÖRJAD\
                <input name = "radioButton" value="påbörjad" type="radio" v-on:click="paborjad">\
                <span class="checkmark"></span>\
              </label>\
              <label class="containerK">KLAR\
                <input name = "radioButton" value="klar" type="radio" v-on:click="klar">\
                <span class="checkmark"></span>\
              </label>\
          </div>\
         </div>',
  methods: {
    ejPaborjad: function () {
      this.$emit('not-started');

    },
    paborjad: function () {
      this.$emit('started');
    },
    klar: function () {
      this.$emit('done');
    }
  }
});

/* Samliga ordrar*/
Vue.component('order-list',{
  props: ['uiLabels', 'order', 'orderId', 'lang', 'type'],
  template: '<div v-bind:class="order.type" v-on:click ="setActive(order)">\
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
           setActive: function(order){
               for (var key in vm.orders){
                 if (vm.orders[key].orderId != order.orderId &&  vm.orders[key].type == order.type){
                   socket.emit("orderNotActive", vm.orders[key].orderId);
                 }
                 if (vm.orders[key].orderId == order.orderId &&  vm.orders[key].type == order.type) {
                   socket.emit("orderActive", order.orderId);
                 }
               }
           }
        }
});

var vm = new Vue({
  el: '#mainDiv',
  mixins: [sharedVueStuff], // include stuff that is used both in the ordering system and in the kitchen
  data: {
  },
  methods: {
    getActiveOrderStage: function(order) {
      return order.status;
    },
    getActiveOrderState: function(order) {
      return order.state;
    },
    markDone: function (orderid) {
      socket.emit("orderDone", orderid);
    },
    ejPaborjad: function (order){
      socket.emit("orderNotDone", order.orderId);
    },
    paborjad: function(order){
      socket.emit("orderStarted", order.orderId);
    },
    klar: function(order){
      this.markDone(order.orderId);
    }
    }
  }
);

function antalEjKlaraOrdrar(){
  var index;
  var antal = 0;
  for (index in vm.orders){
    if (vm.orders[index].status !== 'done'){
      antal = antal + 1;
    }
  }
  return antal
}

/* Klocka*/
function updateClock(){
var now = new Date(),
    hours = now.getHours(),
    minutes = now.getMinutes(),
    seconds = now.getSeconds();
    if (minutes < 10) {
        minutes = "0" + minutes
    };
    if (seconds < 10) {
        seconds = "0" + seconds
    };
    document.getElementById('clock').innerHTML = antalEjKlaraOrdrar() + " ordrar i kön"+ " " + [hours,minutes,seconds].join(':');
    setTimeout(updateClock,1000);
}
 updateClock();
 antalEjKlaraOrdrar();
