import { GraphData, GraphVertex, GraphEdge } from '../../types/graph';
import { StepSnapshot, TraceTableRow } from '../../types/animation';

export function generateDijkstraSteps(graph: GraphData, startVertexId: string): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  const vertices: GraphVertex[] = graph.vertices.map((v) => ({ ...v, state: 'unvisited' }));
  const edges: GraphEdge[] = graph.edges.map((e) => ({ ...e, state: 'unvisited' }));

  const dist: Record<string, number> = {};
  const pred: Record<string, string | null> = {};
  const visited = new Set<string>();

  vertices.forEach((v) => {
    dist[v.id] = Infinity;
    pred[v.id] = null;
  });
  dist[startVertexId] = 0;

  function cloneGraphState() {
    return {
      vertices: vertices.map((v) => ({
        ...v,
        distance: dist[v.id],
        predecessor: pred[v.id],
      })),
      edges: edges.map((e) => ({ ...e })),
    };
  }

  function getPathString(destId: string): string {
    if (dist[destId] === Infinity) return 'Unreachable';
    const path: string[] = [];
    let curr: string | null = destId;
    while (curr) {
      path.unshift(curr);
      curr = pred[curr];
    }
    return path.join(' → ');
  }

  function collectDijkstraRows(currentU: string | null = null): TraceTableRow[] {
    return vertices.map((v) => ({
      id: `dijkstra-row-${v.id}`,
      cells: [
        v.id,
        dist[v.id] === Infinity ? '∞' : dist[v.id],
        pred[v.id] ? `${pred[v.id]}` : '—',
        visited.has(v.id) ? 'SETTLED (Final)' : 'UNSETTLED',
        getPathString(v.id),
      ],
      isHighlighted: v.id === currentU,
    }));
  }

  // Initial Step
  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: `Initialize Dijkstra's Algorithm from Source ${startVertexId}`,
    subtitle: `dist[${startVertexId}] = 0, all other dist[v] = ∞`,
    category: 'GRAPH',
    algorithmName: "Dijkstra's Shortest Path",
    facultyExplanation: `Initialize distance array: Set dist[${startVertexId}] = 0 for source vertex, and dist[v] = ∞ for all other vertices. Predecessors are initialized to null.`,
    mathematicalDerivation: `\\text{dist}[${startVertexId}] = 0, \\quad \\forall v \\neq ${startVertexId}, \\; \\text{dist}[v] = \\infty`,
    examRule: 'Initialization Rule: Always write the initial distance table row with dist[source] = 0 and dist[all others] = ∞.',
    statusBadge: { text: `Source = ${startVertexId}`, variant: 'normal' },
    graphState: cloneGraphState(),
    activeNodeIds: [startVertexId],
    traceTableHeaders: ['Vertex', 'Shortest Dist (dist[v])', 'Predecessor (pred[v])', 'Status', 'Path String'],
    traceTableRows: collectDijkstraRows(),
    auxiliaryState: {
      type: 'priority_queue',
      label: 'Priority Queue (Distance)',
      items: vertices.map((v) => `${v.id}: ${dist[v.id] === Infinity ? '∞' : dist[v.id]}`),
    },
  });

  let iteration = 1;

  while (visited.size < vertices.length) {
    // Pick unvisited vertex with minimum distance
    let u: string | null = null;
    let minDist = Infinity;

    for (const v of vertices) {
      if (!visited.has(v.id) && dist[v.id] < minDist) {
        minDist = dist[v.id];
        u = v.id;
      }
    }

    if (u === null || minDist === Infinity) {
      // Remaining vertices are unreachable
      break;
    }

    visited.add(u);
    const uVert = vertices.find((v) => v.id === u);
    if (uVert) uVert.state = 'completed';

    // Find outgoing edges from u
    const relaxedEdges: string[] = [];
    const outgoingEdges = edges.filter(
      (e) => e.source === u || (!e.directed && e.target === u)
    );

    for (const e of outgoingEdges) {
      const v = e.source === u ? e.target : e.source;
      if (!visited.has(v)) {
        const weight = e.weight ?? 1;
        const newDist = dist[u] + weight;

        if (newDist < dist[v]) {
          dist[v] = newDist;
          pred[v] = u;
          e.state = 'relaxed';
          relaxedEdges.push(`${v} (dist: ${newDist}, pred: ${u})`);
        }
      }
    }

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Iteration ${iteration++}: Settle Vertex ${u} (dist[${u}] = ${dist[u]})`,
      subtitle: relaxedEdges.length > 0 ? `Relaxed neighbors: ${relaxedEdges.join(', ')}` : 'No distances improved',
      category: 'GRAPH',
      algorithmName: "Dijkstra's Shortest Path",
      facultyExplanation: `Extracted vertex ${u} with minimum unsettled distance dist[${u}] = ${dist[u]}. Vertex ${u} is now permanently SETTLED.\nRelaxed outgoing edges from ${u}:\n${
        relaxedEdges.length > 0
          ? relaxedEdges.map((r) => `• Updated ${r}`).join('\n')
          : '• None of the neighbor distances could be improved.'
      }`,
      mathematicalDerivation: `\\text{Relaxation: } \\text{if } \\text{dist}[${u}] + w(${u}, v) < \\text{dist}[v] \\implies \\text{dist}[v] = \\text{dist}[${u}] + w(${u}, v)`,
      examRule: 'Relaxation Formula: Only update dist[v] if the path through u is strictly shorter than current dist[v].',
      statusBadge: { text: `Settled ${u} (d=${dist[u]})`, variant: 'accent' },
      graphState: cloneGraphState(),
      activeNodeIds: [u],
      traceTableHeaders: ['Vertex', 'Shortest Dist (dist[v])', 'Predecessor (pred[v])', 'Status', 'Path String'],
      traceTableRows: collectDijkstraRows(u),
      auxiliaryState: {
        type: 'priority_queue',
        label: 'Priority Queue (Remaining)',
        items: vertices
          .filter((v) => !visited.has(v.id))
          .map((v) => `${v.id}: ${dist[v.id] === Infinity ? '∞' : dist[v.id]}`),
      },
    });
  }

  // Final Summary
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: "Dijkstra's Shortest Paths Complete",
    subtitle: `All shortest paths computed from source ${startVertexId}`,
    category: 'GRAPH',
    algorithmName: "Dijkstra's Shortest Path",
    facultyExplanation: `All reachable vertices have been settled. Below is the final distance and predecessor table with complete shortest path strings.`,
    mathematicalDerivation: '\\forall v \\in V, \\; \\text{dist}[v] \\text{ is optimal.}',
    examRule: 'Final exam output: Always write the complete Path Reconstruction column (e.g. A → C → B → D).',
    statusBadge: { text: 'Optimal Paths Found', variant: 'success' },
    graphState: cloneGraphState(),
    traceTableHeaders: ['Vertex', 'Shortest Dist (dist[v])', 'Predecessor (pred[v])', 'Status', 'Path String'],
    traceTableRows: collectDijkstraRows(),
    auxiliaryState: {
      type: 'topo_list',
      label: 'Shortest Paths from Source',
      items: vertices.map((v) => `${v.id}: Dist = ${dist[v.id]} | Path = ${getPathString(v.id)}`),
    },
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}
