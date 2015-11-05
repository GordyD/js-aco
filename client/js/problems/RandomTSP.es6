class RandomTSP {
  constructor(size, height, width, rng) {
    this.name = 'Random TSP';
    this.size = size;
    this.height = height;
    this.width = width;
    this.rng = rng;

    this.nodes = [];
    this.edges = [];
    this.distances = [];
    this.initialised = false;
    this._initialise();
  }

  getMaxCoordinateValue() {
    return this.nodes.reduce((prev, node) => { return Math.max(...node, prev)} , 0);
  }

  /**
   * Initialise a Random TSP.
   *  - can only be called once
   */
  _initialise() {
    if (!this.initialised) {
      this.initialised = true;
      this._createNodes()
      this._createEdges()
    } else {
      console.warn('RandomTSP is immutable');
    }
  }

  /**
   * Create a random set of nodes
   */
  _createNodes() {
    for (let x = 0; x < this.size; x++) {
      this.nodes.push(this._getPoint(this.height, this.width));
    }
  }

  /**
   * Create edges to create a fully connected graph G(V,E)
   */
  _createEdges() {
    for (let i = 0; i < this.size; i++) {
      this.distances[i] = [];
      for (let j = 0; j < this.size; j++) {
        if (i !== j) {
          let len = Math.sqrt(
            Math.pow(this.nodes[i][0] - this.nodes[j][0], 2) +
            Math.pow(this.nodes[i][1] - this.nodes[j][1], 2)
          );
          this.distances[i][j] = len;
          this.edges.push([i, j]);
        }
      }
    }
  }

  /**
   * Create a random point given a square grid
   * 
   * @param  {Number} size
   * 
   * @return {Array}
   */
  _getPoint(height, width) {
    var x = Math.round(this.rng() * height);
    var y = Math.round(this.rng() * width);
    return [x, y];
  }
}

export default RandomTSP;