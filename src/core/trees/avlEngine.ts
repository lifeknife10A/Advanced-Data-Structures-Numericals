import { TreeNode } from '../../types/tree';
import { StepSnapshot, TraceTableRow } from '../../types/animation';

let nextNodeId = 1;

function createNode(key: number): TreeNode {
  return {
    id: `node-${key}-${nextNodeId++}`,
    key,
    height: 1,
    balanceFactor: 0,
    left: null,
    right: null,
  };
}

function getHeight(node: TreeNode | null | undefined): number {
  return node ? node.height : 0;
}

function updateNodeMetrics(node: TreeNode): void {
  const leftH = getHeight(node.left);
  const rightH = getHeight(node.right);
  node.height = 1 + Math.max(leftH, rightH);
  node.balanceFactor = leftH - rightH;
}

function cloneTree(node: TreeNode | null | undefined): TreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    key: node.key,
    height: node.height,
    balanceFactor: node.balanceFactor,
    isHighlighted: node.isHighlighted,
    highlightVariant: node.highlightVariant,
    badgeText: node.badgeText,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

function collectTableRows(root: TreeNode | null | undefined): TraceTableRow[] {
  const rows: TraceTableRow[] = [];
  function traverse(n: TreeNode | null | undefined) {
    if (!n) return;
    traverse(n.left);
    const leftH = getHeight(n.left);
    const rightH = getHeight(n.right);
    rows.push({
      id: `row-${n.key}`,
      cells: [
        n.key,
        leftH,
        rightH,
        n.height,
        n.balanceFactor > 0 ? `+${n.balanceFactor}` : `${n.balanceFactor}`,
        Math.abs(n.balanceFactor) > 1 ? 'UNBALANCED' : 'BALANCED',
      ],
      isHighlighted: Math.abs(n.balanceFactor) > 1,
    });
    traverse(n.right);
  }
  traverse(root);
  return rows;
}

// --------------------------------------------------------------------------
// Multi-Step Educational Rotation Handlers (LL, RR, LR, RL)
// --------------------------------------------------------------------------

