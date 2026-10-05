import React from 'react';
import { GraphVertex, GraphEdge } from '../../types/graph';

interface GraphCanvasProps {
  vertices?: GraphVertex[];
  edges?: GraphEdge[];
  activeNodeIds?: string[];
  activeEdgeIds?: string[];
  algorithmName?: string;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  vertices = [],
  edges = [],
  activeNodeIds = [],
  activeEdgeIds = [],
  algorithmName = '',
}) => {
  const canvasWidth = 900;
  const canvasHeight = 580;

  if (vertices.length === 0) {
    return (
      <div className="w-full h-[580px] flex items-center justify-center bg-[#FAF8F5] border border-[#E2D8C7] rounded-2xl text-[#847B72] font-serif p-8 shadow-inner">
        <p className="text-xl italic font-serif">No graph data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[580px] bg-[#FAF8F5] border border-[#E2D8C7] rounded-2xl overflow-hidden relative shadow-inner">
      <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-full select-none">
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

            // Scale coordinates proportionally to 900x580 canvas
            const scaleX = (x: number) => (x / 600) * 800 + 50;
            const scaleY = (y: number) => (y / 360) * 460 + 60;

            const uX = scaleX(u.x);
            const uY = scaleY(u.y);
            const vX = scaleX(v.x);
            const vY = scaleY(v.y);

            const isMst = edge.state === 'mst_edge';
            const isTreeEdge = edge.state === 'tree_edge';
            const isRejected = edge.state === 'rejected_cycle';
            const isCrossBack = edge.state === 'back_edge' || edge.state === 'cross_edge';
            const isRelaxed = edge.state === 'relaxed';

            let strokeColor = '#C4B59D';
            let strokeWidth = 2.6;
            let strokeDasharray = undefined;

            if (isMst) {
              strokeColor = '#2B4C38'; // Deep forest for MST
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
              strokeWidth = 2.6;
              strokeDasharray = '4 3';
            }

            const midX = (uX + vX) / 2;
            const midY = (uY + vY) / 2;

            return (
              <g key={edge.id}>
                <line
                  x1={uX}
                  y1={uY}
                  x2={vX}
                  y2={vY}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  markerEnd={edge.directed ? (isTreeEdge ? 'url(#arrowhead-active)' : 'url(#arrowhead)') : undefined}
                  className="edge-path"
                />

                {/* Edge Weight Pill Badge */}
                {edge.weight !== undefined && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-14"
                      y="-11"
                      width="28"
                      height="22"
                      rx="6"
                      fill="#FAF8F5"
                      stroke={strokeColor}
                      strokeWidth="1.6"
                    />
                    <text
                      x="0"
                      y="5"
                      fill="#221F1E"
                      fontSize="13"
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

        {/* Graph Vertices */}
        <g className="vertices">
          {vertices.map((vertex) => {
            const scaleX = (x: number) => (x / 600) * 800 + 50;
            const scaleY = (y: number) => (y / 360) * 460 + 60;

            const posX = scaleX(vertex.x);
            const posY = scaleY(vertex.y);

            const isActive =
              vertex.state === 'visiting' ||
              vertex.state === 'current' ||
              activeNodeIds.includes(vertex.id);
            const isCompleted = vertex.state === 'completed';

            const radius = 27;

            return (
              <g
                key={vertex.id}
                className="node-transition"
                filter="url(#graph-node-shadow)"
              >
                {/* Active Outer Ring */}
                {isActive && (
                  <circle
                    cx={posX}
                    cy={posY}
                    r={radius + 8}
                    fill="none"
                    stroke="#8C2D19"
                    strokeWidth="2.8"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Vertex Circle */}
                <circle
                  cx={posX}
                  cy={posY}
                  r={radius}
                  fill={isCompleted ? '#EFE9DE' : isActive ? '#FAF0EE' : '#F4EFE6'}
                  stroke={isActive ? '#8C2D19' : isCompleted ? '#8C6D3B' : '#A8977E'}
                  strokeWidth={isActive ? '3' : '2.2'}
                />

                {/* Vertex Label */}
                <text
                  x={posX}
                  y={posY + 6.5}
                  fill="#221F1E"
                  fontSize="18.5"
                  fontWeight="700"
                  fontFamily="Playfair Display, serif"
                  textAnchor="middle"
                >
                  {vertex.label || vertex.id}
                </text>

                {/* Algorithm-Specific Metrics Pill */}
                {/* 1. Dijkstra: Distance */}
                {algorithmName.includes('Dijkstra') && vertex.distance !== undefined && (
                  <g>
                    <rect
                      x={posX - 26}
                      y={posY - radius - 18}
                      width="52"
                      height="16"
                      rx="4"
                      fill="#FAF8F5"
                      stroke="#C4B59D"
                      strokeWidth="1.2"
                    />
                    <text
                      x={posX}
                      y={posY - radius - 5.5}
                      fill="#8C2D19"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      d: {vertex.distance === Infinity ? '∞' : vertex.distance}
                    </text>
                  </g>
                )}

                {/* 2. DFS: Discovery and Finish Times */}
                {algorithmName.includes('DFS') &&
                  (vertex.discoveryTime !== undefined || vertex.finishTime !== undefined) && (
                    <g>
                      <rect
                        x={posX - 30}
                        y={posY - radius - 18}
                        width="60"
                        height="16"
                        rx="4"
                        fill="#FAF8F5"
                        stroke="#C4B59D"
                        strokeWidth="1.2"
                      />
                      <text
                        x={posX}
                        y={posY - radius - 5.5}
                        fill="#59524A"
                        fontSize="10.5"
                        fontWeight="bold"
                        fontFamily="JetBrains Mono, monospace"
                        textAnchor="middle"
                      >
                        {vertex.discoveryTime ?? '—'}/{vertex.finishTime ?? '—'}
                      </text>
                    </g>
                  )}

                {/* 3. Topological: In-degree */}
                {algorithmName.includes('Topological') && vertex.inDegree !== undefined && (
                  <g>
                    <rect
                      x={posX - 28}
                      y={posY - radius - 18}
                      width="56"
                      height="16"
                      rx="4"
                      fill="#FAF8F5"
                      stroke="#C4B59D"
                      strokeWidth="1.2"
                    />
                    <text
                      x={posX}
                      y={posY - radius - 5.5}
                      fill="#59524A"
                      fontSize="10.5"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      deg⁻: {vertex.inDegree}
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
