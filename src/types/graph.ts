export type GraphAlgorithmType = 
  | 'bfs' 
  | 'dfs' 
  | 'dijkstra' 
  | 'kruskal' 
  | 'prim' 
  | 'topo_source' 
  | 'topo_kahn';

export type VertexState = 'unvisited' | 'visiting' | 'visited' | 'current' | 'completed';

export type EdgeState = 
  | 'unvisited' 
  | 'examining' 
  | 'tree_edge' 
  | 'back_edge' 
  | 'cross_edge' 
  | 'mst_edge' 
  | 'rejected_cycle'
  | 'relaxed';

export interface GraphVertex {
  id: string;
  label: string;
  x: number;
  y: number;
  state: VertexState;
  
  // Specific algorithm metrics
  distance?: number;
  predecessor?: string | null;
  discoveryTime?: number;
  finishTime?: number;
  inDegree?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight?: number;
  directed?: boolean;
  state: EdgeState;
}

export interface GraphData {
  vertices: GraphVertex[];
  edges: GraphEdge[];
}

export interface DSUSet {
  parent: Record<string, string>;
  rank: Record<string, number>;
  sets: Record<string, string[]>;
}

export interface GraphPreset {
  id: string;
  name: string;
  description: string;
  algorithm: GraphAlgorithmType;
  startVertex?: string;
  graph: GraphData;
}
