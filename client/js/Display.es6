/* global d3 */

class Display {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }

  /**
   * Print the current settings for the Ant Colony
   * 
   * @param  {Object} colony
   */
  printSettings(colony) {
    d3.select('.settings .ants .value').html(colony.popSize);
    d3.select('.settings .iterations .value').html(colony.maxIterations);
    d3.select('.settings .alpha .value').html(colony.alpha);
    d3.select('.settings .beta .value').html(colony.beta);
    d3.select('.settings .pho .value').html(colony.pho);
    d3.select('.settings .pheromones .value').html(colony.ip);
    d3.select('.settings .Q .value').html(colony.Q);
  }

  /**
   * Draw the graph given a set of nodes and edges
   * 
   * @param  {[type]} edges [description]
   * @param  {[type]} nodes [description]
   * @return {[type]}       [description]
   */
  printGraph(nodes, edges) {
    d3.select('.graph').select('svg').remove();
    let chart = d3.select('.graph')
      .append('svg')
      .attr('height', this.height)
      .attr('width', this.width);

    let es = chart.selectAll('line').data(edges)
      .enter()
      .append('line')
      .attr('class', (d) => 'edge ' + 'e-' + d[0] + '-' + d[1])
      .attr('x1', (d) => nodes[d[0]][0])
      .attr('y1', (d) => nodes[d[0]][1])
      .attr('x2', (d) => nodes[d[1]][0])
      .attr('y2', (d) => nodes[d[1]][1])

    let ds = chart.selectAll('circle').data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => d[0])
      .attr('cy', (d) => d[1])
      .attr('r', 3);
  }

  highlightOptimalWalk(walk) {
    d3.selectAll('.bestWalkEdge').classed('bestWalkEdge', false);

    for(let i = 1; i < walk.length; i++) {
      let edgeClass = '.e-' + walk[i-1] + '-' + walk[i];
      d3.select(edgeClass).classed('bestWalkEdge', true);
    }

    let edgeClass = '.e-' + walk[walk.length-1] + '-' + walk[0];
    d3.select(edgeClass).classed('bestWalkEdge', true);
  }

  /**
   * Clear the best record
   */
  clearBest(iteration, walk, length) {
    var rows = [iteration, walk, length];
    d3.select('.bests').select('table').select('tbody')
    .selectAll('tr')
    .remove();
  }

  /**
   * Add a new best tour to the best tour table
   * 
   * @param {Number} iteration
   * @param {Array} walk
   * @param {Number} length
   */
  addBest(iteration, walk, length) {
    var rows = [iteration, walk, length];
    d3.select('.bests').select('table').select('tbody')
    .append('tr')
    .selectAll('td')
    .data(rows)
    .enter()
    .append('td')
    .html(function(d) {
      return d;
    });
  }

  /**
   * Print the heuristic and pheromone matrix
   * 
   * @param  {Array} matrix
   */
  printMatrix(matrix) {
    d3.select('.matrix').select('table').remove();
    let table = d3.select('.matrix').append('table').attr('class', 'pure-table pure-table-bordered'),
      thead = table.append('thead'),
      tbody = table.append('tbody'),
      columns = d3.range(1, matrix.length + 1);

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(columns)
      .enter()
      .append('th')
      .text(function(column) {
        return column;
      });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
      .data(matrix)
      .enter()
      .append('tr');

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
      .data(function(row) {
        return columns.map(function(column) {
          return {
            column: column,
            h: (row[column-1]) ? row[column - 1][0] : false,
            p: (row[column-1]) ?  row[column - 1][1] : false
          };
        });
      })
      .enter()
      .append('td')
      .html(function(d) {
        return (!!d.h) ? d.h.toFixed(2) + ((!!d.p) ? ' - ' + d.p.toFixed(2) : '') : 'X';
      });
  }
}

export default Display;