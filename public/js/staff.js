'use strict';

function updateClock(){
var now = new Date(),
    hours = now.getHours(),
    minutes = now.getMinutes();
    if (hours < 10) {
        hours = "0" + hours
    };
    if (minutes < 10) {
        minutes = "0" + minutes
    };
document.getElementById('clock').innerHTML = [hours,minutes].join(':');
setTimeout(updateClock,1000);
}

updateClock();
