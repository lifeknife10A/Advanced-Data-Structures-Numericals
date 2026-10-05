import { TreeNode } from './tree';
import { GraphVertex, GraphEdge } from './graph';

export interface TraceTableRow {
  id: string;
  cells: (string | number)[];
  isHighlighted?: boolean;
}

export interface AuxiliaryState {
  type: 'queue' | 'stack' | 'mst' | 'topo_list' | 'dsu' | 'priority_queue' | 'rebalance';
  label: string;
  items: string[];
  visitedItems?: string[];
  actionType?: 'push' | 'pop' | 'enqueue' | 'dequeue' | 'visit' | 'none';
  activeItem?: string;
  enqueuedItems?: string[];
  extraInfo?: string;
}

export interface StepSnapshot {
  stepIndex: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  category: 'TREE' | 'GRAPH';
  algorithmName: string;
  
  // Faculty Exam Derivation & Rubrics
  facultyExplanation: string;
  mathematicalDerivation?: string;
  examRule?: string;
  statusBadge: {
    text: string;
    variant: 'normal' | 'warning' | 'success' | 'danger' | 'accent';
  };

  // State payloads
  treeState?: TreeNode | null;
  graphState?: {
    vertices: GraphVertex[];
    edges: GraphEdge[];
  };

  // Active highlights
  activeNodeIds?: string[];
  activeEdgeIds?: string[];

  // Trace Table Structure
  traceTableHeaders: string[];
  traceTableRows: TraceTableRow[];
  activeTableRowIndex?: number;

  // Rotation Metadata for intermediate rotation breakdowns
  rotationMeta?: {
    type: 'LL' | 'RR' | 'LR' | 'RL' | 'ZIG' | 'ZIG_ZIG' | 'ZIG_ZAG' | 'SPLIT_PROMOTE' | 'CASE_1' | 'CASE_2' | 'CASE_3' | 'RECOLOR';
    pivotKey: number;
    elevatingKey?: number;
    direction?: 'clockwise' | 'counter-clockwise';
    subPhase?: string;
    stepNumberLabel?: string;
    transferredSubtree?: string;
    description: string;
  };
  
  stepNumberLabel?: string;

  // Auxiliary Structures (Queue, Stack, MST set, Topological List, DSU)
  auxiliaryState?: AuxiliaryState;
}
