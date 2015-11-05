import fetch from 'isomorphic-fetch';
import _ from 'lodash';
import geolib from 'geolib';

import TSP from '../problems/TSP.es6';

var supported = {
  edgeWeightTypes: [
    'explicit', //has edgeWeights section
  ]
};

export function read(url) {
    return fetch(url)
    .then(response => response.text())
    .then(processTSPFile);

}

function processTSPFile(contents) {
  var data = contents.split('\n')
    .map(line => line.split(':').map(cell => cell.trim()))
    .filter(row => (row.length !== 1 || (row[0] !== '' && row[0] !== 'EOF')));

  var type = getField('type', data);

  if (!type || type !== 'TSP') {
    console.error('Cannot read this file!')
  }

  var name = getField('name', data);
  var desc = getField('comment', data);
  var size = getField('dimension', data);
  var edgeWeightType = getField('edge_weight_type', data);
  var edgeWeightFormat = getField('edge_weight_format', data);
  var displayDataType = getField('display_data_type', data);
  var nodeCoordType = getField('node_coord_type', data);

  var edgeWeights = getSection('edge_weight_section', data);
  var displayData = getSection('display_data_section', data);
  var nodeCoordData = getSection('node_coord_section', data);

  var edges = getEdges(size);
  var distances = getDistances(size, edgeWeightType, edgeWeightFormat, edgeWeights, nodeCoordData);
  var nodes = getNodes(displayDataType, displayData, nodeCoordType, nodeCoordData);

  return new TSP(name, desc, size, nodes, edges, distances);
}

function getNodes(displayType, displayData, nodeType, nodeCoords) {
  nodeType = nodeType || 'TWOD_COORDS'; // This default property is not usually defined
  if (displayType) {
    switch(displayType) {
      case 'TWOD_DISPLAY':
        return createNodesFrom2DList(displayData);
      default:
        console.error(displayType + ' is currently not supported!');
        return null;
    }
  } else if (nodeType && nodeCoords) {
    switch(nodeType) {
      case 'TWOD_COORDS':
        return createNodesFrom2DList(nodeCoords);
      default:
        console.error(displayType + ' is currently not supported!');
        return null;
    }
  } else {
    console.error('Not enough information to generate node coordinates!');
    return null;
  }
}

function createNodesFrom2DList(data) {
  var nodes = [];
  for(let i = 0; i < data.length; i++) {
    nodes.push([parseFloat(data[i][1]), parseFloat(data[i][2])]);
  }

  return nodes;
}

function getEdges(size) {
  var edges = [];
  for(let i = 0; i < size; i++) {
    for(let j = 0; j < size; j++) {
      if (i !== j) {
        edges.push([i, j]);
      }
    }
  }

  return edges;
}

function getDistances(size, type, format, weights, nodeCoords) {
  switch(type) {
    case 'EXPLICIT': 
      return createDistanceMatrixFromEdgeWeights(format, weights, size);
    case 'EUC_2D':
      return createDistanceMatrixFromEuc2DNodeCoords(nodeCoords);
    case 'GEO':
      return createDistanceMatrixFromGeoNodeCoords(nodeCoords);
    default: 
      console.error(type + ' type is not currently supported');
      return null;
  }
}


function createDistanceMatrixFromEdgeWeights(format, weights, size) {
  switch(format) {
    case 'UPPER_ROW': 
      return distancesFromUpperRow(weights, size);
    case 'FULL_MATRIX':
      return distancesFromFullMatrix(weights, size);
    default: 
      console.error(format + ' format is not currently supported');
      return null;
  }
}

function distancesFromUpperRow(weights, size) {
  var matrix = [];
  for(let i = 0; i < size; i++) {
    matrix[i] = [];
    for(let j = 0; j < size; j++) {
      matrix[i][j] = 0;
    }
  }

  for(let i = 0; i < weights.length; i++) {
    for(let j = 0; j < weights[i].length; j++) {
      var ja = (j+i) + 1;
      matrix[i][ja] = parseFloat(weights[i][j]);
      matrix[ja][i] = parseFloat(weights[i][j]);
    }
  }

  return matrix;
}

function distancesFromFullMatrix(weights, size) {
  var matrix = [];
  for(let i = 0; i < weights.length; i++) {
    matrix[i] = [];
    for(let j = 0; j < weights[i].length; j++) {
      matrix[i][j] = parseFloat(weights[i][j]);
    }
  }

  return matrix;
}

function createDistanceMatrixFromEuc2DNodeCoords(nodeCoords) {
  var matrix = [];
  for(let i = 0; i < nodeCoords.length; i++) {
    matrix[i] = [];
    for(let j = 0; j < nodeCoords.length; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        var x = nodeCoords[i];
        var y = nodeCoords[j];
        matrix[i][j] = Math.sqrt(
          Math.pow(parseFloat(x[1]) - parseFloat(y[1]), 2) + 
          Math.pow(parseFloat(x[2]) - parseFloat(y[2]), 2)
        );
      }
      
    }
  }

  return matrix;
}

function createDistanceMatrixFromGeoNodeCoords(nodeCoords) {
  var matrix = [];
  for(let i = 0; i < nodeCoords.length; i++) {
    matrix[i] = [];
    for(let j = 0; j < nodeCoords.length; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        var x = nodeCoords[i];
        var y = nodeCoords[j];
        matrix[i][j] = geolib.getDistance(
          { latitude: parseFloat(x[1]), longitude: parseFloat(x[2]) },
          { latitude: parseFloat(y[1]), longitude: parseFloat(y[2]) }
        )/1000;
      }
      
    }
  }

  return matrix;
}

function getSection(key, data) {
  var filtered = _.filter(data, row => (row.length == 1 && row[0].toLowerCase() === key));

  if (!filtered) {
    return null;
  }

  var startIndex = data.indexOf(filtered[0]) + 1;

  var metaSection = data.slice(startIndex).reduce((prev, row) => {
    if (!prev.foundText && !isNaN(parseInt(row[0][0],10))) {
      prev.data.push(row[0].split(' ').filter(x => x !== ''));
    } else {
      prev.foundText = true;
    }

    return prev;
  }, {
    data: [],
    foundText: false
  });

  return metaSection.data;
}

function getField(key, data) {
  var filtered = _.filter(data, row => (row.length == 2 && row[0].toLowerCase() === key));

  if (filtered.length === 0) {
    return null;
  }

  return filtered[0][1];
}