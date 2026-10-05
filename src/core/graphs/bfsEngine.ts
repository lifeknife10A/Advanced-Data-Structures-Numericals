import { GraphData, GraphVertex, GraphEdge } from '../../types/graph';
import { StepSnapshot, TraceTableRow } from '../../types/animation';

export function generateBFSSteps(graph: GraphData, startVertexId: string): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  const vertices: GraphVertex[] = graph.vertices.map((v) => ({ ...v, state: 'unvisited' }));
  const edges: GraphEdge[] = graph.edges.map((e) => ({ ...e, state: 'unvisited' }));

  const queue: string[] = [];
  const visited = new Set<string>();
  const traversalOrder: string[] = [];
  const treeEdges: string[] = [];
  const crossEdges: string[] = [];

  function cloneGraphState() {
    return {
      vertices: vertices.map((v) => ({ ...v })),
      edges: edges.map((e) => ({ ...e })),
    };
  }

  function getAdj(u: string): string[] {
    const adj: string[] = [];
    for (const e of edges) {
      if (e.source === u) adj.push(e.target);
      else if (!e.directed && e.target === u) adj.push(e.source);
    }
    return adj.sort();
  }

  // Initial Snapshot
  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: `Initialize BFS from Source Vertex ${startVertexId}`,
    subtitle: `Enqueue start vertex ${startVertexId} into FIFO Queue`,
    category: 'GRAPH',
    algorithmName: 'Breadth-First Search (BFS)',
    facultyExplanation: `Breadth-First Search explores the graph level-by-level using a FIFO Queue. Initializing: Enqueue start vertex ${startVertexId} and prepare the Visited Array.`,
    mathematicalDerivation: `\\text{Queue } Q = [${startVertexId}], \\quad \\text{Visited Array} = []`,
    examRule: 'Queue Rule: Enqueue the start vertex, mark as visited, and process nodes in First-In-First-Out (FIFO) order.',
    statusBadge: { text: `Start = ${startVertexId}`, variant: 'normal' },
    graphState: cloneGraphState(),
    activeNodeIds: [startVertexId],
    traceTableHeaders: ['Step', 'Dequeued Node', 'Visited Set', 'Enqueued Neighbors', 'Queue State (FIFO)', 'Traversal Order'],
    traceTableRows: [
      {
        id: 'init-row',
        cells: [0, '—', `{${startVertexId}}`, startVertexId, `[${startVertexId}]`, '[]'],
        isHighlighted: true,
      },
    ],
    auxiliaryState: {
      type: 'queue',
      label: 'FIFO Queue',
      items: [startVertexId],
      visitedItems: [],
      actionType: 'enqueue',
      activeItem: startVertexId,
      extraInfo: `Start at vertex ${startVertexId}`,
    },
  });

  // Start BFS
  queue.push(startVertexId);
  visited.add(startVertexId);
  const startV = vertices.find((v) => v.id === startVertexId);
  if (startV) startV.state = 'visiting';

  let stepCount = 1;
  const traceRows: TraceTableRow[] = [
    {
      id: 'init-row',
      cells: [0, '—', `{${startVertexId}}`, startVertexId, `[${startVertexId}]`, '[]'],
    },
  ];

  while (queue.length > 0) {
    const u = queue.shift()!;
    traversalOrder.push(u);

    const uVertex = vertices.find((v) => v.id === u);
    if (uVertex) uVertex.state = 'current';

    const neighbors = getAdj(u);
    const enqueuedNow: string[] = [];

    for (const v of neighbors) {
      // Find connecting edge
      const edge = edges.find(
        (e) => (e.source === u && e.target === v) || (!e.directed && e.source === v && e.target === u)
      );

      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
        enqueuedNow.push(v);

        const vVertex = vertices.find((vert) => vert.id === v);
        if (vVertex) vVertex.state = 'visiting';

        if (edge) {
          edge.state = 'tree_edge';
          treeEdges.push(`(${u}, ${v})`);
        }
      } else {
        if (edge && edge.state === 'unvisited') {
          edge.state = 'cross_edge';
          crossEdges.push(`(${u}, ${v})`);
        }
      }
    }

    const row: TraceTableRow = {
      id: `step-${stepCount}`,
      cells: [
        stepCount,
        u,
        `{${Array.from(visited).join(', ')}}`,
        enqueuedNow.length > 0 ? enqueuedNow.join(', ') : 'None',
        `[${queue.join(', ')}]`,
        traversalOrder.join(' → '),
      ],
      isHighlighted: true,
    };
    traceRows.push(row);

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Step ${stepCount++}: Dequeue Node ${u} & Append to Visited`,
      subtitle: `Discovered neighbors: ${enqueuedNow.length > 0 ? enqueuedNow.join(', ') : 'None'} | Visited: [${traversalOrder.join(', ')}]`,
      category: 'GRAPH',
      algorithmName: 'Breadth-First Search (BFS)',
      facultyExplanation: `Dequeued vertex ${u} from the front of the queue and appended to the Visited Array. Inspecting adjacent neighbors [${neighbors.join(', ')}]. ${
        enqueuedNow.length > 0
          ? `Enqueued unvisited neighbors [${enqueuedNow.join(', ')}] at rear of FIFO Queue.`
          : 'All neighbors are already visited.'
      }`,
      mathematicalDerivation: `\\text{DEQUEUE}(${u}) \\implies \\text{Visited} = [${traversalOrder.join(', ')}], \\quad Q = [${queue.join(', ')}]`,
      examRule: 'Tree Edge vs Cross Edge: An edge to an unvisited vertex is a Tree Edge; an edge to an already visited vertex is a Cross Edge.',
      statusBadge: { text: `DEQUEUE ${u}`, variant: 'accent' },
      graphState: cloneGraphState(),
      activeNodeIds: [u, ...enqueuedNow],
      traceTableHeaders: ['Step', 'Dequeued Node', 'Visited Set', 'Enqueued Neighbors', 'Queue State (FIFO)', 'Traversal Order'],
      traceTableRows: [...traceRows],
      activeTableRowIndex: traceRows.length - 1,
      auxiliaryState: {
        type: 'queue',
        label: 'FIFO Queue',
        items: [...queue],
        visitedItems: [...traversalOrder],
        actionType: 'dequeue',
        activeItem: u,
        enqueuedItems: [...enqueuedNow],
        extraInfo: `Traversal Order: ${traversalOrder.join(' → ')}`,
      },
    });

    if (uVertex) uVertex.state = 'completed';
  }

  // Final BFS Summary
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: 'BFS Traversal Completed',
    subtitle: `Full Visited Sequence: ${traversalOrder.join(' → ')}`,
    category: 'GRAPH',
    algorithmName: 'Breadth-First Search (BFS)',
    facultyExplanation: `Queue is now empty. All reachable vertices have been visited.\nFinal Visited Traversal Sequence: ${traversalOrder.join(' → ')}\nTree Edges: ${treeEdges.join(', ')}\nCross Edges: ${crossEdges.join(', ')}`,
    mathematicalDerivation: `\\text{Final Visited Array: } [${traversalOrder.join(', ')}] \\quad (|V_{visited}| = ${visited.size})`,
    examRule: 'Final exam output: State the complete Visited Array traversal order, list all Tree Edges, and draw the BFS Spanning Tree.',
    statusBadge: { text: 'Traversal Complete', variant: 'success' },
    graphState: cloneGraphState(),
    traceTableHeaders: ['Step', 'Dequeued Node', 'Visited Set', 'Enqueued Neighbors', 'Queue State (FIFO)', 'Traversal Order'],
    traceTableRows: [...traceRows],
    auxiliaryState: {
      type: 'queue',
      label: 'FIFO Queue',
      items: [],
      visitedItems: [...traversalOrder],
      actionType: 'none',
      extraInfo: `Tree Edges: ${treeEdges.join(', ')}`,
    },
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}
