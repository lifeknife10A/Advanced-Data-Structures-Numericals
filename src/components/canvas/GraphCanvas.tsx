import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GraphVertex, GraphEdge } from '../../types/graph';
import { Move, RefreshCw, Grid, GitFork, Sparkles } from 'lucide-react';
import { applyCircularLayout, applyGridLayout, applyLayeredLayout } from '../../utils/graphLayout';

interface GraphCanvasProps {
  vertices?: GraphVertex[];
  edges?: GraphEdge[];
  activeNodeIds?: string[];
  activeEdgeIds?: string[];
  algorithmName?: string;
  onUpdateVertices?: (vertices: GraphVertex[]) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  vertices = [],
  edges = [],
  activeNodeIds = [],
  activeEdgeIds = [],
  algorithmName = '',
  onUpdateVertices,
}) => {
  const canvasWidth = 900;
  const canvasHeight = 580;

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Local mutable positions for 60fps smooth dragging
  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingVertexId, setDraggingVertexId] = useState<string | null>(null);

  // Sync positions when vertices prop changes externally
  useEffect(() => {
    const posMap: Record<string, { x: number; y: number }> = {};
    vertices.forEach((v) => {
      posMap[v.id] = { x: v.x, y: v.y };
    });
    setLocalPositions(posMap);
  }, [vertices]);

  // Coordinate scales: 600x360 logic coords -> 900x580 SVG coords
  const scaleX = useCallback((x: number) => (x / 600) * 800 + 50, []);
  const scaleY = useCallback((y: number) => (y / 360) * 460 + 60, []);

  // Inverse scale: 900x580 SVG coords -> 600x360 logic coords
  const unscaleX = useCallback((svgX: number) => Math.round(Math.max(15, Math.min(585, ((svgX - 50) / 800) * 600))), []);
  const unscaleY = useCallback((svgY: number) => Math.round(Math.max(15, Math.min(345, ((svgY - 60) / 460) * 360))), []);

  // Get SVG coordinate from mouse / touch event
  const getSVGCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }, []);

  // Handle Drag Start
  const handleStartDrag = (vertexId: string, clientX: number, clientY: number) => {
    setDraggingVertexId(vertexId);
  };

  // Handle Drag Move (Desktop & Touch)
  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!draggingVertexId) return;

      const svgPt = getSVGCoordinates(clientX, clientY);
      if (!svgPt) return;

      const graphX = unscaleX(svgPt.x);
      const graphY = unscaleY(svgPt.y);

      setLocalPositions((prev) => ({
        ...prev,
        [draggingVertexId]: { x: graphX, y: graphY },
      }));
    },
    [draggingVertexId, getSVGCoordinates, unscaleX, unscaleY]
  );

  // Handle Drag End
  const handleEndDrag = useCallback(() => {
    if (!draggingVertexId) return;

    if (onUpdateVertices) {
      const updated = vertices.map((v) => {
        const pos = localPositions[v.id];
        return pos ? { ...v, x: pos.x, y: pos.y } : v;
      });
      onUpdateVertices(updated);
    }

    setDraggingVertexId(null);
  }, [draggingVertexId, localPositions, onUpdateVertices, vertices]);

  // Window pointer listeners for smooth dragging outside SVG boundary
  useEffect(() => {
    if (!draggingVertexId) return;

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onMouseUp = () => {
      handleEndDrag();
    };
    const onTouchEnd = () => {
      handleEndDrag();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [draggingVertexId, handlePointerMove, handleEndDrag]);

  // Apply Layout Presets on the fly
  const handleApplyLayout = (layoutType: 'circle' | 'grid' | 'layered') => {
    const currentGraph = {
      vertices: vertices.map((v) => ({ ...v, x: localPositions[v.id]?.x ?? v.x, y: localPositions[v.id]?.y ?? v.y })),
      edges,
    };

    let laidOut = currentGraph;
    if (layoutType === 'circle') {
      laidOut = applyCircularLayout(currentGraph);
    } else if (layoutType === 'grid') {
      laidOut = applyGridLayout(currentGraph);
    } else if (layoutType === 'layered') {
      laidOut = applyLayeredLayout(currentGraph);
    }

    if (onUpdateVertices) {
      onUpdateVertices(laidOut.vertices);
    }
  };

  if (vertices.length === 0) {
    return (
      <div className="w-full h-[340px] sm:h-[460px] md:h-[580px] flex items-center justify-center bg-[#FAF8F5] border border-[#E2D8C7] rounded-2xl text-[#847B72] font-serif p-4 sm:p-8 shadow-inner text-center">
        <p className="text-base sm:text-xl italic font-serif">No graph data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[340px] sm:h-[460px] md:h-[580px] bg-[#FAF8F5] border border-[#E2D8C7] rounded-2xl overflow-hidden relative shadow-inner select-none">
      {/* Top Floating Layout Preset Toolbar & Drag Hint */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 sm:gap-2 flex-wrap max-w-[calc(100%-120px)]">
        <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F5]/90 border border-[#C4B59D] text-[11px] font-serif text-[#59524A] shadow-xs backdrop-blur-xs">
          <Move className="w-3.5 h-3.5 text-[#8C2D19]" />
          <span>Drag nodes to match exam paper</span>
        </div>

        {/* Layout Switcher Buttons */}
        <div className="flex items-center gap-1 bg-[#FAF8F5]/90 border border-[#C4B59D] p-0.5 rounded-lg shadow-xs backdrop-blur-xs">
          <button
            type="button"
            onClick={() => handleApplyLayout('circle')}
            title="Arrange in Circle"
            className="px-2 py-1 text-[10.5px] font-serif font-semibold text-[#59524A] hover:text-[#8C2D19] hover:bg-[#EDE5D8] rounded transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3 text-[#8C6D3B]" />
            <span className="hidden sm:inline">Circle</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyLayout('grid')}
            title="Arrange in Grid / Columns"
            className="px-2 py-1 text-[10.5px] font-serif font-semibold text-[#59524A] hover:text-[#8C2D19] hover:bg-[#EDE5D8] rounded transition-all flex items-center gap-1"
          >
            <Grid className="w-3 h-3 text-[#8C6D3B]" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyLayout('layered')}
            title="Arrange in Left-to-Right Layers (DAG)"
            className="px-2 py-1 text-[10.5px] font-serif font-semibold text-[#59524A] hover:text-[#8C2D19] hover:bg-[#EDE5D8] rounded transition-all flex items-center gap-1"
          >
            <GitFork className="w-3 h-3 text-[#8C6D3B]" />
            <span className="hidden sm:inline">Layered</span>
          </button>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full h-full select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Arrowhead marker for directed edges */}
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="30"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8C6D3B" />
          </marker>
          <marker
            id="arrowhead-active"
            viewBox="0 0 10 10"
            refX="30"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8C2D19" />
          </marker>

          {/* Node shadow filter */}
          <filter id="graph-node-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#221F1E" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Graph Edges */}
        <g className="edges">
          {edges.map((edge) => {
            const u = vertices.find((v) => v.id === edge.source);
            const v = vertices.find((vert) => vert.id === edge.target);
            if (!u || !v) return null;

            const uRawX = localPositions[u.id]?.x ?? u.x;
            const uRawY = localPositions[u.id]?.y ?? u.y;
            const vRawX = localPositions[v.id]?.x ?? v.x;
            const vRawY = localPositions[v.id]?.y ?? v.y;

            const uX = scaleX(uRawX);
            const uY = scaleY(uRawY);
            const vX = scaleX(vRawX);
            const vY = scaleY(vRawY);

            const isMst = edge.state === 'mst_edge';
            const isTreeEdge = edge.state === 'tree_edge';
            const isRejected = edge.state === 'rejected_cycle';
            const isCrossBack = edge.state === 'back_edge' || edge.state === 'cross_edge';
            const isRelaxed = edge.state === 'relaxed';

            let strokeColor = '#C4B59D';
            let strokeWidth = 2.6;
            let strokeDasharray = undefined;

            if (isMst) {
              strokeColor = '#2B4C38';
              strokeWidth = 4.5;
            } else if (isTreeEdge || isRelaxed) {
              strokeColor = '#8C2D19';
              strokeWidth = 3.8;
            } else if (isRejected) {
              strokeColor = '#D4887B';
              strokeWidth = 2.2;
              strokeDasharray = '5 4';
            } else if (isCrossBack) {
              strokeColor = '#8C6D3B';
              strokeWidth = 2.4;
              strokeDasharray = '4 3';
            }

            const isEdgeActive = activeEdgeIds.includes(edge.id);
            if (isEdgeActive) {
              strokeColor = '#8C2D19';
              strokeWidth = Math.max(strokeWidth, 4);
            }

            const midX = (uX + vX) / 2;
            const midY = (uY + vY) / 2;

            return (
              <g key={edge.id} className="edge-group pointer-events-none">
                <line
                  x1={uX}
                  y1={uY}
                  x2={vX}
                  y2={vY}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  markerEnd={edge.directed ? (isEdgeActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)') : undefined}
                />

                {/* Edge Weight Pill (if weighted) */}
                {edge.weight !== undefined && (
                  <g>
                    <rect
                      x={midX - 16}
                      y={midY - 12}
                      width="32"
                      height="20"
                      rx="5"
                      fill={isMst ? '#EDF5F0' : isEdgeActive ? '#FAF0EE' : '#FAF8F5'}
                      stroke={isMst ? '#2B4C38' : isEdgeActive ? '#8C2D19' : '#C4B59D'}
                      strokeWidth="1.2"
                    />
                    <text
                      x={midX}
                      y={midY + 2.5}
                      fill={isMst ? '#2B4C38' : isEdgeActive ? '#8C2D19' : '#221F1E'}
                      fontSize="12.5"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {edge.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Graph Vertices (Draggable) */}
        <g className="vertices">
          {vertices.map((vertex) => {
            const rawX = localPositions[vertex.id]?.x ?? vertex.x;
            const rawY = localPositions[vertex.id]?.y ?? vertex.y;

            const vX = scaleX(rawX);
            const vY = scaleY(rawY);

            const isHighlighted = activeNodeIds.includes(vertex.id);
            const isVisited = vertex.state === 'visited' || vertex.state === 'completed';
            const isVisiting = vertex.state === 'visiting' || vertex.state === 'current';
            const isBeingDragged = draggingVertexId === vertex.id;

            let fillColor = '#F4EFE6';
            let strokeColor = '#A8977E';
            let textColor = '#221F1E';

            if (isVisiting || isHighlighted) {
              fillColor = '#FAF0EE';
              strokeColor = '#8C2D19';
              textColor = '#8C2D19';
            } else if (isVisited) {
              fillColor = '#EDE5D8';
              strokeColor = '#7A6E5F';
              textColor = '#3D3833';
            }

            const radius = 24;

            return (
              <g
                key={vertex.id}
                filter="url(#graph-node-shadow)"
                className="cursor-grab active:cursor-grabbing transition-transform duration-75"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleStartDrag(vertex.id, e.clientX, e.clientY);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (e.touches.length > 0) {
                    handleStartDrag(vertex.id, e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
              >
                {/* Dragging Aura / Active Highlight Ring */}
                {(isHighlighted || isBeingDragged) && (
                  <circle
                    cx={vX}
                    cy={vY}
                    r={radius + 7}
                    fill="none"
                    stroke="#8C2D19"
                    strokeWidth="2.8"
                    strokeDasharray={isBeingDragged ? '2 2' : '4 2'}
                    className={isBeingDragged ? 'animate-spin' : ''}
                  />
                )}

                {/* Vertex Circle */}
                <circle
                  cx={vX}
                  cy={vY}
                  r={radius}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted || isVisiting || isBeingDragged ? '3' : '2'}
                />

                {/* Label */}
                <text
                  x={vX}
                  y={vY + 6.5}
                  fill={textColor}
                  fontSize="17"
                  fontWeight="700"
                  fontFamily="Playfair Display, serif"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {vertex.label}
                </text>

                {/* Distance / In-Degree Annotation Badge */}
                {(vertex.distance !== undefined || vertex.inDegree !== undefined || vertex.discoveryTime !== undefined) && (
                  <g className="pointer-events-none">
                    <rect
                      x={vX - 22}
                      y={vY - radius - 17}
                      width="44"
                      height="16"
                      rx="4"
                      fill="#FAF8F5"
                      stroke={strokeColor}
                      strokeWidth="1.2"
                    />
                    <text
                      x={vX}
                      y={vY - radius - 5}
                      fill="#59524A"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {vertex.distance !== undefined
                        ? vertex.distance === Infinity
                          ? '∞'
                          : `d:${vertex.distance}`
                        : vertex.inDegree !== undefined
                        ? `in:${vertex.inDegree}`
                        : `${vertex.discoveryTime}/${vertex.finishTime || '?'}`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
