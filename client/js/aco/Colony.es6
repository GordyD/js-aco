import _ from 'lodash';
import Ant from './Ant.es6';

var TIMEOUT = 50;

class Colony {
  constructor(popSize, maxIterations, distances, alpha, beta, pho, ip, Q) {
    this.popSize = popSize;
    this.maxIterations = maxIterations;
    this.distances = distances;

    this.alpha = alpha;
    this.beta = beta;
    this.pho = pho;
    this.Q = Q;
    this.ip = ip;

    this.population = [];
    this.pheromones = [];
    this.bestLength = null;
    this.bestSolution = null;
    this.continue = false;

    this.onNewBest = null;
  }

  setOnNewBest(onNewBest) {
    this.onNewBest = onNewBest;
  }

  setOnIteration(onIteration) {
    this.onIteration = onIteration;
  }

  initialise() {
    this.population = [];
    this.pheromones = [];
    this.bestSolution = null;
    this.continue = true;

    for(let i = 0; i < this.popSize; i++) {
      this.population[i] = new Ant(this.alpha, this.beta, this.Q);
    }

    for(let x = 0; x < this.distances.length; x++) {
      this.pheromones[x] = [];
      for(let y = 0; y < this.distances.length; y++) {
        if (x !== y) {
          this.pheromones[x][y] = this.ip;
        }
      }
    }
  }

  iterate() {
    let x = 0, that = this;
    while (x < this.maxIterations && this.continue) {
      doWork(x);
      x++;
    }

    function doWork(x) {
      setTimeout(function() {
        that.sendOutAnts();
        that.updatePheromones();
        that.daemonActions(x+1);
      }, TIMEOUT);
    }
  }

  sendOutAnts() {
    for(let i = 0; i < this.popSize; i++) {
      //console.log('Ant', i, this.population[i]);
      this.population[i].doWalk(this.distances, this.pheromones);
    }
  }

  updatePheromones() {
    this.evaporatePheromones();
    for(let i = 0; i < this.popSize; i++) {
      this.population[i].layPheromones(this.pheromones);
    }
  }

  evaporatePheromones() {
    for(let x = 0; x < this.distances.length; x++) {
      for(let y = 0; y < this.distances.length; y++) {
        if (x !== y) {
          this.pheromones[x][y] = (1 - this.pho) * this.pheromones[x][y];
        } 
      }
    }
  }

  daemonActions(x) {
    for(let i = 0; i < this.popSize; i++) {
      if (!this.bestSolution || this.population[i].walkLength < this.bestLength) {
        this.bestSolution = _.cloneDeep(this.population[i].walk);
        this.bestLength = _.clone(this.population[i].walkLength);
        if (this.onNewBest) {
          this.onNewBest(x, this.bestSolution, this.bestLength);
        }
      }
    }
    if (this.onIteration) {
      this.onIteration(x, _.clone(this.pheromones))
    };
  }
}

export default Colony;