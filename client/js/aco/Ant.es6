class Ant {
  constructor(alpha, beta, Q) {
    this.alpha = alpha;
    this.beta = beta;
    this.Q = Q || 1;

    this.base = 0;
    this.walk = [];
    this.walkLength = null;
  }

  /**
   * Set the base node for this ant
   * 
   * @param {Number} baseId
   */
  setBase(base) {
    this.base = base;
  }

  /**
   * Construct a solution to the problem
   * 
   * @param  {Array} distances
   * @param  {Array} pheromones
   * @return {[type]}            [description]
   */
  doWalk(distances, pheromones) {
    this.walk = [this.base];
    this.walkLength = null;
    for(let i = 1; i < distances.length; i++) {
      this.walk.push(this.chooseNext(this.walk[i-1], distances, pheromones));
    }
    this.walk.push(this.walk[0]);
    this.walkLength = this.calculateWalkLength(distances);
  }

  chooseNext(currentNode, distances, pheromones) {
    let sumall = 0;
    let unvisited = [];
    for(let i = 0; i < distances.length; i++) {
      if (this.walk.indexOf(i) === -1) {
        unvisited.push(i);
      }
    }

    for(let i = 0; i < pheromones.length; i++) {
      if (i !== currentNode && unvisited.indexOf(i) !== -1) {
        sumall += Math.pow(pheromones[currentNode][i], this.alpha) * Math.pow((1/distances[currentNode][i]), this.beta);
      }
    }

    let probs = [];
    let summul = 0;
    for(let i = 0; i < distances[currentNode].length; i++) {
      if (i !== currentNode && unvisited.indexOf(i) !== -1) {
        let mul = Math.pow(pheromones[currentNode][i], this.alpha) * Math.pow((1/distances[currentNode][i]), this.beta);
        probs.push(mul/sumall);
        summul += mul;
      }
    }

    let rnd = Math.random();
    let x = 0;
    let tally = probs[x];
    while (rnd > tally && x < probs.length - 1) {
      tally += probs[++x];
    }
    
    return unvisited[x];
  }

  calculateWalkLength(distances) {
    let len = 0;
    for(let i = 1; i < this.walk.length; i++) {
      
      len += distances[this.walk[i-1]][this.walk[i]];
    }
    
    return len;
  }

  layPheromones(pheromones) {
    for(let i = 1; i < this.walk.length; i++) {
      pheromones[this.walk[i-1]][this.walk[i]] += (1/this.walkLength) * this.Q;
      pheromones[this.walk[i]][this.walk[i-1]] += (1/this.walkLength) * this.Q;
    }
  }
}

export default Ant;