function executeAndRecordLL(
  A: TreeNode,
  steps: StepSnapshot[],
  stepPrefix: string,
  isDeletion: boolean = false
): TreeNode {
  const B = A.left!;
  const T2 = B.right;
  const alg = isDeletion ? 'AVL Tree Deletion' : 'AVL Tree Insertion';

  // Sub-step 1: Detection & Imbalance Analysis
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.1: LL Imbalance Detected at Node ${A.key}`,
    subtitle: `BF(${A.key}) = +2, BF(${B.key}) = ${B.balanceFactor >= 0 ? '+' : ''}${B.balanceFactor} (Left-Left Violation)`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `Node ${A.key} has Balance Factor +2 (left-heavy), and its left child ${B.key} has BF ≥ 0. This is a Left-Left (LL) violation. A Single Right Rotation on Node ${A.key} with Pivot ${B.key} is required.`,
    mathematicalDerivation: `\\text{BF}(${A.key}) = h_L - h_R = ${getHeight(A.left)} - ${getHeight(A.right)} = +2 \\implies \\text{LL Case: RightRotate}(${A.key})`,
    examRule: 'LL Case Rule: Perform a Single Right Rotation on the imbalanced parent. Left child rises to root.',
    statusBadge: { text: 'LL Case: Detected', variant: 'danger' },
    rotationMeta: {
      type: 'LL',
      pivotKey: A.key,
      elevatingKey: B.key,
      direction: 'clockwise',
      subPhase: 'DETECTION',
      stepNumberLabel: `${stepPrefix}.1`,
      description: `Imbalance at Node ${A.key} (BF = +2). Pivot child is ${B.key}.`,
    },
    treeState: cloneTree(A),
    activeNodeIds: [A.id, B.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(A),
  });

  // Sub-step 2: Subtree Reparenting & Pointer Shift Explanation
  A.left = T2;
  B.right = A;
  updateNodeMetrics(A);
  updateNodeMetrics(B);

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.2: Right Rotation Execution & Subtree Reparenting`,
    subtitle: `Elevating Pivot ${B.key} → Root, Demoting ${A.key} → Right Child of ${B.key}`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `Detailed Right Rotation Mechanics:
1. Elevate Pivot ${B.key}: Node ${B.key} rises to replace Node ${A.key} as the subtree root.
2. Demote Node ${A.key}: Node ${A.key} moves down to become the RIGHT child of ${B.key} (since ${A.key} > ${B.key}).
3. Reparent Subtree T2: Node ${B.key}'s right subtree T2 (containing keys between ${B.key} and ${A.key}) is re-attached as the LEFT child of Node ${A.key}.
4. BST Order Preserved: Subtree(B.left) < ${B.key} < T2 < ${A.key} < Subtree(A.right).`,
    mathematicalDerivation: `${B.key}.\\text{right} \\leftarrow ${A.key}, \\quad ${A.key}.\\text{left} \\leftarrow T_2 \\implies \\text{BST Invariant Strictly Maintained}`,
    examRule: 'Exam Rubric: Explicitly show where subtree T2 transfers (from pivot right to demoted node left).',
    statusBadge: { text: 'Right Rotate: Executed', variant: 'warning' },
    rotationMeta: {
      type: 'LL',
      pivotKey: A.key,
      elevatingKey: B.key,
      direction: 'clockwise',
      subPhase: 'ROTATION_EXECUTION',
      stepNumberLabel: `${stepPrefix}.2`,
      transferredSubtree: `Subtree T2 reparented to left of ${A.key}`,
      description: `Elevated ${B.key}, demoted ${A.key} to right child, reparented T2 to left of ${A.key}`,
    },
    treeState: cloneTree(B),
    activeNodeIds: [B.id, A.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(B),
  });

  // Sub-step 3: Balance Restored
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.3: LL Rotation Complete & Invariant Restored`,
    subtitle: `New Subtree Root: ${B.key} (BF: ${B.balanceFactor}), Left: ${B.left ? B.left.key : '—'}, Right: ${A.key} (BF: ${A.balanceFactor})`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `Right rotation complete. Heights and balance factors recalculated:\n- h(${A.key}) = ${A.height}, BF(${A.key}) = ${A.balanceFactor}\n- h(${B.key}) = ${B.height}, BF(${B.key}) = ${B.balanceFactor}\nBoth nodes now satisfy |BF| ≤ 1.`,
    mathematicalDerivation: `\\text{BF}(${A.key}) = ${A.balanceFactor}, \\; \\text{BF}(${B.key}) = ${B.balanceFactor} \\implies \\text{AVL Invariant Satisfied.}`,
    examRule: 'Final Step: Mark new heights and BF values next to each node on the answer sheet.',
    statusBadge: { text: 'LL Balanced', variant: 'success' },
    rotationMeta: {
      type: 'LL',
      pivotKey: A.key,
      elevatingKey: B.key,
      direction: 'clockwise',
      subPhase: 'RECOLORED_BALANCED',
      stepNumberLabel: `${stepPrefix}.3`,
      description: `Balanced tree at root ${B.key}`,
    },
    treeState: cloneTree(B),
    activeNodeIds: [B.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(B),
  });

  return B;
}

function executeAndRecordRR(
  A: TreeNode,
  steps: StepSnapshot[],
  stepPrefix: string,
  isDeletion: boolean = false
): TreeNode {
  const B = A.right!;
  const T2 = B.left;
  const alg = isDeletion ? 'AVL Tree Deletion' : 'AVL Tree Insertion';

  // Sub-step 1: Detection
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.1: RR Imbalance Detected at Node ${A.key}`,
    subtitle: `BF(${A.key}) = -2, BF(${B.key}) = ${B.balanceFactor >= 0 ? '+' : ''}${B.balanceFactor} (Right-Right Violation)`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `Node ${A.key} has Balance Factor -2 (right-heavy), and its right child ${B.key} has BF ≤ 0. This is a Right-Right (RR) violation. A Single Left Rotation on Node ${A.key} with Pivot ${B.key} is required.`,
    mathematicalDerivation: `\\text{BF}(${A.key}) = h_L - h_R = ${getHeight(A.left)} - ${getHeight(A.right)} = -2 \\implies \\text{RR Case: LeftRotate}(${A.key})`,
    examRule: 'RR Case Rule: Perform a Single Left Rotation on imbalanced parent. Right child rises to root.',
    statusBadge: { text: 'RR Case: Detected', variant: 'danger' },
    rotationMeta: {
      type: 'RR',
      pivotKey: A.key,
      elevatingKey: B.key,
      direction: 'counter-clockwise',
      subPhase: 'DETECTION',
      stepNumberLabel: `${stepPrefix}.1`,
      description: `Imbalance at Node ${A.key} (BF = -2). Pivot child is ${B.key}.`,
    },
    treeState: cloneTree(A),
    activeNodeIds: [A.id, B.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(A),
  });

  // Sub-step 2: Reparenting & Left Rotation Execution
  A.right = T2;
  B.left = A;
  updateNodeMetrics(A);
  updateNodeMetrics(B);

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.2: Left Rotation Execution & Subtree Reparenting`,
    subtitle: `Elevating Pivot ${B.key} → Root, Demoting ${A.key} → Left Child of ${B.key}`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `Detailed Left Rotation Mechanics:
