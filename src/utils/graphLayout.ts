import { GraphVertex, GraphData } from '../types/graph';

/**
 * Calculates (x, y) coordinates for graphs in circular or custom preset layouts
 */
export function layoutGraph(
  data: GraphData,
  width: number = 700,
  height: number = 450
): GraphData {
  const vertices = [...data.vertices];
  const edges = [...data.edges];

  // If vertices already have predefined coordinates within range, retain them with responsive scaling
  const hasCoordinates = vertices.every((v) => v.x > 0 && v.y > 0);
  if (hasCoordinates) {
    return { vertices, edges };
  }

  // Circular layout fallback
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.38;
  const n = vertices.length;

  vertices.forEach((vertex, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    vertex.x = centerX + radius * Math.cos(angle);
    vertex.y = centerY + radius * Math.sin(angle);
  });

  return { vertices, edges };
}
