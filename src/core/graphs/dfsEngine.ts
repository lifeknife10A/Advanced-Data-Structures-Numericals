import { GraphData, GraphVertex, GraphEdge } from '../../types/graph';
import { StepSnapshot, TraceTableRow } from '../../types/animation';

export function generateDFSSteps(graph: GraphData, startVertexId: string): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  const vertices: GraphVertex[] = graph.vertices.map((v) => ({ ...v, state: 'unvisited' }));
  const edges: GraphEdge[] = graph.edges.map((e) => ({ ...e, state: 'unvisited' }));

  const stack: string[] = [];
  const visited = new Set<string>();
  const discoveryTime: Record<string, number> = {};
  const finishTime: Record<string, number> = {};
  const traversalOrder: string[] = [];
  const treeEdges: string[] = [];
  const backEdges: string[] = [];
  let timer = 1;

  function cloneGraphState() {
    return {
      vertices: vertices.map((v) => ({
        ...v,
        discoveryTime: discoveryTime[v.id],
        finishTime: finishTime[v.id],
      })),
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

  const traceRows: TraceTableRow[] = [];

  // Initial Step
  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: `Initialize DFS from Source Vertex ${startVertexId}`,
    subtitle: `Push start vertex ${startVertexId} onto Call Stack and mark visited`,
    category: 'GRAPH',
    algorithmName: 'Depth-First Search (DFS)',
    facultyExplanation: `DFS explores as deep as possible along each branch before backtracking. We initialize the Call Stack with start vertex ${startVertexId} and add it to the Visited Array.`,
    mathematicalDerivation: `\\text{Stack} = [${startVertexId}], \\quad \\text{Visited} = [${startVertexId}]`,
    examRule: 'DFS Rule: Push discovering vertices onto the Stack and record them in the Visited Array; pop when all adjacent branches are exhausted.',
    statusBadge: { text: `Start = ${startVertexId}`, variant: 'normal' },
    graphState: cloneGraphState(),
    activeNodeIds: [startVertexId],
    traceTableHeaders: ['Vertex', 'Discovery Time d[v]', 'Finish Time f[v]', 'Status', 'Parent'],
    traceTableRows: [],
    auxiliaryState: {
      type: 'stack',
      label: 'Call Stack (LIFO)',
      items: [startVertexId],
      visitedItems: [startVertexId],
      actionType: 'push',
      activeItem: startVertexId,
      extraInfo: `Start at vertex ${startVertexId}`,
    },
  });

  function dfsVisit(u: string, parent: string | null) {
    discoveryTime[u] = timer++;
    visited.add(u);
    stack.push(u);
    if (!traversalOrder.includes(u)) {
      traversalOrder.push(u);
    }

    const uV = vertices.find((v) => v.id === u);
    if (uV) uV.state = 'visiting';

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Discover & Push Node ${u} onto Stack`,
      subtitle: `Call Stack: [${stack.join(' → ')}] | Visited: [${traversalOrder.join(', ')}]`,
      category: 'GRAPH',
      algorithmName: 'Depth-First Search (DFS)',
      facultyExplanation: `First discovery of vertex ${u}. Pushing ${u} onto Call Stack and appending to the Visited Array. Timestamp d[${u}] = ${discoveryTime[u]}.`,
      mathematicalDerivation: `\\text{PUSH}(${u}) \\implies \\text{Stack} = [${stack.join(', ')}], \\quad \\text{Visited} = [${traversalOrder.join(', ')}]`,
      examRule: 'Stack Push: Every newly discovered unvisited node is pushed onto the stack immediately.',
      statusBadge: { text: `PUSH ${u}`, variant: 'accent' },
      graphState: cloneGraphState(),
      activeNodeIds: [u],
      traceTableHeaders: ['Vertex', 'Discovery Time d[v]', 'Finish Time f[v]', 'Status', 'Parent'],
      traceTableRows: vertices.map((v) => ({
        id: `dfs-row-${v.id}`,
        cells: [
          v.id,
          discoveryTime[v.id] ? `${discoveryTime[v.id]}` : '—',
          finishTime[v.id] ? `${finishTime[v.id]}` : '—',
          visited.has(v.id) ? (finishTime[v.id] ? 'COMPLETED' : 'DISCOVERED') : 'UNVISITED',
          v.id === startVertexId ? 'ROOT' : parent || '—',
        ],
        isHighlighted: v.id === u,
      })),
      auxiliaryState: {
        type: 'stack',
        label: 'Call Stack (LIFO)',
        items: [...stack],
        visitedItems: [...traversalOrder],
        actionType: 'push',
        activeItem: u,
        extraInfo: `Discovery Order: ${traversalOrder.join(' → ')}`,
      },
    });

    const neighbors = getAdj(u);
    for (const v of neighbors) {
      if (v === parent) continue; // skip immediate parent edge in undirected graph

      const edge = edges.find(
        (e) => (e.source === u && e.target === v) || (!e.directed && e.source === v && e.target === u)
      );

      if (!visited.has(v)) {
        if (edge) {
          edge.state = 'tree_edge';
          treeEdges.push(`(${u}, ${v})`);
        }
        dfsVisit(v, u);
      } else {
        if (edge && edge.state === 'unvisited') {
          edge.state = 'back_edge';
          backEdges.push(`(${u}, ${v})`);
        }
      }
    }

    finishTime[u] = timer++;
    stack.pop();
    if (uV) uV.state = 'completed';

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Pop Node ${u} from Stack $\\to$ Backtrack`,
      subtitle: `All neighbors explored from ${u}. Popping from Stack.`,
      category: 'GRAPH',
      algorithmName: 'Depth-First Search (DFS)',
      facultyExplanation: `All adjacent edges from vertex ${u} have been completely explored. Popping ${u} from the Call Stack and backtracking to parent.`,
      mathematicalDerivation: `\\text{POP}(${u}) \\implies \\text{Stack} = [${stack.join(', ')}], \\quad f[${u}] = ${finishTime[u]}`,
      examRule: 'Stack Pop & Backtracking: A node is popped from the stack once all its adjacent vertices are finished.',
      statusBadge: { text: `POP ${u}`, variant: 'success' },
      graphState: cloneGraphState(),
      activeNodeIds: [u],
      traceTableHeaders: ['Vertex', 'Discovery Time d[v]', 'Finish Time f[v]', 'Status', 'Parent'],
      traceTableRows: vertices.map((v) => ({
        id: `dfs-row-${v.id}`,
        cells: [
          v.id,
          discoveryTime[v.id] ? `${discoveryTime[v.id]}` : '—',
          finishTime[v.id] ? `${finishTime[v.id]}` : '—',
          visited.has(v.id) ? (finishTime[v.id] ? 'COMPLETED' : 'DISCOVERED') : 'UNVISITED',
          v.id === startVertexId ? 'ROOT' : 'Ancestor',
        ],
        isHighlighted: v.id === u,
      })),
      auxiliaryState: {
        type: 'stack',
        label: 'Call Stack (LIFO)',
        items: [...stack],
        visitedItems: [...traversalOrder],
        actionType: 'pop',
        activeItem: u,
        extraInfo: `Backtracking from ${u}. Remaining Stack: [${stack.join(', ')}]`,
      },
    });
  }

  dfsVisit(startVertexId, null);

  // Final DFS summary
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: 'DFS Traversal Completed',
    subtitle: `Final Traversal Sequence: ${traversalOrder.join(' → ')}`,
    category: 'GRAPH',
    algorithmName: 'Depth-First Search (DFS)',
    facultyExplanation: `DFS completed.\nFinal Visited Traversal Sequence: ${traversalOrder.join(' → ')}\nTree Edges: ${treeEdges.join(', ')}\nBack Edges: ${backEdges.join(', ')}`,
    mathematicalDerivation: `\\text{Final Visited Array} = [${traversalOrder.join(', ')}]`,
    examRule: 'Final exam output: State the final Visited Array traversal order and classify all Tree and Back Edges.',
    statusBadge: { text: 'DFS Completed', variant: 'success' },
    graphState: cloneGraphState(),
    traceTableHeaders: ['Vertex', 'Discovery Time d[v]', 'Finish Time f[v]', 'Status', 'Parent'],
    traceTableRows: vertices.map((v) => ({
      id: `dfs-row-${v.id}`,
      cells: [
        v.id,
        `${discoveryTime[v.id]}`,
        `${finishTime[v.id]}`,
        'COMPLETED',
        v.id === startVertexId ? 'ROOT' : 'Spanning Tree',
      ],
    })),
    auxiliaryState: {
      type: 'stack',
      label: 'Call Stack (LIFO)',
      items: [],
      visitedItems: [...traversalOrder],
      actionType: 'none',
      extraInfo: `Tree Edges: ${treeEdges.join(', ')} | Back Edges: ${backEdges.join(', ')}`,
    },
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}
