import { GraphData, GraphVertex, GraphEdge, VertexState, EdgeState } from '../../types/graph';
import { StepSnapshot, TraceTableRow } from '../../types/animation';

export function generateTopoSortSteps(
  graph: GraphData,
  method: 'kahn_bfs' | 'source_removal' = 'kahn_bfs'
): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  const vertices: GraphVertex[] = graph.vertices.map((v) => ({ ...v, state: 'unvisited' as VertexState }));
  const edges: GraphEdge[] = graph.edges.map((e) => ({ ...e, state: 'unvisited' as EdgeState }));

  // Calculate in-degrees
  const inDegree: Record<string, number> = {};
  vertices.forEach((v) => (inDegree[v.id] = 0));

  edges.forEach((e) => {
    if (inDegree[e.target] !== undefined) {
      inDegree[e.target] += 1;
    }
  });

  const removedVertices = new Set<string>();
  const topoOrder: string[] = [];

  function getVertexState(vId: string): VertexState {
    if (removedVertices.has(vId)) return 'completed';
    if (inDegree[vId] === 0) return 'visiting';
    return 'unvisited';
  }

  function getEdgeState(e: GraphEdge): EdgeState {
    if (removedVertices.has(e.source)) return 'tree_edge';
    return 'unvisited';
  }

  function cloneGraphState() {
    return {
      vertices: vertices.map((v) => ({
        ...v,
        inDegree: inDegree[v.id],
        state: getVertexState(v.id),
      })),
      edges: edges.map((e) => ({
        ...e,
        state: getEdgeState(e),
      })),
    };
  }

  function collectInDegreeRows(activeU: string | null = null): TraceTableRow[] {
    return vertices.map((v) => ({
      id: `topo-row-${v.id}`,
      cells: [
        v.id,
        removedVertices.has(v.id) ? 'REMOVED' : inDegree[v.id],
        removedVertices.has(v.id)
          ? 'Included in Sort'
          : inDegree[v.id] === 0
          ? 'SOURCE (In-degree = 0)'
          : 'Waiting on Predecessors',
      ],
      isHighlighted: v.id === activeU,
    }));
  }

  if (method === 'source_removal') {
    // Method 1: Repeated Source Removal
    steps.push({
      stepIndex: 0,
      totalSteps: 0,
      title: 'Initialize Topological Sort by Source Removal',
      subtitle: 'Calculate in-degrees for all vertices',
      category: 'GRAPH',
      algorithmName: 'Topological Sort (Source Removal)',
      facultyExplanation: 'Repeated Source Removal Method:\n1. Compute in-degree for all vertices in the DAG.\n2. Find a vertex with in-degree = 0 (a Source).\n3. Remove the vertex and all its outgoing edges from the graph.\n4. Repeat until all vertices are removed.',
      mathematicalDerivation: `\\forall v \\in V, \\quad \\text{deg}^-(v) = \\text{Incoming Edges Count}`,
      examRule: 'Source Removal Rule: Always identify the 0 in-degree vertex, state its removal, and show the updated in-degree array.',
      statusBadge: { text: 'In-degrees Computed', variant: 'normal' },
      graphState: cloneGraphState(),
      traceTableHeaders: ['Vertex', 'Current In-Degree', 'Status'],
      traceTableRows: collectInDegreeRows(),
      auxiliaryState: {
        type: 'topo_list',
        label: 'Topological Sequence',
        items: [],
      },
    });

    let stepCount = 1;

    while (removedVertices.size < vertices.length) {
      // Find a vertex with in-degree 0 that is not yet removed
      const sources = vertices
        .filter((v) => !removedVertices.has(v.id) && inDegree[v.id] === 0)
        .map((v) => v.id)
        .sort();

      if (sources.length === 0) {
        // Cycle detected
        steps.push({
          stepIndex: steps.length,
          totalSteps: 0,
          title: 'Cycle Detected! Topological Sort Impossible',
          subtitle: 'No remaining vertex with in-degree 0',
          category: 'GRAPH',
          algorithmName: 'Topological Sort (Source Removal)',
          facultyExplanation: 'There are remaining vertices in the graph, but none of them have in-degree = 0. This confirms the presence of a directed cycle! Topological sort is only possible on Directed Acyclic Graphs (DAGs).',
          mathematicalDerivation: '\\exists \\text{ Directed Cycle} \\implies \\text{No valid topological ordering.}',
          examRule: 'Cycle Condition: If no 0 in-degree vertex exists before all vertices are removed, the graph contains a cycle.',
          statusBadge: { text: 'Cycle Detected!', variant: 'danger' },
          graphState: cloneGraphState(),
          traceTableHeaders: ['Vertex', 'Current In-Degree', 'Status'],
          traceTableRows: collectInDegreeRows(),
        });
        steps.forEach((s) => (s.totalSteps = steps.length));
        return steps;
      }

      const u = sources[0]; // Break ties by alphabetical/numeric order
      removedVertices.add(u);
      topoOrder.push(u);

      // Decrement outgoing edges
      const outgoing = edges.filter((e) => e.source === u);
      outgoing.forEach((e) => {
        if (inDegree[e.target] > 0) {
          inDegree[e.target] -= 1;
        }
      });

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Step ${stepCount++}: Remove Source Vertex ${u}`,
        subtitle: `Available Sources: [${sources.join(', ')}] $\\to$ Picked ${u}`,
        category: 'GRAPH',
        algorithmName: 'Topological Sort (Source Removal)',
        facultyExplanation: `Vertex ${u} has in-degree 0 (no incoming dependencies). Remove vertex ${u} from the graph and eliminate its outgoing edges:\n${
          outgoing.length > 0
            ? outgoing.map((e) => `• Removed edge (${e.source} → ${e.target}), decrementing deg⁻(${e.target}) to ${inDegree[e.target]}`).join('\n')
            : '• No outgoing edges.'
        }\nAppend ${u} to topological ordering.`,
        mathematicalDerivation: `\\text{Remove } ${u} \\implies \\text{Topo Order: } [${topoOrder.join(', ')}]`,
        examRule: 'Exam Step: Show the remaining graph (or updated in-degree list) after eliminating each vertex.',
        statusBadge: { text: `Removed ${u}`, variant: 'accent' },
        graphState: cloneGraphState(),
        activeNodeIds: [u],
        traceTableHeaders: ['Vertex', 'Current In-Degree', 'Status'],
        traceTableRows: collectInDegreeRows(u),
        auxiliaryState: {
          type: 'topo_list',
          label: 'Topological Sequence',
          items: [...topoOrder],
        },
      });
    }

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: 'Topological Sort Complete!',
      subtitle: `Final Linear Ordering: ${topoOrder.join(' → ')}`,
      category: 'GRAPH',
      algorithmName: 'Topological Sort (Source Removal)',
      facultyExplanation: `All vertices have been removed without cycles.\nFinal Topological Ordering: ${topoOrder.join(' → ')}\nFor every directed edge (u → v), u appears BEFORE v in this ordering.`,
      mathematicalDerivation: `\\text{Topological Sequence: } ${topoOrder.join(' \\to ')}`,
      examRule: 'Final exam output: State the topological ordering and verify that all directed edges point from left to right.',
      statusBadge: { text: 'Ordering Complete', variant: 'success' },
      graphState: cloneGraphState(),
      traceTableHeaders: ['Vertex', 'Current In-Degree', 'Status'],
      traceTableRows: collectInDegreeRows(),
      auxiliaryState: {
        type: 'topo_list',
        label: 'Final Topological Sequence',
        items: topoOrder,
      },
    });
  } else {
    // Method 2: Kahn's Algorithm (BFS with Queue)
    const queue: string[] = vertices
      .filter((v) => inDegree[v.id] === 0)
      .map((v) => v.id)
      .sort();

    const traceTableRows: TraceTableRow[] = [];

    steps.push({
      stepIndex: 0,
      totalSteps: 0,
      title: "Initialize Kahn's BFS Algorithm",
      subtitle: `Initial Queue with In-degree 0 nodes: [${queue.join(', ')}]`,
      category: 'GRAPH',
      algorithmName: "Topological Sort (Kahn's BFS)",
      facultyExplanation: `Kahn's Algorithm Protocol:\n1. Compute initial in-degree array for all vertices.\n2. Enqueue all vertices with in-degree = 0 into a FIFO Queue.\n3. While queue is not empty: Dequeue vertex u, append to output list, and decrement in-degree of all adjacent vertices v. If in-degree(v) becomes 0, enqueue v.`,
      mathematicalDerivation: `\\text{Queue } Q = [${queue.join(', ')}], \\quad \\text{In-degree Array: } [${vertices.map((v) => `${v.id}:${inDegree[v.id]}`).join(', ')}]`,
      examRule: "Kahn's Table Format: Column 1 (Step), Column 2 (Dequeued Node), Column 3 (Edge Decrements), Column 4 (Enqueued Nodes), Column 5 (Queue State), Column 6 (Output List).",
      statusBadge: { text: 'Queue Initialized', variant: 'normal' },
      graphState: cloneGraphState(),
      traceTableHeaders: ['Step', 'Dequeued Node u', 'Edge Decrements & Resulting In-degrees', 'Enqueued Nodes', 'Queue State', 'Output List L'],
      traceTableRows: [
        {
          id: 'kahn-init',
          cells: [0, '—', 'Initial Setup', queue.join(', '), `[${queue.join(', ')}]`, '[]'],
        },
      ],
      auxiliaryState: {
        type: 'queue',
        label: 'In-Degree 0 Queue (FIFO)',
        items: [...queue],
      },
    });

    let stepCount = 1;

    while (queue.length > 0) {
      const u = queue.shift()!;
      topoOrder.push(u);
      removedVertices.add(u);

      const outgoing = edges.filter((e) => e.source === u);
      const decrements: string[] = [];
      const enqueuedNow: string[] = [];

      outgoing.forEach((e) => {
        const v = e.target;
        inDegree[v] -= 1;
        decrements.push(`deg⁻(${v}) = ${inDegree[v]}`);
        if (inDegree[v] === 0) {
          queue.push(v);
          enqueuedNow.push(v);
        }
      });

      const row: TraceTableRow = {
        id: `kahn-step-${stepCount}`,
        cells: [
          stepCount,
          u,
          decrements.length > 0 ? decrements.join(', ') : 'None',
          enqueuedNow.length > 0 ? enqueuedNow.join(', ') : 'None',
          `[${queue.join(', ')}]`,
          `[${topoOrder.join(', ')}]`,
        ],
        isHighlighted: true,
      };
      traceTableRows.push(row);

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Step ${stepCount++}: Dequeue Node ${u}`,
        subtitle: enqueuedNow.length > 0 ? `Newly enqueued 0 in-degree nodes: [${enqueuedNow.join(', ')}]` : 'No new nodes reached 0 in-degree',
        category: 'GRAPH',
        algorithmName: "Topological Sort (Kahn's BFS)",
        facultyExplanation: `Dequeued ${u} and added to output list L. Decremented in-degrees of neighbors:\n${
          decrements.length > 0 ? decrements.map((d) => `• ${d}`).join('\n') : '• No outgoing edges.'
        }\n${
          enqueuedNow.length > 0
            ? `Vertices [${enqueuedNow.join(', ')}] reached in-degree 0 and were pushed into the queue.`
            : ''
        }`,
        mathematicalDerivation: `\\text{Dequeue } ${u} \\implies L = [${topoOrder.join(', ')}], \\quad Q = [${queue.join(', ')}]`,
        examRule: "Kahn's Rule: Whenever a neighbor's in-degree drops to 0, immediately enqueue it.",
        statusBadge: { text: `Dequeued ${u}`, variant: 'accent' },
        graphState: cloneGraphState(),
        activeNodeIds: [u, ...enqueuedNow],
        traceTableHeaders: ['Step', 'Dequeued Node u', 'Edge Decrements & Resulting In-degrees', 'Enqueued Nodes', 'Queue State', 'Output List L'],
        traceTableRows: [...traceTableRows],
        activeTableRowIndex: traceTableRows.length - 1,
        auxiliaryState: {
          type: 'queue',
          label: 'In-Degree 0 Queue (FIFO)',
          items: [...queue],
          extraInfo: `Output List: ${topoOrder.join(' → ')}`,
        },
      });
    }

    if (topoOrder.length < vertices.length) {
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: 'Cycle Detected! Graph is not a DAG',
        subtitle: `Processed ${topoOrder.length} of ${vertices.length} vertices`,
        category: 'GRAPH',
        algorithmName: "Topological Sort (Kahn's BFS)",
        facultyExplanation: `Queue became empty before all ${vertices.length} vertices were processed. This proves the graph contains a directed cycle.`,
        mathematicalDerivation: `|L| = ${topoOrder.length} < |V| = ${vertices.length} \\implies \\text{Graph is Cyclic}`,
        examRule: 'Cycle Invariant: If |Output List| < |V|, declare graph contains a cycle.',
        statusBadge: { text: 'Cycle Detected!', variant: 'danger' },
        graphState: cloneGraphState(),
        traceTableHeaders: ['Step', 'Dequeued Node u', 'Edge Decrements & Resulting In-degrees', 'Enqueued Nodes', 'Queue State', 'Output List L'],
        traceTableRows: [...traceTableRows],
      });
    } else {
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: "Kahn's Topological Sort Complete!",
        subtitle: `Topological Order: ${topoOrder.join(' → ')}`,
        category: 'GRAPH',
        algorithmName: "Topological Sort (Kahn's BFS)",
        facultyExplanation: `All ${vertices.length} vertices processed successfully (|L| = |V|).\nFinal Topological Sequence: ${topoOrder.join(' → ')}`,
        mathematicalDerivation: `\\text{Topological Sequence: } ${topoOrder.join(' \\to ')}`,
        examRule: 'Final exam output: State the complete Kahn trace table and final topological sequence.',
        statusBadge: { text: 'Sort Complete', variant: 'success' },
        graphState: cloneGraphState(),
        traceTableHeaders: ['Step', 'Dequeued Node u', 'Edge Decrements & Resulting In-degrees', 'Enqueued Nodes', 'Queue State', 'Output List L'],
        traceTableRows: [...traceTableRows],
        auxiliaryState: {
          type: 'topo_list',
          label: 'Final Topological Ordering',
          items: topoOrder,
        },
      });
    }
  }

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}