1. Elevate Pivot ${B.key}: Node ${B.key} rises to replace Node ${A.key} as the subtree root.
2. Demote Node ${A.key}: Node ${A.key} moves down to become the LEFT child of ${B.key} (since ${A.key} < ${B.key}).
3. Reparent Subtree T2: Node ${B.key}'s left subtree T2 (containing keys between ${A.key} and ${B.key}) is re-attached as the RIGHT child of Node ${A.key}.
4. BST Order Preserved: Subtree(A.left) < ${A.key} < T2 < ${B.key} < Subtree(B.right).`,
    mathematicalDerivation: `${B.key}.\\text{left} \\leftarrow ${A.key}, \\quad ${A.key}.\\text{right} \\leftarrow T_2 \\implies \\text{BST Order Preserved}`,
    examRule: 'Exam Rubric: Subtree T2 transfers from pivot left to old-root right.',
    statusBadge: { text: 'Left Rotate: Executed', variant: 'warning' },
    rotationMeta: {
      type: 'RR',
      pivotKey: A.key,
      elevatingKey: B.key,
      direction: 'counter-clockwise',
      subPhase: 'ROTATION_EXECUTION',
      stepNumberLabel: `${stepPrefix}.2`,
      transferredSubtree: `Subtree T2 reparented to right of ${A.key}`,
      description: `Elevated ${B.key}, demoted ${A.key} to left child, reparented T2 to right of ${A.key}`,
    },
    treeState: cloneTree(B),
    activeNodeIds: [B.id, A.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(B),
  });

  // Sub-step 3: Balance Restored
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.3: RR Rotation Complete & Invariant Restored`,
    subtitle: `New Subtree Root: ${B.key} (BF: ${B.balanceFactor}), Left: ${A.key} (BF: ${A.balanceFactor}), Right: ${B.right ? B.right.key : '—'}`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `Left rotation complete. Heights and balance factors recalculated:\n- h(${A.key}) = ${A.height}, BF(${A.key}) = ${A.balanceFactor}\n- h(${B.key}) = ${B.height}, BF(${B.key}) = ${B.balanceFactor}\nAll nodes now satisfy |BF| ≤ 1.`,
    mathematicalDerivation: `\\text{BF}(${A.key}) = ${A.balanceFactor}, \\; \\text{BF}(${B.key}) = ${B.balanceFactor} \\implies \\text{AVL Invariant Satisfied.}`,
    examRule: 'Final Step: Mark new heights and BF values next to each node.',
    statusBadge: { text: 'RR Balanced', variant: 'success' },
    rotationMeta: {
      type: 'RR',
      pivotKey: A.key,
      elevatingKey: B.key,
      direction: 'counter-clockwise',
      subPhase: 'RECOLORED_BALANCED',
      stepNumberLabel: `${stepPrefix}.3`,
      description: `Balanced tree at root ${B.key}`,
    },
    treeState: cloneTree(B),
    activeNodeIds: [B.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(B),
  });

  return B;
}

