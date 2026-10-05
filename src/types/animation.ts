import { TreeNode } from './tree';
import { GraphVertex, GraphEdge } from './graph';

export interface TraceTableRow {
  id: string;
  cells: (string | number)[];
  isHighlighted?: boolean;
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

  // Auxiliary Structures (Queue, Stack, MST set, Topological List, DSU)
  auxiliaryState?: {
    type: 'queue' | 'stack' | 'mst' | 'topo_list' | 'dsu' | 'priority_queue' | 'rebalance';
    label: string;
    items: string[];
    extraInfo?: string;
  };
}
