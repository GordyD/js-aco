'use strict';

require('babel/register');

var Ant = require('./ant');

var ant = new Ant(5);

console.log(ant.getSize());