function executeAndRecordLR(
  A: TreeNode,
  steps: StepSnapshot[],
  stepPrefix: string,
  isDeletion: boolean = false
): TreeNode {
  const B = A.left!;
  const C = B.right!;
  const alg = isDeletion ? 'AVL Tree Deletion' : 'AVL Tree Insertion';

  // Sub-step 1: Detection
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.1: LR Imbalance Detected at Node ${A.key}`,
    subtitle: `BF(${A.key}) = +2, BF(${B.key}) = -1 (Left-Right Zigzag Violation)`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `Node ${A.key} has Balance Factor +2 (left-heavy), but its left child ${B.key} has BF = -1 (right-heavy). A single rotation cannot balance this zigzag. We must perform a Double Rotation (LR):\nPhase 1: Left Rotate on Child ${B.key}.\nPhase 2: Right Rotate on Parent ${A.key}.`,
    mathematicalDerivation: `\\text{BF}(${A.key}) = +2, \\; \\text{BF}(${B.key}) = -1 \\implies \\text{RotateLeft}(${B.key}) \\to \\text{RotateRight}(${A.key})`,
    examRule: 'LR Rule: Rotate child LEFT first to align into LL shape, then rotate parent RIGHT.',
    statusBadge: { text: 'LR Case: Detected', variant: 'warning' },
    rotationMeta: {
      type: 'LR',
      pivotKey: A.key,
      elevatingKey: C.key,
      direction: 'clockwise',
      subPhase: 'DETECTION',
      stepNumberLabel: `${stepPrefix}.1`,
      description: `LR Zigzag at ${A.key} -> ${B.key} -> ${C.key}`,
    },
    treeState: cloneTree(A),
    activeNodeIds: [A.id, B.id, C.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(A),
  });

  // Sub-step 2: Phase 1 — Left Rotate on Child B (LR $\to$ LL)
  const T2 = C.left;
  B.right = T2;
  C.left = B;
  updateNodeMetrics(B);
  updateNodeMetrics(C);
  A.left = C;
  updateNodeMetrics(A);

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.2: LR Phase 1 — Left Rotate on Child ${B.key}`,
    subtitle: `Transforms LR Zigzag into Straight LL (Left-Left) Configuration`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `Phase 1 of LR: Executed Left Rotation on child ${B.key}.
- Grandchild ${C.key} elevates to become the new left child of ${A.key}.
- Node ${B.key} becomes the left child of ${C.key}.
- Subtree T2 (left of ${C.key}) moves to right of ${B.key}.
The tree is now in a straight **LL configuration**: ${A.key} $\\to$ ${C.key} $\\to$ ${B.key}.`,
    mathematicalDerivation: `\\text{RotateLeft}(${B.key}) \\implies \\text{Tree transformed to LL Configuration under } ${A.key}`,
    examRule: 'Intermediate Checkpoint: Show the intermediate tree in LL form before performing the second rotation.',
    statusBadge: { text: 'LR Phase 1 (Now LL)', variant: 'warning' },
    rotationMeta: {
      type: 'LR',
      pivotKey: B.key,
      elevatingKey: C.key,
      direction: 'counter-clockwise',
      subPhase: 'SUBTREE_TRANSFER',
      stepNumberLabel: `${stepPrefix}.2`,
      description: `Left Rotate on ${B.key} transformed LR zigzag to LL shape`,
    },
    treeState: cloneTree(A),
    activeNodeIds: [A.id, C.id, B.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(A),
  });

  // Sub-step 3: Phase 2 — Right Rotate on Parent A
  const T3 = C.right;
  A.left = T3;
  C.right = A;
  updateNodeMetrics(A);
  updateNodeMetrics(C);

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.3: LR Phase 2 — Right Rotate on Parent ${A.key}`,
    subtitle: `Elevating ${C.key} → Root, Demoting ${A.key} → Right Child of ${C.key}`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `Phase 2 of LR: Executed Right Rotation on parent ${A.key}.
- Node ${C.key} elevates to become the new subtree root.
- Node ${A.key} becomes the right child of ${C.key}.
- Subtree T3 (right of ${C.key}) reparents to the left of ${A.key}.`,
    mathematicalDerivation: `${C.key}.\\text{right} \\leftarrow ${A.key}, \\quad ${A.key}.\\text{left} \\leftarrow T_3`,
    examRule: 'Double Rotation Invariant: The middle node (C) always emerges as the root of the balanced subtree.',
    statusBadge: { text: 'LR Phase 2: Executed', variant: 'warning' },
    rotationMeta: {
      type: 'LR',
      pivotKey: A.key,
      elevatingKey: C.key,
      direction: 'clockwise',
      subPhase: 'ROTATION_EXECUTION',
      stepNumberLabel: `${stepPrefix}.3`,
      description: `Right Rotate on ${A.key} elevates ${C.key} to root`,
    },
    treeState: cloneTree(C),
    activeNodeIds: [C.id, A.id, B.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(C),
  });

  // Sub-step 4: LR Balance Restored
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.4: LR Double Rotation Complete & Balanced`,
    subtitle: `Root: ${C.key} (BF: ${C.balanceFactor}), Left: ${B.key} (BF: ${B.balanceFactor}), Right: ${A.key} (BF: ${A.balanceFactor})`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `LR Double Rotation successfully rebalanced the tree. Heights and balance factors recalculated:\n- h(${B.key}) = ${B.height}, BF(${B.key}) = ${B.balanceFactor}\n- h(${A.key}) = ${A.height}, BF(${A.key}) = ${A.balanceFactor}\n- h(${C.key}) = ${C.height}, BF(${C.key}) = ${C.balanceFactor}`,
    mathematicalDerivation: `\\text{BF}(${C.key}) = 0, \\; |\\text{BF}(${B.key})| \\le 1, \\; |\\text{BF}(${A.key})| \\le 1 \\implies \\text{Balanced}`,
    examRule: 'Exam Check: Verify that all three nodes satisfy |BF| ≤ 1.',
    statusBadge: { text: 'LR Balanced', variant: 'success' },
    rotationMeta: {
      type: 'LR',
      pivotKey: A.key,
      elevatingKey: C.key,
      direction: 'clockwise',
      subPhase: 'RECOLORED_BALANCED',
      stepNumberLabel: `${stepPrefix}.4`,
      description: `Balanced tree at root ${C.key}`,
    },
    treeState: cloneTree(C),
    activeNodeIds: [C.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(C),
  });

  return C;
}

