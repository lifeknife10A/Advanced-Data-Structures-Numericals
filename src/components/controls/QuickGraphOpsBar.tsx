import React, { useState } from 'react';
import { GraphData, GraphVertex, GraphEdge } from '../../types/graph';
import { PlusCircle, Trash2, ArrowRight, CornerDownRight, RotateCcw, Star, Link, Sparkles } from 'lucide-react';
import { layoutGraph } from '../../utils/graphLayout';

interface QuickGraphOpsBarProps {
  algorithmId: string;
  graph: GraphData;
  startVertex: string;
  onUpdateGraph: (graph: GraphData, startVertex?: string) => void;
  onResetToDefault: () => void;
  onOpenModal: () => void;
}

export const QuickGraphOpsBar: React.FC<QuickGraphOpsBarProps> = ({
  algorithmId,
  graph,
  startVertex,
  onUpdateGraph,
  onResetToDefault,
  onOpenModal,
}) => {
  const isWeightedAlgo = algorithmId === 'dijkstra' || algorithmId === 'kruskal' || algorithmId === 'prim';
  const isDirectedDefault = algorithmId === 'dijkstra' || algorithmId.startsWith('topo');
  const usesStartVertex = algorithmId === 'bfs' || algorithmId === 'dfs' || algorithmId === 'dijkstra' || algorithmId === 'prim';

  const [newVertexLabel, setNewVertexLabel] = useState<string>('');
  const [edgeSource, setEdgeSource] = useState<string>('');
  const [edgeTarget, setEdgeTarget] = useState<string>('');
  const [edgeWeight, setEdgeWeight] = useState<string>('1');
  const [edgeDirected, setEdgeDirected] = useState<boolean>(isDirectedDefault);
  const [showEdgeList, setShowEdgeList] = useState<boolean>(false);

  const vertices = graph.vertices || [];
  const edges = graph.edges || [];

  // Add a single vertex or multiple comma-separated vertices
  const handleAddVertex = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVertexLabel.trim()) return;

    const rawLabels = newVertexLabel
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatedVertices = [...vertices];
    let newStart = startVertex;

    rawLabels.forEach((lbl) => {
      // Check if ID already exists
      const exists = updatedVertices.some((v) => v.id.toLowerCase() === lbl.toLowerCase());
      if (!exists) {
        updatedVertices.push({
          id: lbl,
          label: lbl,
          x: 0,
          y: 0,
          state: 'unvisited',
        });
        if (!newStart) newStart = lbl;
      }
    });

    const newGraphData = layoutGraph({
      vertices: updatedVertices,
      edges,
    });

    onUpdateGraph(newGraphData, newStart);
    setNewVertexLabel('');
  };

  // Delete a vertex and its connected edges
  const handleDeleteVertex = (vertexId: string) => {
    const updatedVertices = vertices.filter((v) => v.id !== vertexId);
    const updatedEdges = edges.filter((e) => e.source !== vertexId && e.target !== vertexId);
    let newStart = startVertex === vertexId ? (updatedVertices[0]?.id || '') : startVertex;

    const newGraphData = layoutGraph({
      vertices: updatedVertices,
      edges: updatedEdges,
    });

    onUpdateGraph(newGraphData, newStart);
  };

  // Add/Connect an Edge
  const handleAddEdge = (e: React.FormEvent) => {
    e.preventDefault();
    const src = edgeSource.trim() || vertices[0]?.id;
    const tgt = edgeTarget.trim() || vertices[1]?.id;

    if (!src || !tgt) return;
    if (src === tgt) return; // Prevent self loops

    // Ensure both vertices exist or add them
    let updatedVertices = [...vertices];
    if (!updatedVertices.some((v) => v.id === src)) {
      updatedVertices.push({ id: src, label: src, x: 0, y: 0, state: 'unvisited' });
    }
    if (!updatedVertices.some((v) => v.id === tgt)) {
      updatedVertices.push({ id: tgt, label: tgt, x: 0, y: 0, state: 'unvisited' });
    }

    const weightNum = isWeightedAlgo ? (Number(edgeWeight) || 1) : (edgeWeight.trim() ? Number(edgeWeight) : undefined);
    const edgeId = `e-${src}-${tgt}-${Date.now()}`;

    // Remove existing edge between same endpoints if present
    const cleanEdges = edges.filter(
      (e) => !(e.source === src && e.target === tgt) && (edgeDirected || !(e.source === tgt && e.target === src))
    );

    const newEdge: GraphEdge = {
      id: edgeId,
      source: src,
      target: tgt,
      weight: weightNum,
      directed: edgeDirected,
      state: 'unvisited',
    };

    const newGraphData = layoutGraph({
      vertices: updatedVertices,
      edges: [...cleanEdges, newEdge],
    });

    onUpdateGraph(newGraphData, startVertex || src);
    setEdgeSource('');
    setEdgeTarget('');
  };

  // Delete an edge
  const handleDeleteEdge = (edgeId: string) => {
    const updatedEdges = edges.filter((e) => e.id !== edgeId);
    onUpdateGraph({ vertices, edges: updatedEdges }, startVertex);
  };

  // Set start vertex
  const handleSetStart = (vId: string) => {
    onUpdateGraph(graph, vId);
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#C4B59D] rounded-xl p-3 sm:p-4 shadow-xs space-y-3">
      {/* Row 1: Vertices Management & Start Node Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#E2D8C7]">
        {/* Current Vertices with Start Star and Delete X */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-xs sm:text-sm font-serif font-bold text-[#59524A] flex items-center gap-1.5 shrink-0">
            <CornerDownRight className="w-4 h-4 text-[#8C2D19]" />
            <span>Vertices ({vertices.length}):</span>
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {vertices.map((v) => {
              const isStart = v.id === startVertex && usesStartVertex;

              return (
                <div
                  key={v.id}
                  className={`group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-mono font-bold transition-all min-h-[32px] border ${
                    isStart
                      ? 'bg-[#FAF0EE] text-[#8C2D19] border-[#8C2D19] shadow-2xs'
                      : 'bg-[#F4EFE6] text-[#221F1E] border-[#D4C6B1] hover:border-[#8C2D19]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSetStart(v.id)}
                    title={usesStartVertex ? (isStart ? 'Current Starting Vertex' : `Click to set ${v.id} as Start Vertex`) : `Vertex ${v.id}`}
                    className="flex items-center gap-1 hover:underline"
                  >
                    {isStart && <Star className="w-3 h-3 text-[#8C2D19] fill-[#8C2D19]" />}
                    <span>{v.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVertex(v.id)}
                    title={`Delete Vertex ${v.id}`}
                    className="text-[#847B72] hover:text-[#8C2D19] ml-1 p-0.5 rounded hover:bg-[#EDE5D8]"
                  >
                    ×
                  </button>
                </div>
              );
            })}

            {vertices.length === 0 && (
              <span className="text-xs italic text-[#847B72] font-serif">No vertices yet. Add one below.</span>
            )}
          </div>
        </div>

        {/* Quick Add Vertex Form */}
        <form onSubmit={handleAddVertex} className="flex items-center gap-2 w-full lg:w-auto shrink-0">
          <input
            type="text"
            value={newVertexLabel}
            onChange={(e) => setNewVertexLabel(e.target.value)}
            placeholder="Add node (e.g. H or 7)"
            className="w-full sm:w-44 px-3 py-1.5 text-xs sm:text-sm font-mono bg-[#FAF8F5] border border-[#C4B59D] rounded-lg focus:outline-hidden focus:border-[#8C2D19] text-[#221F1E]"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] text-[#8C2D19] border-2 border-[#8C2D19] text-xs sm:text-sm font-serif font-bold hover:bg-[#8C2D19] hover:text-[#FAF8F5] shadow-2xs transition-all shrink-0 min-h-[34px]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>
        </form>
      </div>

      {/* Row 2: Add Edge & Edit Connections */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Add Edge Form */}
        <form onSubmit={handleAddEdge} className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5">
            <Link className="w-4 h-4 text-[#8C6D3B]" />
            <span className="text-xs font-serif font-bold text-[#59524A] uppercase tracking-wider">Connect:</span>
          </div>

          {/* Source Dropdown / Input */}
          <select
            value={edgeSource || (vertices[0]?.id || '')}
            onChange={(e) => setEdgeSource(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#C4B59D] rounded-lg text-[#221F1E]"
          >
            {vertices.map((v) => (
              <option key={`src-${v.id}`} value={v.id}>
                From: {v.label}
              </option>
            ))}
          </select>

          {/* Direction Indicator */}
          <span className="text-xs font-bold text-[#8C6D3B]">{edgeDirected ? '→' : '⇄'}</span>

          {/* Target Dropdown / Input */}
          <select
            value={edgeTarget || (vertices[1]?.id || vertices[0]?.id || '')}
            onChange={(e) => setEdgeTarget(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#C4B59D] rounded-lg text-[#221F1E]"
          >
            {vertices.map((v) => (
              <option key={`tgt-${v.id}`} value={v.id}>
                To: {v.label}
              </option>
            ))}
          </select>

          {/* Weight Input (For Dijkstra, Kruskal, Prim, or optional) */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-serif font-semibold text-[#59524A]">Weight:</span>
            <input
              type="number"
              value={edgeWeight}
              onChange={(e) => setEdgeWeight(e.target.value)}
              placeholder="wt"
              className="w-14 px-2 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#C4B59D] rounded-lg text-[#221F1E] text-center"
            />
          </div>

          {/* Directed Checkbox */}
          <label className="flex items-center gap-1 text-xs font-serif text-[#59524A] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={edgeDirected}
              onChange={(e) => setEdgeDirected(e.target.checked)}
              className="rounded border-[#C4B59D] text-[#8C2D19] focus:ring-[#8C2D19]"
            />
            <span>Directed</span>
          </label>

          {/* Submit Edge */}
          <button
            type="submit"
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF8F5] text-[#8C6D3B] border border-[#8C6D3B] hover:bg-[#8C6D3B] hover:text-[#FAF8F5] text-xs font-serif font-bold transition-all shadow-2xs min-h-[32px]"
          >
            <span>+ Edge</span>
          </button>
        </form>

        {/* Action Controls: Full Graph Builder Modal & Reset */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowEdgeList(!showEdgeList)}
            className="px-2.5 py-1 text-xs font-serif text-[#59524A] hover:text-[#221F1E] bg-[#F4EFE6] border border-[#E2D8C7] rounded-md transition-all"
          >
            {showEdgeList ? 'Hide Edge Chips' : `Edges (${edges.length}) ▾`}
          </button>

          <button
            type="button"
            onClick={onOpenModal}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-serif font-bold bg-[#FAF0EE] text-[#8C2D19] border border-[#F2C0B8] hover:bg-[#8C2D19] hover:text-[#FAF8F5] rounded-md shadow-2xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Full Graph Builder & Syntax</span>
          </button>

          <button
            type="button"
            onClick={onResetToDefault}
            title="Reset to standard algorithm preset"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-serif text-[#847B72] hover:text-[#8C2D19] bg-[#FAF8F5] border border-[#E2D8C7] rounded-md transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Collapsible Edge Chips List */}
      {showEdgeList && (
        <div className="pt-2 border-t border-[#E2D8C7] flex items-center gap-1.5 flex-wrap animate-in fade-in duration-150">
          <span className="text-[11px] font-serif font-bold text-[#59524A]">Active Edges:</span>
          {edges.map((e) => (
            <span
              key={e.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F4EFE6] border border-[#D4C6B1] text-xs font-mono text-[#221F1E]"
            >
              <span>
                {e.source} {e.directed ? '→' : '—'} {e.target} {e.weight !== undefined ? `(${e.weight})` : ''}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteEdge(e.id)}
                title="Remove edge"
                className="text-[#847B72] hover:text-[#8C2D19] ml-0.5 font-bold"
              >
                ×
              </button>
            </span>
          ))}
          {edges.length === 0 && (
            <span className="text-xs italic text-[#847B72] font-serif">No edges connected.</span>
          )}
        </div>
      )}
    </div>
  );
};
