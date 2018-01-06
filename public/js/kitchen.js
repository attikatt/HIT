/*jslint es5:true, indent: 2 */
/*global sharedVueStuff, Vue, socket */
'use strict';

/* Active orders */
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

/* Samliga ordrar*/
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
             this.active = !this.active;
             if (this.order.type === "juice"){
               /*Meddela Vue att den är aktiv*/
               this.$emit('active-order-juice');
               //vm.activeOrderStage['juice']="not-started";

               /* Presentera i activa rutan */
               document.getElementById('notDone1').checked = true;
               document.getElementById('orderDiv1').style.border = "2pt solid white";
             }
             if (this.order.type === "smoothie"){
               /*Meddela Vue att den är aktiv*/
               this.$emit('active-order-smoothie');
               //vm.activeOrderStage['smoothie']="not-started";

               /* Presentera i activa rutan */
               document.getElementById('notDone2').checked = true;
               document.getElementById('orderDiv2').style.border = "2pt dashed white";
             }
           }
        }
});

var vm = new Vue({
  el: '#mainDiv',
  mixins: [sharedVueStuff], // include stuff that is used both in the ordering system and in the kitchen
  data: {
    activeOrder: {juice: "no Juice chosen", smoothie:"no Smoothie chosen"},
    activeOrderStage: {juice: "not-started", smoothie: "not-started" },
    startedOrders: []
  },
  methods: {
    getActiveOrderStage: function(order) {
      console.log(order);
        if (this.activeOrder[order.type] == order)
          return this.activeOrderStage[order.type];
    },
    getStarted: function(order) {
      if (this.startedOrders.length > 0 ){
        if (order.orderId = this.startedOrders[0].orderId){
          console.log("Match");
          console.log("Orderns id");
          console.log(order.orderId);
          console.log("Arrayens id");
          console.log(this.startedOrders[0].orderId);
        }
      }
    },
    ejPaborjad: function (type,orderDiv,style){
      this.activeOrderStage[type] = "not-started";
      document.getElementById(orderDiv).style.border = "2pt " + style + " white";
    },
    paborjad: function(order,type,orderDiv,style){
      this.activeOrderStage[type] = "started";
      this.startedOrders.push(order);
      document.getElementById(orderDiv).style.border = "2pt " + style + " yellow";
    },
    klar: function(order,type,orderDiv,style,button){
      document.getElementById(orderDiv).style.border = "2pt " + style + " white";
      this.activeOrderStage[type] = "not-started";
      this.activeOrder[type] = "none is chosen";
      document.getElementById(button).checked = true;
      vm.markDone(order.orderId);
    },
    markDone: function (orderid) {
      socket.emit("orderDone", orderid);
    }
    }
  }
);

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
    document.getElementById('clock').innerHTML = Object.keys(vm.orders).length + " ordrar i kön"+ " " + [hours,minutes,seconds].join(':');
    setTimeout(updateClock,1000);
}
 updateClock();
