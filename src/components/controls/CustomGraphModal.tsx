import React, { useState, useEffect } from 'react';
import { GraphData, GraphVertex, GraphEdge } from '../../types/graph';
import { X, Sparkles, AlertCircle, Plus, Trash2, BookOpen, Layers, Type, ArrowRight, CornerDownRight } from 'lucide-react';
import { layoutGraph } from '../../utils/graphLayout';
import {
  GRAPH_PRESET_STANDARD_7,
  GRAPH_PRESET_WEIGHTED_6,
  GRAPH_PRESET_DIRECTED_DIJKSTRA,
  GRAPH_PRESET_DAG_TOPO,
} from '../../data/presets';

interface CustomGraphModalProps {
  isOpen: boolean;
  algorithmId: string;
  algorithmName: string;
  currentGraph: GraphData;
  currentStartVertex: string;
  onClose: () => void;
  onSubmitGraph: (graph: GraphData, startVertex?: string) => void;
}

export const CustomGraphModal: React.FC<CustomGraphModalProps> = ({
  isOpen,
  algorithmId,
  algorithmName,
  currentGraph,
  currentStartVertex,
  onClose,
  onSubmitGraph,
}) => {
  const isWeightedAlgo = algorithmId === 'dijkstra' || algorithmId === 'kruskal' || algorithmId === 'prim';
  const isDirectedDefault = algorithmId === 'dijkstra' || algorithmId.startsWith('topo');
  const usesStartVertex = algorithmId === 'bfs' || algorithmId === 'dfs' || algorithmId === 'dijkstra' || algorithmId === 'prim';

  const [activeTab, setActiveTab] = useState<'text' | 'visual'>('text');

  // Text Syntax Input State
  const [textInput, setTextInput] = useState<string>('');
  const [textStartVertex, setTextStartVertex] = useState<string>(currentStartVertex || 'A');

  // Visual Form State
  const [vertexInput, setVertexInput] = useState<string>('');
  const [visualVertices, setVisualVertices] = useState<GraphVertex[]>([]);
  const [visualEdges, setVisualEdges] = useState<GraphEdge[]>([]);
  const [visualStartVertex, setVisualStartVertex] = useState<string>(currentStartVertex || 'A');

  // Visual Edge Form
  const [newEdgeSrc, setNewEdgeSrc] = useState<string>('');
  const [newEdgeTgt, setNewEdgeTgt] = useState<string>('');
  const [newEdgeWeight, setNewEdgeWeight] = useState<string>('1');
  const [newEdgeDirected, setNewEdgeDirected] = useState<boolean>(isDirectedDefault);

  const [error, setError] = useState<string | null>(null);

  // Sync state when opening modal
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setVisualVertices(currentGraph.vertices ? [...currentGraph.vertices] : []);
      setVisualEdges(currentGraph.edges ? [...currentGraph.edges] : []);
      setVisualStartVertex(currentStartVertex || currentGraph.vertices[0]?.id || 'A');
      setTextStartVertex(currentStartVertex || currentGraph.vertices[0]?.id || 'A');

      // Generate text representation from currentGraph
      if (currentGraph.edges && currentGraph.edges.length > 0) {
        const lines = currentGraph.edges.map((e) => {
          const arrow = e.directed ? '->' : '-';
          const weightStr = isWeightedAlgo && e.weight !== undefined ? `: ${e.weight}` : '';
          return `${e.source}${arrow}${e.target}${weightStr}`;
        });
        setTextInput(lines.join(', '));
      } else if (currentGraph.vertices && currentGraph.vertices.length > 0) {
        setTextInput(`V: ${currentGraph.vertices.map((v) => v.id).join(', ')}`);
      } else {
        setTextInput(isWeightedAlgo ? 'A-B: 4, A-C: 2, B-C: 1, B-D: 5, C-D: 8, D-E: 2' : 'A-B, A-C, B-D, C-F, D-G');
      }
    }
  }, [isOpen, currentGraph, currentStartVertex, isWeightedAlgo]);

  if (!isOpen) return null;

  // Load a quick template
  const handleLoadTemplate = (templateGraph: GraphData, startV: string = 'A') => {
    setVisualVertices([...templateGraph.vertices]);
    setVisualEdges([...templateGraph.edges]);
    setVisualStartVertex(startV);
    setTextStartVertex(startV);

    const lines = templateGraph.edges.map((e) => {
      const arrow = e.directed ? '->' : '-';
      const weightStr = isWeightedAlgo && e.weight !== undefined ? `: ${e.weight}` : '';
      return `${e.source}${arrow}${e.target}${weightStr}`;
    });
    setTextInput(lines.join(', '));
    setError(null);
  };

  // Parse Text Syntax
  const parseTextSyntax = (): { graph: GraphData; start: string } => {
    const raw = textInput.trim();
    if (!raw) {
      throw new Error('Graph definition text cannot be empty.');
    }

    const vertexSet = new Set<string>();
    const edges: GraphEdge[] = [];

    // Split by commas, semicolons, or newlines
    const tokens = raw
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('#'));

    for (const token of tokens) {
      // Check for vertex list prefix: e.g. "V: A, B, C, D" or "Vertices: A B C"
      if (token.toUpperCase().startsWith('V:') || token.toUpperCase().startsWith('VERTICES:')) {
        const vList = token.split(':')[1]?.split(/[\s,]+/);
        vList?.forEach((v) => {
          const clean = v.trim();
          if (clean) vertexSet.add(clean);
        });
        continue;
      }

      // Check for edge: e.g. "A->B: 4", "A-B: 4", "A->B(4)", "A-B(4)", "1->2", "A - B = 4"
      // Regex matches: Source (arrow) Target (: or = or () Weight)?
      const edgeMatch = token.match(/^([A-Za-z0-9_]+)\s*(->|=>|-|—)\s*([A-Za-z0-9_]+)(?:[:=\s(]+([0-9.]+)\)?)?$/);

      if (edgeMatch) {
        const u = edgeMatch[1].trim();
        const arrow = edgeMatch[2].trim();
        const v = edgeMatch[3].trim();
        const wStr = edgeMatch[4];

        if (u === v) continue; // Skip self loop

        vertexSet.add(u);
        vertexSet.add(v);

        const isDirected = arrow === '->' || arrow === '=>' || isDirectedDefault;
        const weight = isWeightedAlgo ? (wStr !== undefined ? Number(wStr) : 1) : undefined;

        edges.push({
          id: `e-${u}-${v}-${edges.length}`,
          source: u,
          target: v,
          weight: weight !== undefined && !isNaN(weight) ? weight : undefined,
          directed: isDirected,
          state: 'unvisited',
        });
      } else {
        // Might be a single vertex token like "A" or "1"
        const singleVMatch = token.match(/^[A-Za-z0-9_]+$/);
        if (singleVMatch) {
          vertexSet.add(singleVMatch[0].trim());
        } else {
          throw new Error(`Unrecognized edge or vertex syntax: "${token}". Expected format: ${isWeightedAlgo ? 'A-B: 4 or A->B: 4' : 'A-B or A->B'}`);
        }
      }
    }

    if (vertexSet.size === 0) {
      throw new Error('No valid vertices or edges were found in the input.');
    }

    const vertices: GraphVertex[] = Array.from(vertexSet).map((id) => ({
      id,
      label: id,
      x: 0,
      y: 0,
      state: 'unvisited',
    }));

    const finalStart = textStartVertex.trim() && vertexSet.has(textStartVertex.trim())
      ? textStartVertex.trim()
      : vertices[0].id;

    return {
      graph: layoutGraph({ vertices, edges }),
      start: finalStart,
    };
  };

  // Handle Submit from Text Tab
  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { graph, start } = parseTextSyntax();
      onSubmitGraph(graph, start);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to parse graph syntax.');
    }
  };

  // Handle Submit from Visual Tab
  const handleSubmitVisual = () => {
    setError(null);
    if (visualVertices.length === 0) {
      setError('Please add at least one vertex to the graph.');
      return;
    }

    const start = visualStartVertex || visualVertices[0].id;
    const laidOut = layoutGraph({
      vertices: visualVertices,
      edges: visualEdges,
    });

    onSubmitGraph(laidOut, start);
    onClose();
  };

  // Visual Tab: Add Vertex
  const handleAddVisualVertices = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vertexInput.trim()) return;

    const raw = vertexInput
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updated = [...visualVertices];
    raw.forEach((lbl) => {
      if (!updated.some((v) => v.id.toLowerCase() === lbl.toLowerCase())) {
        updated.push({
          id: lbl,
          label: lbl,
          x: 0,
          y: 0,
          state: 'unvisited',
        });
      }
    });

    setVisualVertices(updated);
    if (!visualStartVertex && updated.length > 0) {
      setVisualStartVertex(updated[0].id);
    }
    setVertexInput('');
  };

  // Visual Tab: Add Edge
  const handleAddVisualEdge = (e: React.FormEvent) => {
    e.preventDefault();
    const src = newEdgeSrc.trim() || visualVertices[0]?.id;
    const tgt = newEdgeTgt.trim() || visualVertices[1]?.id;

    if (!src || !tgt || src === tgt) return;

    // Ensure vertices exist
    let updatedVertices = [...visualVertices];
    if (!updatedVertices.some((v) => v.id === src)) {
      updatedVertices.push({ id: src, label: src, x: 0, y: 0, state: 'unvisited' });
    }
    if (!updatedVertices.some((v) => v.id === tgt)) {
      updatedVertices.push({ id: tgt, label: tgt, x: 0, y: 0, state: 'unvisited' });
    }

    const weightNum = isWeightedAlgo ? (Number(newEdgeWeight) || 1) : undefined;
    const edgeId = `e-${src}-${tgt}-${Date.now()}`;

    const cleanEdges = visualEdges.filter(
      (e) => !(e.source === src && e.target === tgt) && (newEdgeDirected || !(e.source === tgt && e.target === src))
    );

    const newEdge: GraphEdge = {
      id: edgeId,
      source: src,
      target: tgt,
      weight: weightNum,
      directed: newEdgeDirected,
      state: 'unvisited',
    };

    setVisualVertices(updatedVertices);
    setVisualEdges([...cleanEdges, newEdge]);
    setNewEdgeSrc('');
    setNewEdgeTgt('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221F1E]/40 backdrop-blur-xs p-3.5 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#C4B59D] rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#F4EFE6] border-b border-[#E2D8C7] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <Sparkles className="w-5 h-5 text-[#8C2D19] shrink-0" />
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#221F1E] m-0 truncate">
                Custom Graph Question Builder
              </h3>
              <p className="text-[11px] sm:text-xs text-[#59524A] font-serif italic m-0 truncate">
                Target Algorithm: <span className="font-semibold text-[#8C2D19]">{algorithmName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#847B72] hover:text-[#221F1E] hover:bg-[#EDE5D8]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Templates Bar */}
        <div className="px-4 sm:px-6 py-2 bg-[#FAF8F5] border-b border-[#E2D8C7] overflow-x-auto flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-serif font-bold text-[#8C2D19] uppercase tracking-wider shrink-0 mr-1">
            Presets:
          </span>
          <button
            type="button"
            onClick={() => handleLoadTemplate(GRAPH_PRESET_DIRECTED_DIJKSTRA, 'A')}
            className="px-2.5 py-1 rounded text-xs font-serif bg-[#F4EFE6] hover:bg-[#EDE5D8] text-[#59524A] hover:text-[#221F1E] border border-[#D4C6B1] whitespace-nowrap"
          >
            6-Node Directed Weighted
          </button>
          <button
            type="button"
            onClick={() => handleLoadTemplate(GRAPH_PRESET_WEIGHTED_6, 'A')}
            className="px-2.5 py-1 rounded text-xs font-serif bg-[#F4EFE6] hover:bg-[#EDE5D8] text-[#59524A] hover:text-[#221F1E] border border-[#D4C6B1] whitespace-nowrap"
          >
            6-Node Undirected Weighted
          </button>
          <button
            type="button"
            onClick={() => handleLoadTemplate(GRAPH_PRESET_STANDARD_7, 'A')}
            className="px-2.5 py-1 rounded text-xs font-serif bg-[#F4EFE6] hover:bg-[#EDE5D8] text-[#59524A] hover:text-[#221F1E] border border-[#D4C6B1] whitespace-nowrap"
          >
            7-Node Undirected (BFS/DFS)
          </button>
          <button
            type="button"
            onClick={() => handleLoadTemplate(GRAPH_PRESET_DAG_TOPO, '1')}
            className="px-2.5 py-1 rounded text-xs font-serif bg-[#F4EFE6] hover:bg-[#EDE5D8] text-[#59524A] hover:text-[#221F1E] border border-[#D4C6B1] whitespace-nowrap"
          >
            6-Node DAG (Topo Sort)
          </button>
          <button
            type="button"
            onClick={() => {
              setVisualVertices([]);
              setVisualEdges([]);
              setTextInput('');
            }}
            className="px-2.5 py-1 rounded text-xs font-serif bg-[#FDF2F0] text-[#8C2D19] border border-[#F2C0B8] hover:bg-[#8C2D19] hover:text-[#FAF8F5] whitespace-nowrap"
          >
            Blank Slate
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#E2D8C7] px-4 sm:px-6 bg-[#FAF8F5] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-serif font-bold border-b-2 transition-all ${
              activeTab === 'text'
                ? 'border-[#8C2D19] text-[#8C2D19]'
                : 'border-transparent text-[#59524A] hover:text-[#221F1E]'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Fast Text / Problem Syntax</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-serif font-bold border-b-2 transition-all ${
              activeTab === 'visual'
                ? 'border-[#8C2D19] text-[#8C2D19]'
                : 'border-transparent text-[#59524A] hover:text-[#221F1E]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Visual Graph Form</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-[#8C2D19] bg-[#8C2D19]/10 border border-[#8C2D19]/20 p-2.5 rounded-lg font-serif">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: Fast Text Syntax */}
          {activeTab === 'text' && (
            <form onSubmit={handleSubmitText} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-semibold text-[#59524A] uppercase tracking-wider mb-1.5">
                  Graph Edge List / Adjacency Syntax
                </label>
                <textarea
                  rows={5}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={
                    isWeightedAlgo
                      ? "e.g. A-B: 4, A-C: 2, B-C: 1, B-D: 5, C-D: 8, D-E: 2 (or 1->2: 4, 1->3: 2)"
                      : "e.g. A-B, A-C, B-D, C-F, D-G (or 1->2, 1->3, 2->4, 3->4)"
                  }
                  className="w-full px-3 py-2 border border-[#C4B59D] rounded-lg bg-[#FAF8F5] text-[#221F1E] font-mono text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8C2D19]/40 leading-relaxed"
                />
                <div className="mt-1.5 p-2.5 rounded-lg bg-[#F4EFE6] border border-[#E2D8C7] text-[11px] font-serif text-[#59524A] space-y-1">
                  <p className="font-bold text-[#221F1E] m-0">Supported Question Syntax Examples:</p>
                  {isWeightedAlgo ? (
                    <>
                      <p className="m-0 font-mono text-[10.5px] text-[#8C2D19]">
                        • Undirected Weighted: <span className="text-[#221F1E]">A-B: 4, A-C: 2, B-D: 5</span>
                      </p>
                      <p className="m-0 font-mono text-[10.5px] text-[#8C2D19]">
                        • Directed Weighted: <span className="text-[#221F1E]">A-&gt;B: 4, A-&gt;C: 2, B-&gt;D: 5</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="m-0 font-mono text-[10.5px] text-[#8C2D19]">
                        • Undirected Traversal (BFS/DFS): <span className="text-[#221F1E]">A-B, A-C, B-D, C-F, D-G</span>
                      </p>
                      <p className="m-0 font-mono text-[10.5px] text-[#8C2D19]">
                        • Directed Traversal / DAG: <span className="text-[#221F1E]">1-&gt;2, 1-&gt;3, 2-&gt;4, 3-&gt;4</span>
                      </p>
                    </>
                  )}
                  <p className="m-0 font-mono text-[10.5px] text-[#8C2D19]">
                    • Standalone Vertices: <span className="text-[#221F1E]">V: A, B, C, D, E, F</span>
                  </p>
                </div>
              </div>

              {/* Start Vertex Selector */}
              {usesStartVertex && (
                <div className="flex items-center gap-3">
                  <label className="text-xs font-serif font-semibold text-[#59524A] uppercase tracking-wider">
                    Start / Source Vertex:
                  </label>
                  <input
                    type="text"
                    value={textStartVertex}
                    onChange={(e) => setTextStartVertex(e.target.value)}
                    placeholder="e.g. A or 1"
                    className="w-24 px-3 py-1.5 border border-[#C4B59D] rounded-lg bg-[#FAF8F5] text-[#221F1E] font-mono text-sm text-center font-bold"
                  />
                  <span className="text-[11px] text-[#847B72] font-serif italic">
                    (Used for BFS, DFS, Dijkstra, Prim)
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-[#E2D8C7]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-serif text-[#59524A] hover:bg-[#F4EFE6] rounded-lg border border-[#E2D8C7] text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-serif font-bold text-[#FAF8F5] bg-[#8C2D19] hover:bg-[#722312] rounded-lg shadow-xs transition-all text-center"
                >
                  Parse Graph & Generate Derivations
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Visual Graph Form */}
          {activeTab === 'visual' && (
            <div className="space-y-4">
              {/* Vertices Manager */}
              <div>
                <label className="block text-xs font-serif font-semibold text-[#59524A] uppercase tracking-wider mb-1.5">
                  Graph Vertices ({visualVertices.length})
                </label>
                <div className="flex items-center gap-1.5 flex-wrap p-2.5 bg-[#FAF8F5] border border-[#C4B59D] rounded-lg min-h-[44px]">
                  {visualVertices.map((v) => (
                    <span
                      key={v.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F4EFE6] border border-[#D4C6B1] text-xs font-mono font-bold text-[#221F1E]"
                    >
                      <span>{v.label}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setVisualVertices(visualVertices.filter((vert) => vert.id !== v.id));
                          setVisualEdges(visualEdges.filter((e) => e.source !== v.id && e.target !== v.id));
                        }}
                        className="text-[#847B72] hover:text-[#8C2D19] ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {visualVertices.length === 0 && (
                    <span className="text-xs text-[#847B72] font-serif italic">No vertices added yet.</span>
                  )}
                </div>

                <form onSubmit={handleAddVisualVertices} className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={vertexInput}
                    onChange={(e) => setVertexInput(e.target.value)}
                    placeholder="Add vertex labels (e.g. A, B, C or 1, 2, 3)"
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm font-mono bg-[#FAF8F5] border border-[#C4B59D] rounded-lg text-[#221F1E]"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF8F5] text-[#8C2D19] border-2 border-[#8C2D19] text-xs font-serif font-bold hover:bg-[#8C2D19] hover:text-[#FAF8F5] transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Vertices</span>
                  </button>
                </form>
              </div>

              {/* Start Vertex Selector */}
              {usesStartVertex && visualVertices.length > 0 && (
                <div className="flex items-center gap-3">
                  <label className="text-xs font-serif font-semibold text-[#59524A] uppercase tracking-wider">
                    Start Vertex:
                  </label>
                  <select
                    value={visualStartVertex}
                    onChange={(e) => setVisualStartVertex(e.target.value)}
                    className="px-3 py-1.5 border border-[#C4B59D] rounded-lg bg-[#FAF8F5] text-[#221F1E] font-mono text-sm font-bold"
                  >
                    {visualVertices.map((v) => (
                      <option key={`start-${v.id}`} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Add Edge Form */}
              <form onSubmit={handleAddVisualEdge} className="p-3 bg-[#F4EFE6] border border-[#E2D8C7] rounded-lg space-y-2">
                <span className="block text-xs font-serif font-bold text-[#59524A] uppercase tracking-wider">
                  Add Graph Edge:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={newEdgeSrc || (visualVertices[0]?.id || '')}
                    onChange={(e) => setNewEdgeSrc(e.target.value)}
                    className="px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#C4B59D] rounded text-[#221F1E]"
                  >
                    {visualVertices.map((v) => (
                      <option key={`form-src-${v.id}`} value={v.id}>
                        From: {v.label}
                      </option>
                    ))}
                  </select>

                  <span className="text-xs font-bold text-[#8C6D3B]">{newEdgeDirected ? '→' : '⇄'}</span>

                  <select
                    value={newEdgeTgt || (visualVertices[1]?.id || visualVertices[0]?.id || '')}
                    onChange={(e) => setNewEdgeTgt(e.target.value)}
                    className="px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#C4B59D] rounded text-[#221F1E]"
                  >
                    {visualVertices.map((v) => (
                      <option key={`form-tgt-${v.id}`} value={v.id}>
                        To: {v.label}
                      </option>
                    ))}
                  </select>

                  {isWeightedAlgo && (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-serif text-[#59524A]">Weight:</span>
                      <input
                        type="number"
                        value={newEdgeWeight}
                        onChange={(e) => setNewEdgeWeight(e.target.value)}
                        className="w-16 px-2 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#C4B59D] rounded text-[#221F1E] text-center"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-1 text-xs font-serif text-[#59524A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEdgeDirected}
                      onChange={(e) => setNewEdgeDirected(e.target.checked)}
                      className="rounded border-[#C4B59D] text-[#8C2D19]"
                    />
                    <span>Directed</span>
                  </label>

                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#8C6D3B] text-[#FAF8F5] text-xs font-serif font-bold hover:bg-[#73572D] transition-all"
                  >
                    <span>+ Add Edge</span>
                  </button>
                </div>
              </form>

              {/* Edge List Table */}
              <div className="border border-[#E2D8C7] rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs font-serif">
                  <thead className="bg-[#EDE5D8] border-b border-[#D4C6B1] text-[#221F1E]">
                    <tr>
                      <th className="py-1.5 px-3">From</th>
                      <th className="py-1.5 px-3">To</th>
                      <th className="py-1.5 px-3">Type</th>
                      {isWeightedAlgo && <th className="py-1.5 px-3">Weight</th>}
                      <th className="py-1.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2D8C7] bg-[#FAF8F5]">
                    {visualEdges.map((e, idx) => (
                      <tr key={e.id || idx}>
                        <td className="py-1 px-3 font-mono font-bold text-[#221F1E]">{e.source}</td>
                        <td className="py-1 px-3 font-mono font-bold text-[#221F1E]">{e.target}</td>
                        <td className="py-1 px-3 font-mono">{e.directed ? 'Directed (→)' : 'Undirected (⇄)'}</td>
                        {isWeightedAlgo && (
                          <td className="py-1 px-3 font-mono">
                            <input
                              type="number"
                              value={e.weight ?? ''}
                              onChange={(ev) => {
                                const val = ev.target.value ? Number(ev.target.value) : undefined;
                                const copy = [...visualEdges];
                                copy[idx].weight = val;
                                setVisualEdges(copy);
                              }}
                              className="w-16 px-1.5 py-0.5 border border-[#C4B59D] rounded bg-[#FAF8F5] text-center font-mono"
                            />
                          </td>
                        )}
                        <td className="py-1 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setVisualEdges(visualEdges.filter((_, i) => i !== idx))}
                            className="p-1 text-[#8C2D19] hover:bg-[#FDF2F0] rounded"
                            title="Delete edge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {visualEdges.length === 0 && (
                      <tr>
                        <td colSpan={isWeightedAlgo ? 5 : 4} className="py-3 px-3 text-center text-[#847B72] italic">
                          No edges connected yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-[#E2D8C7]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-serif text-[#59524A] hover:bg-[#F4EFE6] rounded-lg border border-[#E2D8C7] text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitVisual}
                  className="px-5 py-2 text-xs font-serif font-bold text-[#FAF8F5] bg-[#8C2D19] hover:bg-[#722312] rounded-lg shadow-xs transition-all text-center"
                >
                  Save Graph & Generate Derivations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
