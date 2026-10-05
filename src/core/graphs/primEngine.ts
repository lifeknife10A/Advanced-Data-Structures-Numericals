import { GraphData, GraphVertex, GraphEdge, VertexState } from '../../types/graph';
import { StepSnapshot, TraceTableRow } from '../../types/animation';

export function generatePrimSteps(graph: GraphData, startVertexId: string): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  const vertices: GraphVertex[] = graph.vertices.map((v) => ({ ...v, state: 'unvisited' as VertexState }));
  const edges: GraphEdge[] = graph.edges.map((e) => ({ ...e, state: 'unvisited' }));

  const inMST = new Set<string>([startVertexId]);
  const mstEdges: GraphEdge[] = [];
  let totalCost = 0;
  const targetEdgesCount = vertices.length - 1;

  function cloneGraphState() {
    return {
      vertices: vertices.map((v) => ({
        ...v,
        state: (inMST.has(v.id) ? 'completed' : 'unvisited') as VertexState,
      })),
      edges: edges.map((e) => ({ ...e })),
    };
  }

  const traceRows: TraceTableRow[] = [];

  // Initial Step
  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: `Initialize Prim's Algorithm from Start Node ${startVertexId}`,
    subtitle: `Growing Tree Set: VMST = {${startVertexId}}`,
    category: 'GRAPH',
    algorithmName: "Prim's Minimum Spanning Tree",
    facultyExplanation: `Prim's algorithm grows a single Minimum Spanning Tree component starting from an arbitrary start vertex. Initialize: VMST = {${startVertexId}}. We will repeatedly choose the lightest edge crossing the cut between VMST and the remaining vertices.`,
    mathematicalDerivation: `V_{MST} = \\{${startVertexId}\\}, \\quad V \\setminus V_{MST} = \\{${vertices
      .filter((v) => v.id !== startVertexId)
      .map((v) => v.id)
      .join(', ')}\\}`,
    examRule: 'Prim Cut Property: At every step, pick the minimum weight cut edge connecting a vertex in VMST to a vertex outside VMST.',
    statusBadge: { text: `Start = ${startVertexId}`, variant: 'normal' },
    graphState: cloneGraphState(),
    activeNodeIds: [startVertexId],
    traceTableHeaders: ['Step', 'Current VMST Set', 'Candidate Cut Edges', 'Chosen Min Edge', 'Added Vertex', 'Edge Weight', 'Total Cost'],
    traceTableRows: [],
    auxiliaryState: {
      type: 'mst',
      label: 'Growing Tree (VMST)',
      items: [startVertexId],
    },
  });

  let stepCount = 1;

  while (inMST.size < vertices.length) {
    // Find all candidate cut edges
    const cutEdges: { edge: GraphEdge; u: string; v: string; weight: number }[] = [];

    for (const e of edges) {
      const u = e.source;
      const v = e.target;
      const w = e.weight ?? 1;

      if (inMST.has(u) && !inMST.has(v)) {
        cutEdges.push({ edge: e, u, v, weight: w });
      } else if (!e.directed && inMST.has(v) && !inMST.has(u)) {
        cutEdges.push({ edge: e, u: v, v: u, weight: w });
      }
    }

    if (cutEdges.length === 0) break; // Graph disconnected

    // Sort cut edges by weight
    cutEdges.sort((a, b) => a.weight - b.weight);
    const chosen = cutEdges[0];

    // Add to MST
    inMST.add(chosen.v);
    mstEdges.push(chosen.edge);
    totalCost += chosen.weight;

    const targetGraphEdge = edges.find((e) => e.id === chosen.edge.id);
    if (targetGraphEdge) targetGraphEdge.state = 'mst_edge';

    const row: TraceTableRow = {
      id: `prim-step-${stepCount}`,
      cells: [
        stepCount,
        `{${Array.from(inMST).filter((x) => x !== chosen.v).join(', ')}}`,
        cutEdges.map((c) => `(${c.u}, ${c.v}): ${c.weight}`).join(', '),
        `(${chosen.u}, ${chosen.v})`,
        chosen.v,
        chosen.weight,
        totalCost,
      ],
      isHighlighted: true,
    };
    traceRows.push(row);

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Step ${stepCount++}: Add Edge (${chosen.u}, ${chosen.v}) [Weight ${chosen.weight}]`,
      subtitle: `Vertex ${chosen.v} added to VMST | Current Cost: ${totalCost}`,
      category: 'GRAPH',
      algorithmName: "Prim's Minimum Spanning Tree",
      facultyExplanation: `Evaluated candidate cut edges crossing from VMST to unvisited vertices:\n${cutEdges
        .map((c) => `• (${c.u}, ${c.v}) with weight ${c.weight}`)
        .join('\n')}\nMinimum weight candidate is (${chosen.u}, ${chosen.v}) with weight ${chosen.weight}. Add vertex ${chosen.v} to VMST and include edge in MST.`,
      mathematicalDerivation: `\\text{Min Cut Edge} = (${chosen.u}, ${chosen.v}) \\text{ with } w = ${chosen.weight}. \\quad V_{MST} \\leftarrow V_{MST} \\cup \\{${chosen.v}\\}`,
      examRule: 'Greedy Choice: Always select the strictly minimum weight cut edge among all candidates.',
      statusBadge: { text: `Added (${chosen.u},${chosen.v})`, variant: 'success' },
      graphState: cloneGraphState(),
      activeNodeIds: [chosen.v],
      activeEdgeIds: [chosen.edge.id],
      traceTableHeaders: ['Step', 'Current VMST Set', 'Candidate Cut Edges', 'Chosen Min Edge', 'Added Vertex', 'Edge Weight', 'Total Cost'],
      traceTableRows: [...traceRows],
      auxiliaryState: {
        type: 'mst',
        label: `Growing Tree (${inMST.size}/${vertices.length})`,
        items: Array.from(inMST),
        extraInfo: `Total MST Cost: ${totalCost}`,
      },
    });
  }

  // Final Prim Summary
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: "Prim's Algorithm Complete!",
    subtitle: `Total Minimum Spanning Tree Cost = ${totalCost}`,
    category: 'GRAPH',
    algorithmName: "Prim's Minimum Spanning Tree",
    facultyExplanation: `All ${vertices.length} vertices have been included in VMST. The resulting Minimum Spanning Tree contains ${mstEdges.length} edges with total cost ${totalCost}.`,
    mathematicalDerivation: `\\text{Total MST Weight} = \\sum_{e \\in MST} w(e) = ${mstEdges.map((e) => e.weight).join(' + ')} = ${totalCost}`,
    examRule: 'Final exam output: State the step-by-step growing tree set, chosen cut edges, and final arithmetic total cost.',
    statusBadge: { text: `Total Cost = ${totalCost}`, variant: 'success' },
    graphState: cloneGraphState(),
    traceTableHeaders: ['Step', 'Current VMST Set', 'Candidate Cut Edges', 'Chosen Min Edge', 'Added Vertex', 'Edge Weight', 'Total Cost'],
    traceTableRows: [...traceRows],
    auxiliaryState: {
      type: 'mst',
      label: 'Final MST Edges',
      items: mstEdges.map((e) => `(${e.source}, ${e.target}) : Weight ${e.weight}`),
      extraInfo: `Total Cost = ${totalCost}`,
    },
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}
