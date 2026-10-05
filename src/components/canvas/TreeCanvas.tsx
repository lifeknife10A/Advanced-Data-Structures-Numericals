import React, { useMemo } from 'react';
import { TreeNode } from '../../types/tree';
import { layoutTree } from '../../utils/treeLayout';

interface TreeCanvasProps {
  tree: TreeNode | null | undefined;
  activeNodeIds?: string[];
  isTwoThree?: boolean;
  algorithmName?: string;
}

export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  tree,
  activeNodeIds = [],
  isTwoThree = false,
  algorithmName = '',
}) => {
  const canvasWidth = 1000;
  const canvasHeight = 580;

  // Compute positioned tree
  const positionedTree = useMemo(() => {
    if (!tree) return null;
    return layoutTree(tree, canvasWidth, canvasHeight, isTwoThree);
  }, [tree, isTwoThree]);

  // Flatten nodes and edges for SVG rendering
  const { nodes, edges } = useMemo(() => {
    const nodeList: TreeNode[] = [];
    const edgeList: { id: string; x1: number; y1: number; x2: number; y2: number; label?: string }[] = [];

    if (!positionedTree) return { nodes: nodeList, edges: edgeList };

    function traverse(node: TreeNode) {
      nodeList.push(node);

      // Left Child
      if (node.left && node.left.x !== undefined && node.left.y !== undefined) {
        edgeList.push({
          id: `edge-${node.id}-${node.left.id}`,
          x1: node.x!,
          y1: node.y!,
          x2: node.left.x,
          y2: node.left.y,
          label: isTwoThree ? 'L' : undefined,
        });
        traverse(node.left);
      }

      // Middle Child (2-3 tree)
      if (node.middle && node.middle.x !== undefined && node.middle.y !== undefined) {
        edgeList.push({
          id: `edge-${node.id}-${node.middle.id}`,
          x1: node.x!,
          y1: node.y!,
          x2: node.middle.x,
          y2: node.middle.y,
          label: 'M',
        });
        traverse(node.middle);
      }

      // Right Child
      if (node.right && node.right.x !== undefined && node.right.y !== undefined) {
        edgeList.push({
          id: `edge-${node.id}-${node.right.id}`,
          x1: node.x!,
          y1: node.y!,
          x2: node.right.x,
          y2: node.right.y,
          label: isTwoThree ? 'R' : undefined,
        });
        traverse(node.right);
      }
    }

    traverse(positionedTree);
    return { nodes: nodeList, edges: edgeList };
  }, [positionedTree, isTwoThree]);

  if (!tree) {
    return (
      <div className="w-full h-[580px] flex flex-col items-center justify-center bg-[#FAF8F5] border border-[#E2D8C7] rounded-2xl text-[#847B72] font-serif p-8 shadow-inner">
        <p className="text-xl italic font-serif text-[#59524A]">Tree is currently empty.</p>
        <p className="text-sm text-[#A89F91] mt-1.5 font-serif">Use the playback controls below or press Step Next to begin numerical construction.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[580px] bg-[#FAF8F5] border border-[#E2D8C7] rounded-2xl overflow-hidden relative shadow-inner">
      <svg
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full h-full select-none"
      >
        <defs>
          {/* Drop shadow filter for nodes */}
          <filter id="champagne-node-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#221F1E" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Tree Edges */}
        <g className="edges">
          {edges.map((edge) => (
            <g key={edge.id}>
              <line
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke="#C4B59D"
                strokeWidth="3"
                strokeLinecap="round"
                className="edge-path"
              />
              {edge.label && (
                <text
                  x={(edge.x1 + edge.x2) / 2}
                  y={(edge.y1 + edge.y2) / 2 - 6}
                  fill="#59524A"
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              )}
            </g>
          ))}
        </g>

        {/* Tree Nodes */}
        <g className="nodes">
          {nodes.map((node) => {
            const isHighlighted =
              node.isHighlighted || (node.id && activeNodeIds.includes(node.id));

            // 2-3 Tree Node Rendering (Multi-key Box)
            if (isTwoThree || (node.keys && node.keys.length > 0)) {
              const keys = node.keys || [node.key];
              const boxWidth = Math.max(keys.length * 46 + 24, 70);
              const boxHeight = 42;
              const x = (node.x ?? 0) - boxWidth / 2;
              const y = (node.y ?? 0) - boxHeight / 2;

              return (
                <g key={node.id} className="node-transition" filter="url(#champagne-node-shadow)">
                  {/* Outer Container */}
                  <rect
                    x={x}
                    y={y}
                    width={boxWidth}
                    height={boxHeight}
                    rx="8"
                    fill={keys.length > 2 ? '#FDF2F0' : '#F4EFE6'}
                    stroke={
                      keys.length > 2
                        ? '#8C2D19'
                        : isHighlighted
                        ? '#8C2D19'
                        : '#A8977E'
                    }
                    strokeWidth={isHighlighted || keys.length > 2 ? '3' : '2'}
                  />

                  {/* Inner compartment divider lines and keys */}
                  {keys.map((k, idx) => {
                    const cellWidth = boxWidth / keys.length;
                    const cellCenterX = x + (idx + 0.5) * cellWidth;
                    return (
                      <g key={`${node.id}-k-${idx}`}>
                        {idx > 0 && (
                          <line
                            x1={x + idx * cellWidth}
                            y1={y}
                            x2={x + idx * cellWidth}
                            y2={y + boxHeight}
                            stroke="#D4C6B1"
                            strokeWidth="2"
                          />
                        )}
                        <text
                          x={cellCenterX}
                          y={y + 27}
                          fill="#221F1E"
                          fontSize="17.5"
                          fontWeight="700"
                          fontFamily="Playfair Display, serif"
                          textAnchor="middle"
                        >
                          {k}
                        </text>
                      </g>
                    );
                  })}

                  {/* Node Type Badge */}
                  <text
                    x={node.x}
                    y={y - 8}
                    fill="#59524A"
                    fontSize="11.5"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                  >
                    {keys.length === 1 ? '2-Node' : keys.length === 2 ? '3-Node' : '4-Node (Split!)'}
                  </text>
                </g>
              );
            }

            // Red-Black Node Rendering
            if (algorithmName.includes('Red-Black') || node.color) {
              const isRed = node.color === 'RED';
              const radius = 25;

              return (
                <g key={node.id} className="node-transition" filter="url(#champagne-node-shadow)">
                  {/* Outer ring on active */}
                  {isHighlighted && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius + 7}
                      fill="none"
                      stroke="#8C2D19"
                      strokeWidth="2.8"
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={isRed ? '#8C2D19' : '#1F1C1B'}
                    stroke={isRed ? '#722312' : '#3D3835'}
                    strokeWidth="2.4"
                  />

                  {/* Node Key Text */}
                  <text
                    x={node.x}
                    y={(node.y ?? 0) + 6.5}
                    fill="#FAF8F5"
                    fontSize="17.5"
                    fontWeight="700"
                    fontFamily="Playfair Display, serif"
                    textAnchor="middle"
                  >
                    {node.key}
                  </text>

                  {/* Color Tag Badge */}
                  <rect
                    x={(node.x ?? 0) - 16}
                    y={(node.y ?? 0) - radius - 17}
                    width="32"
                    height="15"
                    rx="4"
                    fill={isRed ? '#FAF0EE' : '#F4EFE6'}
                    stroke={isRed ? '#8C2D19' : '#C4B59D'}
                    strokeWidth="1.2"
                  />
                  <text
                    x={node.x}
                    y={(node.y ?? 0) - radius - 5.5}
                    fill={isRed ? '#8C2D19' : '#221F1E'}
                    fontSize="10.5"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                  >
                    {isRed ? 'RED' : 'BLK'}
                  </text>
                </g>
              );
            }

            // Standard AVL & Splay Node Rendering
            const radius = 25;
            const isUnbalanced = Math.abs(node.balanceFactor) > 1;

            return (
              <g key={node.id} className="node-transition" filter="url(#champagne-node-shadow)">
                {/* Active Highlight Aura */}
                {isHighlighted && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 7}
                    fill="none"
                    stroke="#8C2D19"
                    strokeWidth="2.8"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={isUnbalanced ? '#FDF2F0' : '#F4EFE6'}
                  stroke={
                    isUnbalanced
                      ? '#8C2D19'
                      : isHighlighted
                      ? '#8C2D19'
                      : '#A8977E'
                  }
                  strokeWidth={isHighlighted || isUnbalanced ? '3' : '2'}
                />

                {/* Key Label */}
                <text
                  x={node.x}
                  y={(node.y ?? 0) + 6.5}
                  fill="#221F1E"
                  fontSize="17.5"
                  fontWeight="700"
                  fontFamily="Playfair Display, serif"
                  textAnchor="middle"
                >
                  {node.key}
                </text>

                {/* Balance Factor Pill (for AVL) */}
                {algorithmName.includes('AVL') && (
                  <g>
                    <rect
                      x={(node.x ?? 0) - 24}
                      y={(node.y ?? 0) - radius - 18}
                      width="48"
                      height="16"
                      rx="4"
                      fill={isUnbalanced ? '#8C2D19' : '#EDE5D8'}
                      stroke={isUnbalanced ? '#8C2D19' : '#C4B59D'}
                      strokeWidth="1.2"
                    />
                    <text
                      x={node.x}
                      y={(node.y ?? 0) - radius - 5.5}
                      fill={isUnbalanced ? '#FAF8F5' : '#59524A'}
                      fontSize="10.5"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      BF: {node.balanceFactor > 0 ? `+${node.balanceFactor}` : node.balanceFactor}
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
