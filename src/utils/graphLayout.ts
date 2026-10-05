import { GraphVertex, GraphData, GraphEdge } from '../types/graph';

/**
 * Calculates (x, y) coordinates for graphs in circular or layered DAG layouts.
 * Base coordinate space is 600x360, which GraphCanvas scales to the full 900x580 SVG.
 */
export function layoutGraph(
  data: GraphData,
  width: number = 600,
  height: number = 360
): GraphData {
  const vertices: GraphVertex[] = data.vertices.map((v) => ({ ...v }));
  const edges: GraphEdge[] = data.edges.map((e) => ({ ...e }));

  if (vertices.length === 0) {
    return { vertices, edges };
  }

  // If ALL vertices have predefined non-zero coordinates, retain them
  const hasAllCoordinates = vertices.every((v) => typeof v.x === 'number' && typeof v.y === 'number' && v.x > 0 && v.y > 0);
  if (hasAllCoordinates) {
    return { vertices, edges };
  }

  const n = vertices.length;

  // If single vertex, center it
  if (n === 1) {
    vertices[0].x = width / 2;
    vertices[0].y = height / 2;
    return { vertices, edges };
  }

  // Check if graph is a pure directed acyclic graph (for layered layout)
  const isPureDirected = edges.length > 0 && edges.every((e) => e.directed);
  if (isPureDirected && n >= 3 && n <= 10) {
    const isAcyclic = tryLayeredLayout(vertices, edges, width, height);
    if (isAcyclic) {
      return { vertices, edges };
    }
  }

  // Circular / Regular Polygon Layout fallback (Clean, symmetric, no overlapping)
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = Math.min(width, height) * 0.40;
  const radiusY = Math.min(width, height) * 0.38;

  vertices.forEach((vertex, i) => {
    // Start from top (-PI/2) and distribute evenly clockwise
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    vertex.x = Math.round(centerX + radiusX * Math.cos(angle));
    vertex.y = Math.round(centerY + radiusY * Math.sin(angle));
  });

  return { vertices, edges };
}

/**
 * Attempts a layered topological layout for Directed Acyclic Graphs (DAGs)
 */
function tryLayeredLayout(
  vertices: GraphVertex[],
  edges: GraphEdge[],
  width: number,
  height: number
): boolean {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  vertices.forEach((v) => {
    inDegree[v.id] = 0;
    adj[v.id] = [];
  });

  edges.forEach((e) => {
    if (inDegree[e.target] !== undefined) {
      inDegree[e.target] += 1;
    }
    if (adj[e.source]) {
      adj[e.source].push(e.target);
    }
  });

  // Calculate topological rank / layer
  const rank: Record<string, number> = {};
  const queue: string[] = [];

  vertices.forEach((v) => {
    if (inDegree[v.id] === 0) {
      queue.push(v.id);
      rank[v.id] = 0;
    }
  });

  let processedCount = 0;
  while (queue.length > 0) {
    const u = queue.shift()!;
    processedCount += 1;
    const currentRank = rank[u] || 0;

    for (const v of adj[u]) {
      inDegree[v] -= 1;
      rank[v] = Math.max(rank[v] || 0, currentRank + 1);
      if (inDegree[v] === 0) {
        queue.push(v);
      }
    }
  }

  // If cycle detected, layered layout cannot proceed
  if (processedCount < vertices.length) {
    return false;
  }

  // Group vertices by layer
  const layers: Record<number, GraphVertex[]> = {};
  let maxLayer = 0;

  vertices.forEach((v) => {
    const r = rank[v.id] || 0;
    if (!layers[r]) layers[r] = [];
    layers[r].push(v);
    if (r > maxLayer) maxLayer = r;
  });

  const numLayers = maxLayer + 1;
  const paddingX = 80;
  const paddingY = 75;
  const layerWidth = numLayers > 1 ? (width - paddingX * 2) / (numLayers - 1) : 0;

  for (let r = 0; r <= maxLayer; r++) {
    const layerVertices = layers[r] || [];
    const count = layerVertices.length;
    const x = numLayers === 1 ? width / 2 : paddingX + r * layerWidth;

    const layerHeight = height - paddingY * 2;
    const stepY = count > 1 ? layerHeight / (count - 1) : 0;

    layerVertices.forEach((v, idx) => {
      v.x = Math.round(x);
      v.y = Math.round(count === 1 ? height / 2 : paddingY + idx * stepY);
    });
  }

  return true;
}
