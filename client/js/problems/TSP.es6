class TSP {
  constructor(name, description, size, nodes, edges, distances) {
    this.name = name;
    this.description = description;
    this.size = size;
    this.nodes = nodes;
    this.edges = edges;
    this.distances = distances;
  }

  getMaxCoordinateValue() {
    return this.nodes.reduce((prev, node) => { return Math.max(...node, prev) } , 0);
  }
}

export default TSP;