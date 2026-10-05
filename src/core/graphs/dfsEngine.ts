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
    subtitle: `Starting Depth-First Search recursion / stack trace`,
    category: 'GRAPH',
    algorithmName: 'Depth-First Search (DFS)',
    facultyExplanation: `DFS explores as deep as possible along each branch before backtracking. We maintain discovery times d[v] and finish times f[v]. Starting at ${startVertexId}.`,
    mathematicalDerivation: `\\text{Call Stack} = [${startVertexId}], \\quad \\text{Timer } t = 1`,
    examRule: 'DFS Rule: Record discovery time d[v] when first visited, and finish time f[v] when all adjacent edges are exhausted.',
    statusBadge: { text: `Start = ${startVertexId}`, variant: 'normal' },
    graphState: cloneGraphState(),
    activeNodeIds: [startVertexId],
    traceTableHeaders: ['Vertex', 'Discovery Time d[v]', 'Finish Time f[v]', 'Status', 'Parent'],
    traceTableRows: [],
    auxiliaryState: {
      type: 'stack',
      label: 'Call Stack',
      items: [startVertexId],
    },
  });

  function dfsVisit(u: string, parent: string | null) {
    discoveryTime[u] = timer++;
    visited.add(u);
    stack.push(u);
    traversalOrder.push(u);

    const uV = vertices.find((v) => v.id === u);
    if (uV) uV.state = 'visiting';

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Discover Node ${u} (Time d[${u}] = ${discoveryTime[u]})`,
      subtitle: `Call Stack: [${stack.join(' → ')}]`,
      category: 'GRAPH',
      algorithmName: 'Depth-First Search (DFS)',
      facultyExplanation: `First discovery of vertex ${u}. Setting discovery timestamp d[${u}] = ${discoveryTime[u]}. Pushing ${u} onto call stack.`,
      mathematicalDerivation: `d[${u}] = ${discoveryTime[u]}, \\quad \\text{Stack} = [${stack.join(', ')}]`,
      examRule: 'Discovery Timestamp: Increment global clock t on entry into vertex.',
      statusBadge: { text: `Discovered ${u} (t=${discoveryTime[u]})`, variant: 'accent' },
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
      title: `Finish Node ${u} (Time f[${u}] = ${finishTime[u]}) $\\to$ Backtrack`,
      subtitle: `All edges explored from ${u}. Popping from Call Stack.`,
      category: 'GRAPH',
      algorithmName: 'Depth-First Search (DFS)',
      facultyExplanation: `All outgoing edges from vertex ${u} have been completely explored. Setting finish timestamp f[${u}] = ${finishTime[u]}. Popping ${u} from call stack and backtracking.`,
      mathematicalDerivation: `f[${u}] = ${finishTime[u]}, \\quad \\text{Active Interval: } [d[${u}], f[${u}]] = [${discoveryTime[u]}, ${finishTime[u]}]`,
      examRule: 'Parenthesis Theorem: The interval [d[u], f[u]] for a descendant is strictly nested within its ancestor.',
      statusBadge: { text: `Finished ${u} (t=${finishTime[u]})`, variant: 'success' },
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
        extraInfo: `Active Interval for ${u}: [${discoveryTime[u]}, ${finishTime[u]}]`,
      },
    });
  }

  dfsVisit(startVertexId, null);

  // Final DFS summary
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: 'DFS Traversal Completed',
    subtitle: `Discovery Order: ${traversalOrder.join(' → ')}`,
    category: 'GRAPH',
    algorithmName: 'Depth-First Search (DFS)',
    facultyExplanation: `DFS completed.\nTraversal Sequence: ${traversalOrder.join(' → ')}\nTree Edges: ${treeEdges.join(', ')}\nBack Edges: ${backEdges.join(', ')}`,
    mathematicalDerivation: `\\text{DFS Order: } ${traversalOrder.join(' \\to ')}`,
    examRule: 'Final exam output: State discovery timestamps d[v], finish timestamps f[v], and classify all Tree and Back Edges.',
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
      type: 'topo_list',
      label: 'DFS Discovery Sequence',
      items: traversalOrder,
      extraInfo: `Tree Edges: ${treeEdges.join(', ')} | Back Edges: ${backEdges.join(', ')}`,
    },
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}
