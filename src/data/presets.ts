import { GraphData } from '../types/graph';

export interface PresetItem {
  id: string;
  category: 'TREE' | 'GRAPH';
  algorithm: string;
  title: string;
  description: string;
  badge: string;
  keys?: number[];
  deleteKeys?: number[];
  searchKey?: number;
  graph?: GraphData;
  startVertex?: string;
  method?: 'kahn_bfs' | 'source_removal';
}

export const GRAPH_PRESET_STANDARD_7: GraphData = {
  vertices: [
    { id: 'A', label: 'A', x: 200, y: 80, state: 'unvisited' },
    { id: 'B', label: 'B', x: 100, y: 180, state: 'unvisited' },
    { id: 'C', label: 'C', x: 200, y: 180, state: 'unvisited' },
    { id: 'D', label: 'D', x: 300, y: 180, state: 'unvisited' },
    { id: 'E', label: 'E', x: 60, y: 300, state: 'unvisited' },
    { id: 'F', label: 'F', x: 160, y: 300, state: 'unvisited' },
    { id: 'G', label: 'G', x: 300, y: 300, state: 'unvisited' },
  ],
  edges: [
    { id: 'e-AB', source: 'A', target: 'B', directed: false, state: 'unvisited' },
    { id: 'e-AC', source: 'A', target: 'C', directed: false, state: 'unvisited' },
    { id: 'e-AD', source: 'A', target: 'D', directed: false, state: 'unvisited' },
    { id: 'e-BE', source: 'B', target: 'E', directed: false, state: 'unvisited' },
    { id: 'e-BF', source: 'B', target: 'F', directed: false, state: 'unvisited' },
    { id: 'e-CF', source: 'C', target: 'F', directed: false, state: 'unvisited' },
    { id: 'e-DG', source: 'D', target: 'G', directed: false, state: 'unvisited' },
    { id: 'e-FG', source: 'F', target: 'G', directed: false, state: 'unvisited' },
  ],
};

export const GRAPH_PRESET_WEIGHTED_6: GraphData = {
  vertices: [
    { id: 'A', label: 'A', x: 100, y: 120, state: 'unvisited' },
    { id: 'B', label: 'B', x: 280, y: 80, state: 'unvisited' },
    { id: 'C', label: 'C', x: 200, y: 240, state: 'unvisited' },
    { id: 'D', label: 'D', x: 420, y: 120, state: 'unvisited' },
    { id: 'E', label: 'E', x: 380, y: 280, state: 'unvisited' },
    { id: 'F', label: 'F', x: 540, y: 200, state: 'unvisited' },
  ],
  edges: [
    { id: 'e-AB', source: 'A', target: 'B', weight: 4, directed: false, state: 'unvisited' },
    { id: 'e-AC', source: 'A', target: 'C', weight: 2, directed: false, state: 'unvisited' },
    { id: 'e-BC', source: 'B', target: 'C', weight: 1, directed: false, state: 'unvisited' },
    { id: 'e-BD', source: 'B', target: 'D', weight: 5, directed: false, state: 'unvisited' },
    { id: 'e-CD', source: 'C', target: 'D', weight: 8, directed: false, state: 'unvisited' },
    { id: 'e-CE', source: 'C', target: 'E', weight: 10, directed: false, state: 'unvisited' },
    { id: 'e-DE', source: 'D', target: 'E', weight: 2, directed: false, state: 'unvisited' },
    { id: 'e-DF', source: 'D', target: 'F', weight: 6, directed: false, state: 'unvisited' },
    { id: 'e-EF', source: 'E', target: 'F', weight: 3, directed: false, state: 'unvisited' },
  ],
};

