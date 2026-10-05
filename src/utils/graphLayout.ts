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
  const hasAllCoordinates = vertices.every(
    (v) => typeof v.x === 'number' && typeof v.y === 'number' && v.x > 0 && v.y > 0
  );
  if (hasAllCoordinates) {
    return { vertices, edges };
  }

  return applyCircularLayout({ vertices, edges }, width, height);
}

/**
 * Arranges vertices in a symmetric circular / elliptical layout
 */
export function applyCircularLayout(
  data: GraphData,
  width: number = 600,
  height: number = 360
): GraphData {
  const vertices = data.vertices.map((v) => ({ ...v }));
  const edges = data.edges.map((e) => ({ ...e }));
  const n = vertices.length;

  if (n === 1) {
    vertices[0].x = width / 2;
    vertices[0].y = height / 2;
    return { vertices, edges };
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = Math.min(width, height) * 0.42;
  const radiusY = Math.min(width, height) * 0.38;

  vertices.forEach((vertex, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    vertex.x = Math.round(centerX + radiusX * Math.cos(angle));
    vertex.y = Math.round(centerY + radiusY * Math.sin(angle));
  });

  return { vertices, edges };
}

/**
 * Arranges vertices in a 2-column or 3-column bipartite / grid layout
 */
export function applyGridLayout(
  data: GraphData,
  width: number = 600,
  height: number = 360
): GraphData {
  const vertices = data.vertices.map((v) => ({ ...v }));
  const edges = data.edges.map((e) => ({ ...e }));
  const n = vertices.length;

  if (n <= 1) return applyCircularLayout(data, width, height);

  const cols = n <= 4 ? 2 : n <= 8 ? 3 : 4;
  const rows = Math.ceil(n / cols);

  const padX = 90;
  const padY = 70;
  const stepX = (width - padX * 2) / Math.max(cols - 1, 1);
  const stepY = (height - padY * 2) / Math.max(rows - 1, 1);

  vertices.forEach((vertex, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    vertex.x = Math.round(padX + c * stepX);
    vertex.y = Math.round(padY + r * stepY);
  });

  return { vertices, edges };
}

/**
 * Arranges vertices horizontally from Left to Right (Layered / DAG layout)
 */
export function applyLayeredLayout(
  data: GraphData,
  width: number = 600,
  height: number = 360
): GraphData {
  const vertices = data.vertices.map((v) => ({ ...v }));
  const edges = data.edges.map((e) => ({ ...e }));

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

  // If cyclic, assign fallback ranks
  if (processedCount < vertices.length) {
    vertices.forEach((v, i) => {
      if (rank[v.id] === undefined) {
        rank[v.id] = i % 3;
      }
    });
  }

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
  const paddingY = 70;
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

  return { vertices, edges };
}
