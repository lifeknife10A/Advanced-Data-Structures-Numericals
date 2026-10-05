import { GraphData, GraphVertex, GraphEdge } from '../../types/graph';
import { StepSnapshot, TraceTableRow } from '../../types/animation';

export function generateKruskalSteps(graph: GraphData): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  const vertices: GraphVertex[] = graph.vertices.map((v) => ({ ...v, state: 'unvisited' }));
  const edges: GraphEdge[] = graph.edges.map((e) => ({ ...e, state: 'unvisited' }));

  // Sort edges by weight
  const sortedEdges = [...edges].sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));

  // DSU data structures
  const parent: Record<string, string> = {};
  const sets: Record<string, string[]> = {};

  vertices.forEach((v) => {
    parent[v.id] = v.id;
    sets[v.id] = [v.id];
  });

  function find(i: string): string {
    if (parent[i] === i) return i;
    parent[i] = find(parent[i]);
    return parent[i];
  }

  function union(root1: string, root2: string) {
    parent[root2] = root1;
    sets[root1] = [...sets[root1], ...sets[root2]];
    delete sets[root2];
  }

  function cloneGraphState() {
    return {
      vertices: vertices.map((v) => ({ ...v })),
      edges: edges.map((e) => ({ ...e })),
    };
  }

  function formatSets(): string {
    return Object.values(sets)
      .map((s) => `{${s.join(', ')}}`)
      .join(', ');
  }

  const mstEdges: GraphEdge[] = [];
  let totalCost = 0;
  const targetEdgesCount = vertices.length - 1;

  const traceRows: TraceTableRow[] = [];

  // Initial Step: Sorted Edge List
  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: "Initialize Kruskal's Algorithm: Sort Edges by Weight",
    subtitle: `Total Vertices: |V| = ${vertices.length}, Target MST Edges: |V| - 1 = ${targetEdgesCount}`,
    category: 'GRAPH',
    algorithmName: "Kruskal's Minimum Spanning Tree",
    facultyExplanation: `Kruskal's algorithm finds a Minimum Spanning Tree (MST) by sorting all graph edges in ascending order of weight, and greedily selecting edges that do not create cycles using Disjoint Set Union (DSU).\nInitial Disjoint Sets: ${formatSets()}`,
    mathematicalDerivation: `|V| = ${vertices.length} \\implies \\text{MST contains exactly } |V|-1 = ${targetEdgesCount} \\text{ edges.}`,
    examRule: 'Step 1: Always write the complete sorted edge list table with weights first.',
    statusBadge: { text: 'Sorted Edges', variant: 'normal' },
    graphState: cloneGraphState(),
    traceTableHeaders: ['Edge (u, v)', 'Weight', 'Set(u)', 'Set(v)', 'Decision', 'Updated Disjoint Sets'],
    traceTableRows: [],
    auxiliaryState: {
      type: 'dsu',
      label: 'Disjoint Sets (DSU)',
      items: Object.values(sets).map((s) => `{${s.join(', ')}}`),
    },
  });

  for (let i = 0; i < sortedEdges.length; i++) {
    const edge = sortedEdges[i];
    const u = edge.source;
    const v = edge.target;
    const w = edge.weight ?? 0;

    const rootU = find(u);
    const rootV = find(v);

    const targetGraphEdge = edges.find((e) => e.id === edge.id);

    if (rootU !== rootV) {
      // ACCEPT Edge
      union(rootU, rootV);
      mstEdges.push(edge);
      totalCost += w;

      if (targetGraphEdge) targetGraphEdge.state = 'mst_edge';

      const row: TraceTableRow = {
        id: `kruskal-row-${edge.id}`,
        cells: [
          `(${u}, ${v})`,
          w,
          `{${sets[rootU]?.join(', ') || rootU}}`,
          `{${rootV}}`,
          'ACCEPT (No Cycle)',
          formatSets(),
        ],
        isHighlighted: true,
      };
      traceRows.push(row);

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Edge (${u}, ${v}) [Weight ${w}] $\\implies$ ACCEPTED into MST`,
        subtitle: `MST Progress: ${mstEdges.length} / ${targetEdgesCount} edges | Current Cost: ${totalCost}`,
        category: 'GRAPH',
        algorithmName: "Kruskal's Minimum Spanning Tree",
        facultyExplanation: `Examining edge (${u}, ${v}) with weight ${w}.\n• Find(${u}) = ${rootU}\n• Find(${v}) = ${rootV}\nSince ${rootU} ≠ ${rootV}, vertices are in different components. Adding this edge DOES NOT form a cycle. ACCEPT edge and merge sets.`,
        mathematicalDerivation: `\\text{Find}(${u}) \\neq \\text{Find}(${v}) \\implies \\text{ACCEPT } (${u}, ${v}), \\quad \\text{Union}(${rootU}, ${rootV})`,
        examRule: 'Accept Condition: When endpoints belong to different disjoint sets, accept the edge and perform Union.',
        statusBadge: { text: `Accepted (${u},${v})`, variant: 'success' },
        graphState: cloneGraphState(),
        activeEdgeIds: [edge.id],
        traceTableHeaders: ['Edge (u, v)', 'Weight', 'Set(u)', 'Set(v)', 'Decision', 'Updated Disjoint Sets'],
        traceTableRows: [...traceRows],
        auxiliaryState: {
          type: 'mst',
          label: `Current MST (${mstEdges.length}/${targetEdgesCount})`,
          items: mstEdges.map((e) => `(${e.source}, ${e.target}) : ${e.weight}`),
          extraInfo: `Total Cost So Far = ${totalCost}`,
        },
      });

      if (mstEdges.length === targetEdgesCount) {
        break; // MST is complete!
      }
    } else {
      // REJECT Edge (Cycle Detected)
      if (targetGraphEdge) targetGraphEdge.state = 'rejected_cycle';

      const row: TraceTableRow = {
        id: `kruskal-row-${edge.id}`,
        cells: [
          `(${u}, ${v})`,
          w,
          `{${sets[rootU]?.join(', ') || rootU}}`,
          `{${sets[rootV]?.join(', ') || rootV}}`,
          'REJECT (Cycle Detected!)',
          formatSets(),
        ],
        isHighlighted: true,
      };
      traceRows.push(row);

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Edge (${u}, ${v}) [Weight ${w}] $\\implies$ REJECTED (Cycle Detected)`,
        subtitle: `Both vertices ${u} and ${v} already belong to same component {${sets[rootU]?.join(', ')}}`,
        category: 'GRAPH',
        algorithmName: "Kruskal's Minimum Spanning Tree",
        facultyExplanation: `Examining edge (${u}, ${v}) with weight ${w}.\n• Find(${u}) = ${rootU}\n• Find(${v}) = ${rootV}\nSince Find(${u}) == Find(${v}), adding this edge would create a cycle! REJECT this edge.`,
        mathematicalDerivation: `\\text{Find}(${u}) = \\text{Find}(${v}) = ${rootU} \\implies \\mathbf{CYCLE DETECTED: Reject } (${u}, ${v})`,
        examRule: 'Reject Condition: When endpoints already belong to the same component, reject to prevent cycles.',
        statusBadge: { text: `Cycle! Reject (${u},${v})`, variant: 'danger' },
        graphState: cloneGraphState(),
        activeEdgeIds: [edge.id],
        traceTableHeaders: ['Edge (u, v)', 'Weight', 'Set(u)', 'Set(v)', 'Decision', 'Updated Disjoint Sets'],
        traceTableRows: [...traceRows],
        auxiliaryState: {
          type: 'dsu',
          label: 'Disjoint Sets (DSU)',
          items: Object.values(sets).map((s) => `{${s.join(', ')}}`),
          extraInfo: `Edge (${u}, ${v}) rejected due to cycle.`,
        },
      });
    }
  }

  // Final MST Summary
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: "Kruskal's MST Complete!",
    subtitle: `Total Minimum Spanning Tree Cost = ${totalCost}`,
    category: 'GRAPH',
    algorithmName: "Kruskal's Minimum Spanning Tree",
    facultyExplanation: `Kruskal's algorithm found the complete MST with exactly |V| - 1 = ${targetEdgesCount} edges.\nAccepted Edges:\n${mstEdges
      .map((e) => `• (${e.source}, ${e.target}) with weight ${e.weight}`)
      .join('\n')}\nTotal Minimum Cost: ${mstEdges.map((e) => e.weight).join(' + ')} = ${totalCost}`,
    mathematicalDerivation: `\\text{MST Edges} = \\{${mstEdges
      .map((e) => `(${e.source}, ${e.target})`)
      .join(', ')}\\}, \\quad \\text{Total Cost} = \\sum w(e) = ${totalCost}`,
    examRule: 'Final exam output: State the list of accepted edges, show the step-by-step arithmetic sum of weights, and draw the final MST.',
    statusBadge: { text: `Total Cost = ${totalCost}`, variant: 'success' },
    graphState: cloneGraphState(),
    traceTableHeaders: ['Edge (u, v)', 'Weight', 'Set(u)', 'Set(v)', 'Decision', 'Updated Disjoint Sets'],
    traceTableRows: [...traceRows],
    auxiliaryState: {
      type: 'mst',
      label: 'Final MST Edge Set',
      items: mstEdges.map((e) => `(${e.source}, ${e.target}) : Weight ${e.weight}`),
      extraInfo: `Total Minimum Cost = ${totalCost}`,
    },
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}