function executeAndRecordRL(
  A: TreeNode,
  steps: StepSnapshot[],
  stepPrefix: string,
  isDeletion: boolean = false
): TreeNode {
  const B = A.right!;
  const C = B.left!;
  const alg = isDeletion ? 'AVL Tree Deletion' : 'AVL Tree Insertion';

  // Sub-step 1: Detection
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.1: RL Imbalance Detected at Node ${A.key}`,
    subtitle: `BF(${A.key}) = -2, BF(${B.key}) = +1 (Right-Left Zigzag Violation)`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `Node ${A.key} has Balance Factor -2 (right-heavy), but its right child ${B.key} has BF = +1 (left-heavy). Perform Double Rotation (RL):\nPhase 1: Right Rotate on Child ${B.key}.\nPhase 2: Left Rotate on Parent ${A.key}.`,
    mathematicalDerivation: `\\text{BF}(${A.key}) = -2, \\; \\text{BF}(${B.key}) = +1 \\implies \\text{RotateRight}(${B.key}) \\to \\text{RotateLeft}(${A.key})`,
    examRule: 'RL Rule: Rotate child RIGHT first to align into RR shape, then rotate parent LEFT.',
    statusBadge: { text: 'RL Case: Detected', variant: 'warning' },
    rotationMeta: {
      type: 'RL',
      pivotKey: A.key,
      elevatingKey: C.key,
      direction: 'counter-clockwise',
      subPhase: 'DETECTION',
      stepNumberLabel: `${stepPrefix}.1`,
      description: `RL Zigzag at ${A.key} -> ${B.key} -> ${C.key}`,
    },
    treeState: cloneTree(A),
    activeNodeIds: [A.id, B.id, C.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(A),
  });

  // Sub-step 2: Phase 1 — Right Rotate on Child B (RL $\to$ RR)
  const T2 = C.right;
  B.left = T2;
  C.right = B;
  updateNodeMetrics(B);
  updateNodeMetrics(C);
  A.right = C;
  updateNodeMetrics(A);

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.2: RL Phase 1 — Right Rotate on Child ${B.key}`,
    subtitle: `Transforms RL Zigzag into Straight RR (Right-Right) Configuration`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `Phase 1 of RL: Executed Right Rotation on child ${B.key}.
- Grandchild ${C.key} elevates to become the new right child of ${A.key}.
- Node ${B.key} becomes the right child of ${C.key}.
- Subtree T2 (right of ${C.key}) moves to left of ${B.key}.
The tree is now in a straight **RR configuration**: ${A.key} $\\to$ ${C.key} $\\to$ ${B.key}.`,
    mathematicalDerivation: `\\text{RotateRight}(${B.key}) \\implies \\text{Tree transformed to RR Configuration under } ${A.key}`,
    examRule: 'Intermediate Checkpoint: Show the intermediate tree in RR form before performing the second rotation.',
    statusBadge: { text: 'RL Phase 1 (Now RR)', variant: 'warning' },
    rotationMeta: {
      type: 'RL',
      pivotKey: B.key,
      elevatingKey: C.key,
      direction: 'clockwise',
      subPhase: 'SUBTREE_TRANSFER',
      stepNumberLabel: `${stepPrefix}.2`,
      description: `Right Rotate on ${B.key} transformed RL zigzag to RR shape`,
    },
    treeState: cloneTree(A),
    activeNodeIds: [A.id, C.id, B.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(A),
  });

  // Sub-step 3: Phase 2 — Left Rotate on Parent A
  const T3 = C.left;
  A.right = T3;
  C.left = A;
  updateNodeMetrics(A);
  updateNodeMetrics(C);

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.3: RL Phase 2 — Left Rotate on Parent ${A.key}`,
    subtitle: `Elevating ${C.key} → Root, Demoting ${A.key} → Left Child of ${C.key}`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `Phase 2 of RL: Executed Left Rotation on parent ${A.key}.