export const GRAPH_PRESET_DIRECTED_DIJKSTRA: GraphData = {
  vertices: [
    { id: 'A', label: 'A', x: 80, y: 140, state: 'unvisited' },
    { id: 'B', label: 'B', x: 240, y: 70, state: 'unvisited' },
    { id: 'C', label: 'C', x: 240, y: 240, state: 'unvisited' },
    { id: 'D', label: 'D', x: 400, y: 70, state: 'unvisited' },
    { id: 'E', label: 'E', x: 400, y: 240, state: 'unvisited' },
    { id: 'F', label: 'F', x: 540, y: 150, state: 'unvisited' },
  ],
  edges: [
    { id: 'e-AB', source: 'A', target: 'B', weight: 4, directed: true, state: 'unvisited' },
    { id: 'e-AC', source: 'A', target: 'C', weight: 2, directed: true, state: 'unvisited' },
    { id: 'e-BC', source: 'B', target: 'C', weight: 1, directed: true, state: 'unvisited' },
    { id: 'e-BD', source: 'B', target: 'D', weight: 5, directed: true, state: 'unvisited' },
    { id: 'e-CB', source: 'C', target: 'B', weight: 1, directed: true, state: 'unvisited' },
    { id: 'e-CD', source: 'C', target: 'D', weight: 8, directed: true, state: 'unvisited' },
    { id: 'e-CE', source: 'C', target: 'E', weight: 10, directed: true, state: 'unvisited' },
    { id: 'e-DE', source: 'D', target: 'E', weight: 2, directed: true, state: 'unvisited' },
    { id: 'e-DF', source: 'D', target: 'F', weight: 6, directed: true, state: 'unvisited' },
    { id: 'e-EF', source: 'E', target: 'F', weight: 3, directed: true, state: 'unvisited' },
  ],
};

export const GRAPH_PRESET_DAG_TOPO: GraphData = {
  vertices: [
    { id: '1', label: '1', x: 80, y: 160, state: 'unvisited' },
    { id: '2', label: '2', x: 220, y: 80, state: 'unvisited' },
    { id: '3', label: '3', x: 220, y: 240, state: 'unvisited' },
    { id: '4', label: '4', x: 360, y: 80, state: 'unvisited' },
    { id: '5', label: '5', x: 360, y: 240, state: 'unvisited' },
    { id: '6', label: '6', x: 500, y: 160, state: 'unvisited' },
  ],
  edges: [
    { id: 'e-12', source: '1', target: '2', directed: true, state: 'unvisited' },
    { id: 'e-13', source: '1', target: '3', directed: true, state: 'unvisited' },
    { id: 'e-24', source: '2', target: '4', directed: true, state: 'unvisited' },
    { id: 'e-25', source: '2', target: '5', directed: true, state: 'unvisited' },
    { id: 'e-34', source: '3', target: '4', directed: true, state: 'unvisited' },
    { id: 'e-36', source: '3', target: '6', directed: true, state: 'unvisited' },
    { id: 'e-45', source: '4', target: '5', directed: true, state: 'unvisited' },
    { id: 'e-56', source: '5', target: '6', directed: true, state: 'unvisited' },
  ],
};

