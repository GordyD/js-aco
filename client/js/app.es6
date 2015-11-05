/* global d3 */
import bows from 'bows';
import seedrandom from 'seedrandom';
import Display from './Display.es6';
import RandomTSP from './problems/RandomTSP.es6';
import Colony from './aco/Colony.es6';
import * as TSPReader from './reader/TSP.es6';
import * as utils from './utils.es6';

var problemFilename = utils.getQueryParam('problem') || null;

var seed = utils.getQueryParam('seed') || 'random!';
var problem = null;
var rng = seedrandom(seed);
var nodeCount = parseInt(utils.getQueryParam('nodes'),10) || 25;
var iterationLog = bows('Iteration');
var bestLog = bows('Optimum');
var size = 500;
var timeout = 0;
var tsp;
var display;
var colony;

if (problemFilename) {
  TSPReader.read(`http://localhost:8080/problems/${problemFilename}`)
  .then((loadedProblem) => {
    problem = loadedProblem
    create(problem);
  });
} else {
  create();
}

/**
 * Create random problem and set-up UI
 */
function create(problem) {
  if (utils.getQueryParam('debug') === 'true') {
    localStorage.debug = true;
  } else {
    localStorage.removeItem('debug');
  }

  tsp = problem || new RandomTSP(nodeCount, size, size, rng);
  display = new Display(size, size);
  display.clearBest();
  display.setMax(tsp.getMaxCoordinateValue() + 10);
  display.printProblemInfo(tsp);
  display.printGraph(tsp.nodes, tsp.edges);
  onIteration(0);
}

/**
 * Handler for when a new best path is found
 * 
 * [onNewBest description]
 * @param  {Number} i
 * @param  {Array} walk
 * @param  {Number} length
 */
function onNewBest(i, walk, length) {
  bestLog(length);
  display.addBest(i, walk, length);
  display.highlightOptimalWalk(walk);
}

/**
 * Handler for when an iteration is complete
 * 
 * @param  {Number} i
 * @param  {Array} pheromones
 */
function onIteration(i, pheromones) {
  iterationLog(i);
  d3.select('.iterationCount').text('Iteration: ' + i);
  var matrix = [];
  for(let i = 0; i < tsp.distances.length; i++) {
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

  display.printHeatMap(matrix, 0, 'distanceMatrix');
  display.printHeatMap(matrix, 1, 'pheromoneMatrix');
}

/**
 * Starts the process!
 */
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

/**
 * Event Handlers for Buttons
 */
d3.select('#refresh')
  .on('click', () => create(problem));

d3.select('#run')
  .on('click', () => run());