- Node ${C.key} elevates to become the new subtree root.
- Node ${A.key} becomes the left child of ${C.key}.
- Subtree T3 (left of ${C.key}) reparents to the right of ${A.key}.`,
    mathematicalDerivation: `${C.key}.\\text{left} \\leftarrow ${A.key}, \\quad ${A.key}.\\text{right} \\leftarrow T_3`,
    examRule: 'Double Rotation Invariant: The middle node (C) always emerges as the root of the balanced subtree.',
    statusBadge: { text: 'RL Phase 2: Executed', variant: 'warning' },
    rotationMeta: {
      type: 'RL',
      pivotKey: A.key,
      elevatingKey: C.key,
      direction: 'counter-clockwise',
      subPhase: 'ROTATION_EXECUTION',
      stepNumberLabel: `${stepPrefix}.3`,
      description: `Left Rotate on ${A.key} elevates ${C.key} to root`,
    },
    treeState: cloneTree(C),
    activeNodeIds: [C.id, A.id, B.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(C),
  });

  // Sub-step 4: RL Balance Restored
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `${stepPrefix}.4: RL Double Rotation Complete & Balanced`,
    subtitle: `Root: ${C.key} (BF: ${C.balanceFactor}), Left: ${A.key} (BF: ${A.balanceFactor}), Right: ${B.key} (BF: ${B.balanceFactor})`,
    category: 'TREE',
    algorithmName: alg,
    facultyExplanation: `RL Double Rotation successfully rebalanced the tree. Heights and balance factors recalculated:\n- h(${A.key}) = ${A.height}, BF(${A.key}) = ${A.balanceFactor}\n- h(${B.key}) = ${B.height}, BF(${B.key}) = ${B.balanceFactor}\n- h(${C.key}) = ${C.height}, BF(${C.key}) = ${C.balanceFactor}`,
    mathematicalDerivation: `\\text{BF}(${C.key}) = 0, \\; |\\text{BF}(${A.key})| \\le 1, \\; |\\text{BF}(${B.key})| \\le 1 \\implies \\text{Balanced}`,
    examRule: 'Exam Check: Verify that all three nodes satisfy |BF| ≤ 1.',
    statusBadge: { text: 'RL Balanced', variant: 'success' },
    rotationMeta: {
      type: 'RL',
      pivotKey: A.key,
      elevatingKey: C.key,
      direction: 'counter-clockwise',
      subPhase: 'RECOLORED_BALANCED',
      stepNumberLabel: `${stepPrefix}.4`,
      description: `Balanced tree at root ${C.key}`,
    },
    treeState: cloneTree(C),
    activeNodeIds: [C.id],
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(C),
  });

  return C;
}

// --------------------------------------------------------------------------
// AVL Insertion
// --------------------------------------------------------------------------

export function generateAVLInsertionSteps(keys: number[]): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  let root: TreeNode | null = null;
  nextNodeId = 1;

  // Step 0: Initial empty state
  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: 'Initial State: Empty AVL Tree',
    subtitle: `Preparing to insert sequence: [${keys.join(', ')}]`,
    category: 'TREE',
    algorithmName: 'AVL Tree Insertion',
    facultyExplanation: 'An AVL tree begins empty. Every node will maintain the AVL balance invariant: BF(u) = Height(Left) - Height(Right) ∈ {-1, 0, +1}.',
    mathematicalDerivation: 'BF(u) = h_L - h_R \\in \\{-1, 0, +1\\}',
    examRule: 'Standard Rule: After standard BST insertion, update heights along the insertion path and check for |BF| > 1.',
    statusBadge: { text: 'Empty Tree', variant: 'normal' },
    treeState: null,
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: [],
  });

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    // Snapshot: Start insert key
    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Step ${i + 1}: BST Insertion of Key ${key}`,
      subtitle: `Inserting ${key} following standard binary search tree ordering`,
      category: 'TREE',
      algorithmName: 'AVL Tree Insertion',
      facultyExplanation: `Begin standard BST insertion for key ${key}. Traverse from the root, comparing keys until finding the appropriate leaf position.`,
      mathematicalDerivation: `\\text{Insert } ${key} \\text{ as a leaf with } h = 1, BF = 0.`,
      examRule: 'Step 1: Perform standard BST insertion before computing balance factors.',
      statusBadge: { text: `Inserting ${key}`, variant: 'accent' },
      treeState: cloneTree(root),
      activeNodeIds: [],
      traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
      traceTableRows: collectTableRows(root),
    });

    // Perform recursive insert with snapshot generation
    root = insertAndRecord(root, key, steps, `Step ${i + 1}`);
  }

  // Final summary snapshot
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: 'AVL Construction Complete',
    subtitle: `All ${keys.length} keys inserted successfully. Tree is fully balanced.`,
    category: 'TREE',
    algorithmName: 'AVL Tree Insertion',
    facultyExplanation: `All keys [${keys.join(', ')}] have been inserted. Every node satisfies the AVL invariant with |BF| ≤ 1. The final tree height is ${getHeight(root)}.`,
    mathematicalDerivation: `\\forall u \\in T, \\quad |BF(u)| \\le 1 \\implies \\text{AVL Invariant Satisfied. Total Height} = ${getHeight(root)}`,
    examRule: 'Final exam check: Write the final tree with balance factors marked next to every node.',
    statusBadge: { text: 'Construction Complete', variant: 'success' },
    treeState: cloneTree(root),
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(root),
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}

