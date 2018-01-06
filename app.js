/*jslint node: true */
/* eslint-env node */
'use strict';

// Require express, socket.io, and vue
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var csv = require("csvtojson");
 
var ingredientsDataName = "ingredients";
var transactionsDataName = "transactions";
var defaultLanguage = "en";

// Pick arbitrary port for server
var port = 3000;
app.set('port', (process.env.PORT || port));

// Serve static assets from public/
app.use(express.static(path.join(__dirname, 'public/')));
// Serve vue from node_modules as vue/
app.use('/vue', express.static(path.join(__dirname, '/node_modules/vue/dist/')));
// Serve diner.html as root page
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/ordering.html'));
});
// Serve lager.html as subpage
app.get('/staff', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/staff.html'));
});
// Serve kitchen.html as subpage
app.get('/kitchen', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/kitchen.html'));
});
// Serve lager.html as subpage
app.get('/lager', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/lager.html'));
});

// Serve stats.html as subpage
app.get('/stats', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/stats.html'));
});

// Serve historik.html as subpage
app.get('/historik', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/historik.html'));
});


// Store data in an object to keep the global namespace clean
function Data() {
  this.data = {};
  this.orders = {};
  this.currentOrderNumber = 0;
}

Data.prototype.getUILabels = function (lang) {
  var ui = require("./data/ui_" + (lang || defaultLanguage) + ".json");
  return ui;
};

/* 
  Returns a JSON object array of ingredients with the fields from 
  the CSV file, plus a calculated amount in stock, based on
  transactions.
*/
Data.prototype.getIngredients = function () {
  var d = this.data;
  return d[ingredientsDataName].map(function (obj) {
    obj.stock = d[transactionsDataName].reduce(function (sum, trans) {
      if (trans.ingredient_id === obj.ingredient_id) {
        return sum + trans.change;
      } else {
        return sum;
      }
    }, 0);
    return obj;
  });
};

/* 
  Function to load initial data from CSV files into the object
*/
Data.prototype.initializeData = function (table) {
  this.data[table] = [];
  var d = this.data[table];
  
  csv({checkType: true})
    .fromFile("data/" + table + ".csv")
    .on("json", function (jsonObj) {
      d.push(jsonObj);
    })
    .on("end", function () {
      console.log("Data for", table, "done");
    });
};

/*
  Adds an order to to the queue and makes an withdrawal from the
  stock. If you have time, you should think a bit about whether
  this is the right moment to do this.
*/

Data.prototype.getOrderNumber = function () {
  this.currentOrderNumber += 1;
  return this.currentOrderNumber;
}

Data.prototype.addOrder = function (order) {
  var orderId = this.getOrderNumber();
  this.orders[orderId] = order.order;
  this.orders[orderId].orderId = orderId;
  this.orders[orderId].done = false;
  var transactions = this.data[transactionsDataName],
    //find out the currently highest transaction id
    transId =  transactions[transactions.length - 1].transaction_id,
    i = order.order.ingredients,
    k;
    
  for (k = 0; k < i.length; k += 1) {
    transId += 1;
    transactions.push({transaction_id: transId,
                       ingredient_id: i[k].ingredient_id,
                       change: -1});
  }
    return orderId;
};

Data.prototype.changeLagerSaldo = function (item, saldo) {
  var transactions = this.data[transactionsDataName]
  var transId = transactions[transactions.length - 1].transaction_id
  transactions.push({transaction_id: transId,
                     ingredient_id: item.ingredient.ingredient_id,
                     change: saldo - item.ingredient.stock});
};

//ta emot meddelande från lager, justera lager skicka en "order" socket.on('updateStock') har funktion som kör transaktion med objectet
//justera genom createTransaction ioemit (till alla clienter)

Data.prototype.getAllOrders = function () {
  return this.orders;
};

Data.prototype.markOrderDone = function (orderId) {
  this.orders[orderId].done = true;
};

Data.prototype.markOrderNotDone = function (orderId) {
  this.orders[orderId].done = false;
};

/*-------------------------------------------------------------------------*/

var data = new Data();
// Load initial ingredients. If you want to add columns, do it in the CSV file.
data.initializeData(ingredientsDataName);
// Load initial stock. Make alterations in the CSV file.
data.initializeData(transactionsDataName);

// Readymade
var readymadeDataName = "readymade";
data.initializeData(readymadeDataName);

Data.prototype.getReadymade = function () {
var d = this.data;
return d[readymadeDataName];  
}

io.on('connection', function (socket) {
  // Send list of orders and text labels when a client connects
  socket.emit('initialize', { orders: data.getAllOrders(),
                          uiLabels: data.getUILabels(),
                          ingredients: data.getIngredients() });

  /*-------------------------------------------------------------------------*/

  // When someone orders something
  socket.on('order', function (order) {
    var orderId = data.addOrder(order);
    // send updated info to all connected clients, note the use of io instead of socket
    socket.emit('orderNumber', orderId);
    io.emit('currentQueue', { orders: data.getAllOrders(),
                          ingredients: data.getIngredients() });
  });
  // send UI labels in the chosen language
  socket.on('switchLang', function (lang) {
    socket.emit('switchLang', data.getUILabels(lang));
  });
  // when order is marked as done, send updated queue to all connected clients
  socket.on('orderDone', function (orderId) {
    data.markOrderDone(orderId);
    io.emit('currentQueue', {orders: data.getAllOrders() });
  });

  socket.on('orderNotDone', function (orderId) {
    data.markOrderNotDone(orderId);
    io.emit('currentQueue', {orders: data.getAllOrders() });
  });

  socket.on('updateStock', function (item, saldo) {
    data.changeLagerSaldo(item, saldo);
    io.emit('currentQueue', {ingredients: data.getIngredients() });
  });
    
    // send readyMade
  socket.emit('initialize', { orders: data.getAllOrders(),
                          uiLabels: data.getUILabels(),
                          ingredients: data.getIngredients(),
                          readymade: data.getReadymade() });
  });

/*-------------------------------------------------------------------------*/

var server = http.listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
});