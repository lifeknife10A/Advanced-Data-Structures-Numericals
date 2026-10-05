export type TreeType = 'avl' | '2-3' | 'splay' | 'red-black';

export type NodeColor = 'RED' | 'BLACK';

export type RotationType = 
  | 'NONE'
  | 'LL' 
  | 'RR' 
  | 'LR' 
  | 'RL' 
  | 'ZIG' 
  | 'ZIG_ZIG' 
  | 'ZIG_ZAG' 
  | 'SPLIT_PROMOTE' 
  | 'RECOLOR';

export interface TreeNode {
  id: string;
  key: number;
  keys?: number[]; // For 2-3 Tree nodes (can hold 1 or 2 keys, or temporary 3)
  height: number;
  balanceFactor: number;
  color?: NodeColor;
  left?: TreeNode | null;
  right?: TreeNode | null;
  middle?: TreeNode | null; // For 2-3 Tree
  parent?: TreeNode | null;
  
  // Layout coordinates for SVG rendering
  x?: number;
  y?: number;
  
  // State flags for animations
  isHighlighted?: boolean;
  highlightVariant?: 'target' | 'unbalanced' | 'pivot' | 'parent' | 'uncle' | 'grandparent' | 'visited' | 'new';
  badgeText?: string;
}

export interface TreePreset {
  id: string;
  name: string;
  description: string;
  treeType: TreeType;
  operation: 'insert' | 'delete' | 'search';
  keys: number[];
  targetKey?: number;
}
