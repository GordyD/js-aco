/* global d3 */
import _ from 'lodash';

class Display {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }

  setMax(max) {
    this.max = max;
  }

  printProblemInfo(problem) {
    d3.select('.problemInfo .problemName .value').html(problem.name);
    d3.select('.problemInfo .problemSize .value').html(problem.size);
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
   * @param  {Array} edges
   * @param  {Array} nodes
   */
  printGraph(nodes, edges) {
    d3.select('.graph').select('svg').remove();
    let factor = this.max/this.height;

    let chart = d3.select('.graph')
      .append('svg')
      .attr('height', this.height)
      .attr('width', this.width)
      .attr('viewBox', `-8 -8 ${this.max} ${this.max}`);

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
      .attr('r', 3*factor)
      .on('mouseover', function(d, i) {
        console.log(d, i);
      });
  }

  highlightOptimalWalk(walk) {
    let factor = this.max/this.height;
    var style = `stroke-width: ${2*factor}px; stroke-dasharray: ${3*factor}px ${5*factor}px`;
    
    // Make sure existing walk is cleared
    this.clearHighlightedWalk();

    for(let i = 1; i < walk.length; i++) {
      let edgeClass = '.e-' + walk[i-1] + '-' + walk[i];
      d3.select(edgeClass)
        .classed('bestWalkEdge', true)
        .attr('style', style);
    }

    let edgeClass = '.e-' + walk[walk.length-1] + '-' + walk[0];
    d3.select(edgeClass)
      .classed('bestWalkEdge', true)
      .attr('style', style);;
  }

  clearHighlightedWalk() {
    d3.selectAll('.bestWalkEdge')
      .classed('bestWalkEdge', false)
      .attr('style', 'stroke:none;');
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
    walk = walk.map(x => x+1);
    walk = walk.join(' ,');
    var rows = [iteration, walk, length.toFixed(2)];
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
  printNumberMatrix(matrix) {
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

  getMin(matrix, key) {
    return _.reduce(matrix, (prev, row) => {
      var mapped = _.map(row, (x) => {
        if (!x) return Number.MAX_VALUE;
        return x[key]
      });

      var rowMin = _.min(mapped);
      
      return (rowMin < prev) ? rowMin : prev;
    }, Number.MAX_VALUE);
  }

  getMax(matrix, key) {
    return _.reduce(matrix, (prev, row) => {
      var rowMax = _.max(_.map(row, (x) => {
        if (!x) return null;

        return x[key]
      }));
      return (rowMax > prev) ? rowMax : prev;
    }, 0)
  }

  printHeatMap(matrix, key, className) {
    key = key || 0;
    let colors = ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'];

    d3.select('.'+className).select('svg').remove();
    let heatmap = d3.select('.'+className).append('svg')
      .attr('height', this.height)
      .attr('width', this.width);

    let columns = columns = d3.range(1, matrix.length + 1);
    let max = this.getMax(matrix, key);
    let min = this.getMin(matrix, key);
    let scale = d3.scale.linear().domain([min, max]).range([0,colors.length-1]);

    let size = this.height/matrix.length;

    // append the header row
    let gs = heatmap
      .selectAll('g')
      .data(matrix)
      .enter()
      .append('g')
      .attr('id', (d, i) => i) 
      .attr('transform', (d, i) => { 
        var x = (i * (size));
        return `translate(${x}, 0)`;
      });

    // create a row for each object in the data
    var rects = gs.selectAll('rect')
      .data(function(row) {
        return columns.map(function(column) {
          return {
            column: column,
            0: (row[column-1]) ? row[column - 1][0] : false,
            1: (row[column-1]) ?  row[column - 1][1] : false
          };
        });
      })
      .enter()
      .append('rect')
      .attr('class', 'heat-low')
      .attr('y', (d, i) => { 
        return (i * (size));
      })
      .attr('height', size)
      .attr('width', size)
      .attr('style', (d, i) => {
        if (d[key] === false) {
          return 'fill:white';
        } else {
          return 'fill:'+ colors[Math.round(scale(d[key]))];
        }
      });
  }
}

export default Display;