function insertAndRecord(
  node: TreeNode | null | undefined,
  key: number,
  steps: StepSnapshot[],
  stepPrefix: string
): TreeNode {
  if (!node) {
    const newNode = createNode(key);
    newNode.isHighlighted = true;
    newNode.highlightVariant = 'new';
    newNode.badgeText = 'New';
    return newNode;
  }

  if (key < node.key) {
    node.left = insertAndRecord(node.left, key, steps, stepPrefix);
  } else if (key > node.key) {
    node.right = insertAndRecord(node.right, key, steps, stepPrefix);
  } else {
    // Duplicate keys ignored
    return node;
  }

  updateNodeMetrics(node);
  const bf = node.balanceFactor;

  // Case 1: Left-Left (LL)
  if (bf > 1 && node.left && key < node.left.key) {
    return executeAndRecordLL(node, steps, stepPrefix, false);
  }

  // Case 2: Right-Right (RR)
  if (bf < -1 && node.right && key > node.right.key) {
    return executeAndRecordRR(node, steps, stepPrefix, false);
  }

  // Case 3: Left-Right (LR)
  if (bf > 1 && node.left && key > node.left.key) {
    return executeAndRecordLR(node, steps, stepPrefix, false);
  }

  // Case 4: Right-Left (RL)
  if (bf < -1 && node.right && key < node.right.key) {
    return executeAndRecordRL(node, steps, stepPrefix, false);
  }

  return node;
}

// --------------------------------------------------------------------------
// AVL Deletion
// --------------------------------------------------------------------------