export const PRESET_LIBRARY: PresetItem[] = [
  // AVL Trees
  {
    id: 'avl-insert-standard',
    category: 'TREE',
    algorithm: 'avl-insert',
    title: 'AVL Insertion: [10, 20, 30, 40, 50, 25]',
    description: 'Triggers RR Single Rotation on 10, RR on 30, and RL Double Rotation on 20.',
    badge: 'RR & RL Rotations',
    keys: [10, 20, 30, 40, 50, 25],
  },
  {
    id: 'avl-insert-all-cases',
    category: 'TREE',
    algorithm: 'avl-insert',
    title: 'AVL Insertion: [50, 25, 10, 5, 20, 30, 40]',
    description: 'Triggers LL Single Rotation, LR Double Rotation, and cascading height rebalances.',
    badge: 'LL & LR Rotations',
    keys: [50, 25, 10, 5, 20, 30, 40],
  },
  {
    id: 'avl-delete-mixed',
    category: 'TREE',
    algorithm: 'avl-delete',
    title: 'AVL Deletion: Delete [70, 50, 60, 20]',
    description: 'Leaf removal, 1-child removal, 2-child successor substitution, and LL rotation at root.',
    badge: 'Successor & Rotations',
    keys: [40, 20, 60, 10, 30, 50, 70],
    deleteKeys: [70, 50, 60, 20],
  },

  // 2-3 Trees
  {
    id: '23-insert-cascading',
    category: 'TREE',
    algorithm: '2-3-insert',
    title: '2-3 Tree Insertion: [10, 20, 30, 40, 50, 60, 70]',
    description: 'Leaf 4-node split, 2-node parent absorption, and cascading split up to root.',
    badge: 'Split & Promote',
    keys: [10, 20, 30, 40, 50, 60, 70],
  },
  {
    id: '23-search-success-fail',
    category: 'TREE',
    algorithm: '2-3-search',
    title: '2-3 Tree Search: Find 70 (Success) & 35 (Failure)',
    description: 'Multi-way comparison trace across root [40], right child [60, 80], and leaves.',
    badge: 'Search Trace',
    keys: [40, 20, 60, 10, 30, 50, 70, 80, 90],
    searchKey: 70,
  },

  // Splay Trees
  {
    id: 'splay-insert-trace',
    category: 'TREE',
    algorithm: 'splay-insert',
    title: 'Splay Insertion: [10, 20, 5, 15]',
    description: 'Demonstrates Zig, Zig-Zig, and Zig-Zag rotations bringing each inserted node to root.',
    badge: 'Zig-Zig & Zig-Zag',
    keys: [10, 20, 5, 15],
  },
  {
    id: 'splay-search-trace',
    category: 'TREE',
    algorithm: 'splay-search',
    title: 'Splay Search: Search 20 (Found) & 35 (Not Found)',
    description: 'Splays found node 20 to root; splays last-accessed ancestor 40 on missing key 35.',
    badge: 'Search & Splay',
    keys: [50, 30, 10, 40, 20],
    searchKey: 20,
  },
  {
    id: 'splay-delete-bottom-up',
    category: 'TREE',
    algorithm: 'splay-delete',
    title: 'Splay Deletion (Bottom-Up): Delete Key 20',
    description: 'Splays 20 to root, severs root into L and R, splays max(L) to root of L, attaches R.',
    badge: 'Split & Join',
    keys: [30, 15, 40, 5, 20, 50],
    searchKey: 20,
  },

  // Red-Black Trees
  {
    id: 'rb-insert-exam-set',
    category: 'TREE',
    algorithm: 'rb-insert',
    title: 'Red-Black Insertion: [10, 20, 30, 15, 25, 5, 1]',
    description: 'Complete trace of Case 1 (Uncle RED recolor), Case 2 (Triangle rotate), Case 3 (Line rotate & recolor).',
    badge: 'Cases 1, 2 & 3',
    keys: [10, 20, 30, 15, 25, 5, 1],
  },

  // Graphs
  {
    id: 'bfs-standard',
    category: 'GRAPH',
    algorithm: 'bfs',
    title: 'BFS Traversal (Start: A)',
    description: '7-node graph level-by-level queue progression, tree edges vs cross edges.',
    badge: 'Queue Trace',
    graph: GRAPH_PRESET_STANDARD_7,
    startVertex: 'A',
  },
  {
    id: 'dfs-standard',
    category: 'GRAPH',
    algorithm: 'dfs',
    title: 'DFS Traversal (Start: A)',
    description: 'Recursion call stack trace with discovery d[v] and finish f[v] timestamps.',
    badge: 'Stack & Timestamps',
    graph: GRAPH_PRESET_STANDARD_7,
    startVertex: 'A',
  },
  {
    id: 'dijkstra-shortest-path',
    category: 'GRAPH',
    algorithm: 'dijkstra',
    title: "Dijkstra's Algorithm (Start: A)",
    description: '6-node directed weighted graph with relaxation table and path reconstruction.',
    badge: 'Relaxation Table',
    graph: GRAPH_PRESET_DIRECTED_DIJKSTRA,
    startVertex: 'A',
  },
  {
    id: 'kruskal-mst',
    category: 'GRAPH',
    algorithm: 'kruskal',
    title: "Kruskal's MST Algorithm",
    description: 'Sorted edge evaluation, DSU Find/Union set merges, cycle detection, Total Cost = 13.',
    badge: 'DSU & Cycle Check',
    graph: GRAPH_PRESET_WEIGHTED_6,
  },
  {
    id: 'prim-mst',
    category: 'GRAPH',
    algorithm: 'prim',
    title: "Prim's MST Algorithm (Start: A)",
    description: 'Growing tree cut edges evaluated step-by-step, Total Cost = 13.',
    badge: 'Cut Edges',
    graph: GRAPH_PRESET_WEIGHTED_6,
    startVertex: 'A',
  },
  {
    id: 'topo-kahn',
    category: 'GRAPH',
    algorithm: 'topo-kahn',
    title: "Topological Sort (Kahn's BFS Method)",
    description: '6-node DAG with in-degree array decrements and FIFO queue processing.',
    badge: "Kahn's Queue",
    graph: GRAPH_PRESET_DAG_TOPO,
    method: 'kahn_bfs',
  },
  {
    id: 'topo-source-removal',
    category: 'GRAPH',
    algorithm: 'topo-source',
    title: 'Topological Sort (Source Removal Method)',
    description: 'Repeatedly identifying 0 in-degree vertices, removing outgoing edges from the DAG.',
    badge: 'Source Removal',
    graph: GRAPH_PRESET_DAG_TOPO,
    method: 'source_removal',
  },
];
