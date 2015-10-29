# JS ACO

JS ACO is a visual demo of Ant Colony Optimisation written in Javascript (ES6). It contains basic example of how ACO works given a randomly generated TSP. The basic parameters of the Ant System are available to be tuned.

The UI will show the current optimum tour, and also a heat map of the heuristic (distance) matrix plus a pheromone matrix. This information will update as the algorithm runs.

![JS-ACO Screenshot](http://i.imgur.com/WSlay5k.gif)

I intend to:
 - add different ACO algorithms to this project
 - enable importing TSP problems from TSP lib

## Setup

 - Clone the repository `git clone https://github.com/GordyD/js-aco`
 - `cd js-aco`
 - `npm install`
 - `bower install`

## To run in development

 - Run `npm run develop`
 - Go to `http://localhost:8080`
 - To increase problem size set query param `nodes` to an Integer
 - To use a different seed set query param `seed` to a String or Number
