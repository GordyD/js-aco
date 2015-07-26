/* global d3 */
import seedrandom from 'seedrandom';
import Display from './Display.es6';
import RandomTSP from './problems/RandomTSP.es6';
import Colony from './aco/Colony.es6';
import * as utils from './utils.es6';

var seed = utils.getQueryParam('seed') || 'random!';
var rng = seedrandom(seed);
var nodeCount = parseInt(utils.getQueryParam('nodes'),10) || 25;
var size = 500;
var timeout = 0;
var tsp;
var display;
var colony;

create();

function create() {
  tsp = new RandomTSP(nodeCount, size, size, rng);
  display = new Display(size, size);
  display.printGraph(tsp.nodes, tsp.edges);
  onIteration(0);
}

function onNewBest(i, walk, length) {
  display.addBest(i, walk.join(', '), length);
  display.highlightOptimalWalk(walk);
}

function onIteration(i, pheromones) {
  console.log('----- Iteration ' + i + ' -----');
  d3.select('.iterationCount').text('Iteration: ' + i);
  var matrix = [];
  for(let i = 0; i <tsp.distances.length; i++) {
    matrix[i] = [];
    for(let j = 0; j < tsp.distances[0].length; j++) {
      if (i !== j) {
        matrix[i][j] = [];
        matrix[i][j].push(tsp.distances[i][j]);
        if (pheromones) {
          matrix[i][j].push(pheromones[i][j]);
        }
      }
    }
  }
  display.printMatrix(matrix);
}

function run() {
  let ants = parseInt(d3.select('.js-ants').property('value'), 10) || 20;
  let iterations = parseInt(d3.select('.js-iterations').property('value'), 10) || 100;
  let alpha = parseFloat(d3.select('.js-alpha').property('value')) || 1.0;
  let beta = parseFloat(d3.select('.js-beta').property('value')) || 2.0;
  let pho = parseFloat(d3.select('.js-pho').property('value')) || 0.1;
  let pheromones = parseFloat(d3.select('.js-pheromones').property('value')) || 1.0;
  let Q = parseFloat(d3.select('.js-Q').property('value')) || 1.0;

  onIteration(0);

  colony = new Colony(ants, iterations, tsp.distances, alpha, beta, pho, pheromones, Q);

  display.clearBest();
  display.printSettings(colony);

  colony.initialise();
  colony.setOnNewBest(onNewBest);
  colony.setOnIteration(onIteration);
  colony.iterate();
}

d3.select('#refresh')
  .on('click', () => create());

d3.select('#run')
  .on('click', () => run());



