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
      <div className="w-full h-[340px] sm:h-[460px] md:h-[580px] flex items-center justify-center bg-[#FAF8F5] border border-[#E2D8C7] rounded-2xl text-[#847B72] font-serif p-4 sm:p-8 shadow-inner text-center">
        <p className="text-base sm:text-xl italic font-serif">No graph data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[340px] sm:h-[460px] md:h-[580px] bg-[#FAF8F5] border border-[#E2D8C7] rounded-2xl overflow-hidden relative shadow-inner">
      <svg
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
              <g key={edge.id} className="edge-group">
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

        {/* Graph Vertices */}
        <g className="vertices">
          {vertices.map((vertex) => {
            const scaleX = (x: number) => (x / 600) * 800 + 50;
            const scaleY = (y: number) => (y / 360) * 460 + 60;

            const vX = scaleX(vertex.x);
            const vY = scaleY(vertex.y);

            const isHighlighted = activeNodeIds.includes(vertex.id);
            const isVisited = vertex.state === 'visited' || vertex.state === 'completed';
            const isVisiting = vertex.state === 'visiting' || vertex.state === 'current';

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
              <g key={vertex.id} filter="url(#graph-node-shadow)">
                {/* Active Highlight Ring */}
                {isHighlighted && (
                  <circle
                    cx={vX}
                    cy={vY}
                    r={radius + 7}
                    fill="none"
                    stroke="#8C2D19"
                    strokeWidth="2.8"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Vertex Circle */}
                <circle
                  cx={vX}
                  cy={vY}
                  r={radius}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted || isVisiting ? '3' : '2'}
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
                >
                  {vertex.label}
                </text>

                {/* Distance / In-Degree Annotation Badge */}
                {(vertex.distance !== undefined || vertex.inDegree !== undefined || vertex.discoveryTime !== undefined) && (
                  <g>
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