export function generateAVLDeletionSteps(initialKeys: number[], deleteKeys: number[]): StepSnapshot[] {
  let root: TreeNode | null = null;
  nextNodeId = 1;
  const dummySteps: StepSnapshot[] = [];
  for (const k of initialKeys) {
    root = insertAndRecord(root, k, dummySteps, 'Init');
  }

  const steps: StepSnapshot[] = [];

  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: 'Initial Tree Before Deletions',
    subtitle: `Starting with AVL Tree of keys: [${initialKeys.join(', ')}]`,
    category: 'TREE',
    algorithmName: 'AVL Tree Deletion',
    facultyExplanation: `Tree is constructed and balanced. Target keys to delete in sequence: [${deleteKeys.join(', ')}].`,
    mathematicalDerivation: '\\forall u, \\; |BF(u)| \\le 1',
    examRule: 'Deletion Invariant: After BST deletion of a leaf, 1-child node, or 2-child node (using in-order successor), retrace back to the root rebalancing any node where |BF| > 1.',
    statusBadge: { text: 'Initial Balanced Tree', variant: 'normal' },
    treeState: cloneTree(root),
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(root),
  });

  for (let i = 0; i < deleteKeys.length; i++) {
    const keyToDelete = deleteKeys[i];
    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Step ${i + 1}: Delete Key ${keyToDelete}`,
      subtitle: `Searching for node with key ${keyToDelete} to remove`,
      category: 'TREE',
      algorithmName: 'AVL Tree Deletion',
      facultyExplanation: `Locate key ${keyToDelete} in the tree. Perform standard BST deletion, then calculate balance factors along the path from the parent of the deleted node back to the root.`,
      mathematicalDerivation: `\\text{Delete } ${keyToDelete} \\implies \\text{Update Heights and Rebalance upward}`,
      examRule: 'Exams require stating whether the deleted node is a Leaf, has 1 Child, or has 2 Children (replace with in-order successor).',
      statusBadge: { text: `Deleting ${keyToDelete}`, variant: 'accent' },
      treeState: cloneTree(root),
      traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
      traceTableRows: collectTableRows(root),
    });

    root = deleteAndRecord(root, keyToDelete, steps, `Step ${i + 1}`);
  }

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: 'All Deletions Completed',
    subtitle: 'AVL Tree is fully balanced',
    category: 'TREE',
    algorithmName: 'AVL Tree Deletion',
    facultyExplanation: 'All requested deletions have been processed and the AVL tree balance invariants are satisfied at every remaining node.',
    mathematicalDerivation: '\\text{All remaining nodes satisfy } |BF| \\le 1.',
    examRule: 'Final exam step: Re-draw the final balanced tree with all remaining keys and their balance factors.',
    statusBadge: { text: 'Deletion Complete', variant: 'success' },
    treeState: cloneTree(root),
    traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
    traceTableRows: collectTableRows(root),
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}

function getMinValueNode(node: TreeNode): TreeNode {
  let current = node;
  while (current.left) {
    current = current.left;
  }
  return current;
}

function deleteAndRecord(
  node: TreeNode | null | undefined,
  key: number,
  steps: StepSnapshot[],
  stepPrefix: string
): TreeNode | null {
  if (!node) return null;

  if (key < node.key) {
    node.left = deleteAndRecord(node.left, key, steps, stepPrefix);
  } else if (key > node.key) {
    node.right = deleteAndRecord(node.right, key, steps, stepPrefix);
  } else {
    // Found node to delete
    if (!node.left || !node.right) {
      const temp = node.left ? node.left : node.right;
      if (!temp) {
        node = null;
      } else {
        node = temp;
      }
    } else {
      // Two children: In-order successor
      const temp = getMinValueNode(node.right);
      const oldKey = node.key;
      node.key = temp.key;

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}: Node ${oldKey} Has Two Children → Replace with In-order Successor ${temp.key}`,
        subtitle: `In-order successor ${temp.key} copied to node position`,
        category: 'TREE',
        algorithmName: 'AVL Tree Deletion',
        facultyExplanation: `Node ${oldKey} has two children. Find its in-order successor (minimum value in right subtree = ${temp.key}). Copy ${temp.key} into node ${oldKey}'s position, and recursively delete key ${temp.key} from the right subtree.`,
        mathematicalDerivation: `\\text{Successor}(${oldKey}) = ${temp.key}. \\quad \\text{Copy } ${temp.key} \\to \\text{Node}, \\text{ then delete duplicate in right subtree.}`,
        examRule: 'Rule: When deleting a 2-child node, always substitute the In-Order Successor (or Predecessor) and delete that leaf.',
        statusBadge: { text: 'Successor Substituted', variant: 'warning' },
        treeState: cloneTree(node),
        traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
        traceTableRows: collectTableRows(node),
      });

      node.right = deleteAndRecord(node.right, temp.key, steps, stepPrefix);
    }
  }

  if (!node) return null;

  updateNodeMetrics(node);
  const bf = node.balanceFactor;

  // Rebalance Check
  if (bf > 1 && node.left) {
    const leftBf = node.left.balanceFactor;
    if (leftBf >= 0) {
      return executeAndRecordLL(node, steps, `${stepPrefix}-Rebalance`, true);
    } else {
      return executeAndRecordLR(node, steps, `${stepPrefix}-Rebalance`, true);
    }
  }

  if (bf < -1 && node.right) {
    const rightBf = node.right.balanceFactor;
    if (rightBf <= 0) {
      return executeAndRecordRR(node, steps, `${stepPrefix}-Rebalance`, true);
    } else {
      return executeAndRecordRL(node, steps, `${stepPrefix}-Rebalance`, true);
    }
  }

  return node;
}
