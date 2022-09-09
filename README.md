# Graph Algorithms Visualizer

A visualization tool for graph algorithms. You can use it here: [https://sasecai.github.io/Graph-Algorithms-Visualizer/](https://sasecai.github.io/Graph-Algorithms-Visualizer/)

## How to use it:
### Enter input

The tool is able to draw directed or undirected graphs.

Enter vertices information in the following format:
`Node 1` `Node 2` `(Weight)`
<br>All values should be integers. Weight can be negative.

![alt text](https://github.com/sasecai/Graph-Algorithms-Visualizer/blob/main/DemonstrationInput.png)
![alt text](https://github.com/sasecai/Graph-Algorithms-Visualizer/blob/main/DemonstrationOutput.png)

## Algorithms

### Minimum spanning tree

Given an undirected graph, the minimum spanning tree is highlighted in red (minimum spanning forest in case the graph is unconnected) using [Kruskal's algorithm](https://en.wikipedia.org/wiki/Kruskal%27s_algorithm).

### Shortest path

Highlights the shortest path between two nodes. It is computed using [Bellman-Ford Algorithm](https://en.wikipedia.org/wiki/Bellman–Ford_algorithm) to account for negative cycles.

### Hamiltonian circuit

A Hamiltonian circuit is a circuit that visits every vertex once with no repeats. 
