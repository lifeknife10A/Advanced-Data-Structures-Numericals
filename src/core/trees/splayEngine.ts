import { TreeNode } from '../../types/tree';
import { StepSnapshot, TraceTableRow } from '../../types/animation';

let splayNodeId = 1;

function createSplayNode(key: number): TreeNode {
  return {
    id: `splay-${key}-${splayNodeId++}`,
    key,
    height: 1,
    balanceFactor: 0,
    left: null,
    right: null,
  };
}

function cloneSplayTree(node: TreeNode | null | undefined): TreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    key: node.key,
    height: node.height,
    balanceFactor: node.balanceFactor,
    isHighlighted: node.isHighlighted,
    highlightVariant: node.highlightVariant,
    badgeText: node.badgeText,
    left: cloneSplayTree(node.left),
    right: cloneSplayTree(node.right),
  };
}

function collectSplayRows(root: TreeNode | null | undefined): TraceTableRow[] {
  const rows: TraceTableRow[] = [];
  function traverse(n: TreeNode | null | undefined, depth: number) {
    if (!n) return;
    traverse(n.left, depth + 1);
    rows.push({
      id: `splay-row-${n.key}`,
      cells: [
        n.key,
        depth,
        n.left ? n.left.key : '—',
        n.right ? n.right.key : '—',
        depth === 0 ? 'ROOT' : 'Subtree Node',
      ],
      isHighlighted: depth === 0,
    });
    traverse(n.right, depth + 1);
  }
  traverse(root, 0);
  return rows;
}

// Right rotation (Zig / Zig-Zig / Zig-Zag component)
function rightRotate(y: TreeNode): TreeNode {
  const x = y.left!;
  y.left = x.right;
  x.right = y;
  return x;
}

// Left rotation (Zag / Zag-Zag / Zag-Zig component)
function leftRotate(x: TreeNode): TreeNode {
  const y = x.right!;
  x.right = y.left;
  y.left = x;
  return y;
}

/**
 * Splays key to the root of the subtree rooted at `root`.
 * Generates granular multi-step educational snapshots for Zig, Zig-Zig, and Zig-Zag.
 */
function splayAndRecord(
  root: TreeNode | null | undefined,
  key: number,
  steps: StepSnapshot[],
  operationName: string,
  stepPrefix: string = 'Splay'
): TreeNode | null {
  if (!root || root.key === key) return root || null;

  // Key lies in Left Subtree
  if (key < root.key) {
    if (!root.left) return root;

    // Case 1: Zig-Zig (Left-Left)
    if (key < root.left.key) {
      if (root.left.left) {
        root.left.left = splayAndRecord(root.left.left, key, steps, operationName, `${stepPrefix}`);
      }

      if (!root.left.left) return root;

      const G = root;
      const P = root.left;
      const X = P.left!;

      // Sub-step 1: Detection
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}.1: Zig-Zig (Left-Left) Detected at Grandparent ${G.key}`,
        subtitle: `Node ${X.key} and Parent ${P.key} are both left children of ${G.key}`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Target node ${X.key} and its parent ${P.key} are in a straight Left-Left line under Grandparent ${G.key}.\n\nCrucial Sleator-Tarjan Rule: For Zig-Zig, rotate Grandparent ${G.key} Right FIRST, then rotate Parent ${P.key} Right. Rotating Grandparent first halves the depth of all descendant nodes, which guarantees amortized O(log n) performance.`,
        mathematicalDerivation: `\\text{Zig-Zig: } \\text{RotateRight}(G = ${G.key}) \\to \\text{RotateRight}(P = ${P.key})`,
        examRule: 'Zig-Zig Invariant: ALWAYS rotate the grandparent first. (Rotating parent first is a classic university exam penalty!)',
        statusBadge: { text: 'Zig-Zig: Detected', variant: 'warning' },
        rotationMeta: {
          type: 'ZIG_ZIG',
          pivotKey: G.key,
          elevatingKey: P.key,
          direction: 'clockwise',
          subPhase: 'DETECTION',
          stepNumberLabel: `${stepPrefix}.1`,
          description: `Zig-Zig configuration: G(${G.key}) -> P(${P.key}) -> X(${X.key})`,
        },
        treeState: cloneSplayTree(root),
        activeNodeIds: [G.id, P.id, X.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      // Sub-step 2: Rotate Grandparent G Right
      root = rightRotate(root);

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}.2: Zig-Zig Phase 1 — Rotate Grandparent ${G.key} Right`,
        subtitle: `Elevates Parent ${P.key} above Grandparent ${G.key}`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Executed Right Rotation on Grandparent ${G.key}:\n- Node ${P.key} is elevated.\n- Node ${G.key} becomes the right child of ${P.key}.\n- Subtree right of ${P.key} reparents to left of ${G.key}.`,
        mathematicalDerivation: `\\text{Phase 1 Complete: } P(${P.key}) \\text{ is now above } G(${G.key}).`,
        examRule: 'Check: Parent P is now the root of this local subtree.',
        statusBadge: { text: 'Zig-Zig Phase 1 Done', variant: 'warning' },
        rotationMeta: {
          type: 'ZIG_ZIG',
          pivotKey: G.key,
          elevatingKey: P.key,
          direction: 'clockwise',
          subPhase: 'SUBTREE_TRANSFER',
          stepNumberLabel: `${stepPrefix}.2`,
          description: `Phase 1: Rotated Grandparent ${G.key} Right`,
        },
        treeState: cloneSplayTree(root),
        activeNodeIds: [P.id, X.id, G.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      // Sub-step 3: Rotate Parent P Right
      root = rightRotate(root);

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}.3: Zig-Zig Phase 2 — Rotate Parent ${P.key} Right`,
        subtitle: `Elevates Target Node ${X.key} to Subtree Root`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Executed Right Rotation on Parent ${P.key}:\n- Target node ${X.key} rises to the root of this subtree.\n- Node ${P.key} becomes the right child of ${X.key}.\n- Node ${G.key} remains in the right subtree under ${P.key}.`,
        mathematicalDerivation: `\\text{Phase 2 Complete: Target } ${X.key} \\text{ elevated to Root of Subtree.}`,
        examRule: 'Zig-Zig Final: Target node is elevated, achieving path length halving.',
        statusBadge: { text: 'Zig-Zig Complete', variant: 'success' },
        rotationMeta: {
          type: 'ZIG_ZIG',
          pivotKey: P.key,
          elevatingKey: X.key,
          direction: 'clockwise',
          subPhase: 'ROTATION_EXECUTION',
          stepNumberLabel: `${stepPrefix}.3`,
          description: `Phase 2: Rotated Parent ${P.key} Right. Target ${X.key} elevated.`,
        },
        treeState: cloneSplayTree(root),
        activeNodeIds: [X.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      return root;
    }
    // Case 2: Zig-Zag (Left-Right)
    else if (key > root.left.key) {
      if (root.left.right) {
        root.left.right = splayAndRecord(root.left.right, key, steps, operationName, `${stepPrefix}`);
      }

      if (!root.left.right) return root;

      const G = root;
      const P = root.left;
      const X = P.right!;

      // Sub-step 1: Detection
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}.1: Zig-Zag (Left-Right) Detected at Grandparent ${G.key}`,
        subtitle: `Node ${X.key} is right child of left child ${P.key}`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Target node ${X.key} forms a zigzag (Left-Right) relative to Grandparent ${G.key}.\nAction: Perform Double Rotation:\nPhase 1: Rotate Parent ${P.key} Left (straightens into a line).\nPhase 2: Rotate Grandparent ${G.key} Right (elevates ${X.key} to root).`,
        mathematicalDerivation: `\\text{Zig-Zag: } \\text{RotateLeft}(P = ${P.key}) \\to \\text{RotateRight}(G = ${G.key})`,
        examRule: 'Zig-Zag Rule: Rotate parent first (opposite direction), then grandparent (matching direction).',
        statusBadge: { text: 'Zig-Zag: Detected', variant: 'warning' },
        rotationMeta: {
          type: 'ZIG_ZAG',
          pivotKey: P.key,
          elevatingKey: X.key,
          direction: 'counter-clockwise',
          subPhase: 'DETECTION',
          stepNumberLabel: `${stepPrefix}.1`,
          description: `Zig-Zag configuration: G(${G.key}) -> P(${P.key}) -> X(${X.key})`,
        },
        treeState: cloneSplayTree(root),
        activeNodeIds: [G.id, P.id, X.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      // Sub-step 2: Phase 1 — Rotate Parent P Left
      root.left = leftRotate(root.left);

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}.2: Zig-Zag Phase 1 — Rotate Parent ${P.key} Left`,
        subtitle: `Straightens Zig-Zag into Left-Left Line under ${G.key}`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Rotated Parent ${P.key} Left. Node ${X.key} is elevated to become the left child of Grandparent ${G.key}, with ${P.key} as ${X.key}'s left child.`,
        mathematicalDerivation: `\\text{Phase 1: Tree straightened into LL configuration: } ${G.key} \\to ${X.key} \\to ${P.key}`,
        examRule: 'Intermediate Check: Zig-Zag has now been converted to a straight line.',
        statusBadge: { text: 'Zig-Zag Phase 1 Done', variant: 'warning' },
        rotationMeta: {
          type: 'ZIG_ZAG',
          pivotKey: P.key,
          elevatingKey: X.key,
          direction: 'counter-clockwise',
          subPhase: 'SUBTREE_TRANSFER',
          stepNumberLabel: `${stepPrefix}.2`,
          description: `Rotated Parent ${P.key} Left`,
        },
        treeState: cloneSplayTree(root),
        activeNodeIds: [G.id, X.id, P.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      // Sub-step 3: Phase 2 — Rotate Grandparent G Right
      root = rightRotate(root);

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}.3: Zig-Zag Phase 2 — Rotate Grandparent ${G.key} Right`,
        subtitle: `Elevates Target ${X.key} to Subtree Root`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Rotated Grandparent ${G.key} Right. Node ${X.key} is now the root of the subtree, with ${P.key} as left child and ${G.key} as right child.`,
        mathematicalDerivation: `\\text{Phase 2 Complete: } ${X.key} \\text{ is root, Left: } ${P.key}, \\text{ Right: } ${G.key}`,
        examRule: 'Zig-Zag Final: Middle node (X) emerges as root.',
        statusBadge: { text: 'Zig-Zag Complete', variant: 'success' },
        rotationMeta: {
          type: 'ZIG_ZAG',
          pivotKey: G.key,
          elevatingKey: X.key,
          direction: 'clockwise',
          subPhase: 'ROTATION_EXECUTION',
          stepNumberLabel: `${stepPrefix}.3`,
          description: `Rotated Grandparent ${G.key} Right`,
        },
        treeState: cloneSplayTree(root),
        activeNodeIds: [X.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      return root;
    }

    if (!root.left) return root;

    // Single Zig Step (at Root)
    const P = root;
    const X = root.left;

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `${stepPrefix}.1: Zig Step (Single Right Rotate at Root ${P.key})`,
      subtitle: `Target ${X.key} is immediate left child of Root ${P.key}`,
      category: 'TREE',
      algorithmName: `Splay Tree ${operationName}`,
      facultyExplanation: `Target node ${X.key} is the direct child of the tree root ${P.key} (has no grandparent). Perform a single Right Rotation (Zig) to elevate ${X.key} to the root.`,
      mathematicalDerivation: `\\text{Zig: } \\text{RotateRight}(\\text{Root } = ${P.key}) \\implies ${X.key} \\text{ becomes Root.}`,
      examRule: 'Zig Rule: Only performed as the final step when target is an immediate child of the root.',
      statusBadge: { text: 'Zig: Single Rotate', variant: 'accent' },
      rotationMeta: {
        type: 'ZIG',
        pivotKey: P.key,
        elevatingKey: X.key,
        direction: 'clockwise',
        subPhase: 'ROTATION_EXECUTION',
        stepNumberLabel: `${stepPrefix}.1`,
        description: `Single Right Rotate on Root ${P.key}`,
      },
      treeState: cloneSplayTree(root),
      activeNodeIds: [P.id, X.id],
      traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
      traceTableRows: collectSplayRows(root),
    });

    return rightRotate(root);
  }
  // Key lies in Right Subtree
  else {
    if (!root.right) return root;

    // Case 3: Zag-Zig (Right-Left)
    if (key < root.right.key) {
      if (root.right.left) {
        root.right.left = splayAndRecord(root.right.left, key, steps, operationName, `${stepPrefix}`);
      }

      if (!root.right.left) return root;

      const G = root;
      const P = root.right;
      const X = P.left!;

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}.1: Zag-Zig (Right-Left) Detected at Grandparent ${G.key}`,
        subtitle: `Node ${X.key} is left child of right child ${P.key}`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Target node ${X.key} forms a Zag-Zig (Right-Left) relative to Grandparent ${G.key}.\nAction: Rotate Parent ${P.key} Right, then rotate Grandparent ${G.key} Left.`,
        mathematicalDerivation: `\\text{Zag-Zig: } \\text{RotateRight}(P = ${P.key}) \\to \\text{RotateLeft}(G = ${G.key})`,
        examRule: 'Zag-Zig Rule: Rotate parent right, then grandparent left.',
        statusBadge: { text: 'Zag-Zig: Detected', variant: 'warning' },
        rotationMeta: {
          type: 'ZIG_ZAG',
          pivotKey: P.key,
          elevatingKey: X.key,
          direction: 'clockwise',
          subPhase: 'DETECTION',
          stepNumberLabel: `${stepPrefix}.1`,
          description: `Zag-Zig configuration: G(${G.key}) -> P(${P.key}) -> X(${X.key})`,
        },
        treeState: cloneSplayTree(root),
        activeNodeIds: [G.id, P.id, X.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      root.right = rightRotate(root.right);

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}.2: Zag-Zig Phase 1 — Rotate Parent ${P.key} Right`,
        subtitle: `Straightens Zag-Zig into Right-Right Line under ${G.key}`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Rotated Parent ${P.key} Right. Node ${X.key} is now the right child of Grandparent ${G.key}, with ${P.key} as right child of ${X.key}.`,
        mathematicalDerivation: `\\text{Phase 1: Straightened to RR configuration under } ${G.key}`,
        examRule: 'Intermediate Check: Subtree is now a straight line.',
        statusBadge: { text: 'Zag-Zig Phase 1 Done', variant: 'warning' },
        rotationMeta: {
          type: 'ZIG_ZAG',
          pivotKey: P.key,
          elevatingKey: X.key,
          direction: 'clockwise',
          subPhase: 'SUBTREE_TRANSFER',
          stepNumberLabel: `${stepPrefix}.2`,
          description: `Rotated Parent ${P.key} Right`,
        },
        treeState: cloneSplayTree(root),
        activeNodeIds: [G.id, X.id, P.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      root = leftRotate(root);

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}.3: Zag-Zig Phase 2 — Rotate Grandparent ${G.key} Left`,
        subtitle: `Elevates Target ${X.key} to Subtree Root`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Rotated Grandparent ${G.key} Left. Node ${X.key} is now the root of the subtree, with ${G.key} as left child and ${P.key} as right child.`,
        mathematicalDerivation: `\\text{Phase 2 Complete: } ${X.key} \\text{ is Root.}`,
        examRule: 'Zag-Zig Final: Target node elevated to root.',
        statusBadge: { text: 'Zag-Zig Complete', variant: 'success' },
        rotationMeta: {
          type: 'ZIG_ZAG',
          pivotKey: G.key,
          elevatingKey: X.key,
          direction: 'counter-clockwise',
          subPhase: 'ROTATION_EXECUTION',
          stepNumberLabel: `${stepPrefix}.3`,
          description: `Rotated Grandparent ${G.key} Left`,
        },
        treeState: cloneSplayTree(root),
        activeNodeIds: [X.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      return root;
    }
    // Case 4: Zag-Zag (Right-Right)
    else if (key > root.right.key) {
      if (root.right.right) {
        root.right.right = splayAndRecord(root.right.right, key, steps, operationName, `${stepPrefix}`);
      }

      if (!root.right.right) return root;

      const G = root;
      const P = root.right;
      const X = P.right!;

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}.1: Zag-Zag (Right-Right) Detected at Grandparent ${G.key}`,
        subtitle: `Node ${X.key} and Parent ${P.key} are both right children of ${G.key}`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Target node ${X.key} and Parent ${P.key} are in a straight Right-Right line under Grandparent ${G.key}.\n\nSleator-Tarjan Rule: Rotate Grandparent ${G.key} Left FIRST, then rotate Parent ${P.key} Left.`,
        mathematicalDerivation: `\\text{Zag-Zag: } \\text{RotateLeft}(G = ${G.key}) \\to \\text{RotateLeft}(P = ${P.key})`,
        examRule: 'Zag-Zag Rule: Rotate grandparent first, then parent.',
        statusBadge: { text: 'Zag-Zag: Detected', variant: 'warning' },
        rotationMeta: {
          type: 'ZIG_ZIG',
          pivotKey: G.key,
          elevatingKey: P.key,
          direction: 'counter-clockwise',
          subPhase: 'DETECTION',
          stepNumberLabel: `${stepPrefix}.1`,
          description: `Zag-Zag configuration: G(${G.key}) -> P(${P.key}) -> X(${X.key})`,
        },
        treeState: cloneSplayTree(root),
        activeNodeIds: [G.id, P.id, X.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      root = leftRotate(root);

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}.2: Zag-Zag Phase 1 — Rotate Grandparent ${G.key} Left`,
        subtitle: `Elevates Parent ${P.key} above Grandparent ${G.key}`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Executed Left Rotation on Grandparent ${G.key}. Node ${P.key} rises to root of this subtree, with ${G.key} as its left child.`,
        mathematicalDerivation: `\\text{Phase 1: Parent } ${P.key} \\text{ elevated above Grandparent } ${G.key}`,
        examRule: 'Intermediate Checkpoint: Parent P is now above Grandparent G.',
        statusBadge: { text: 'Zag-Zag Phase 1 Done', variant: 'warning' },
        rotationMeta: {
          type: 'ZIG_ZIG',
          pivotKey: G.key,
          elevatingKey: P.key,
          direction: 'counter-clockwise',
          subPhase: 'SUBTREE_TRANSFER',
          stepNumberLabel: `${stepPrefix}.2`,
          description: `Rotated Grandparent ${G.key} Left`,
        },
        treeState: cloneSplayTree(root),
        activeNodeIds: [P.id, X.id, G.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      root = leftRotate(root);

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `${stepPrefix}.3: Zag-Zag Phase 2 — Rotate Parent ${P.key} Left`,
        subtitle: `Elevates Target ${X.key} to Subtree Root`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Executed Left Rotation on Parent ${P.key}. Target node ${X.key} rises to the root of the subtree, with ${P.key} as left child.`,
        mathematicalDerivation: `\\text{Phase 2 Complete: Target } ${X.key} \\text{ is Root.}`,
        examRule: 'Zag-Zag Final: Target node elevated, tree depth halved.',
        statusBadge: { text: 'Zag-Zag Complete', variant: 'success' },
        rotationMeta: {
          type: 'ZIG_ZIG',
          pivotKey: P.key,
          elevatingKey: X.key,
          direction: 'counter-clockwise',
          subPhase: 'ROTATION_EXECUTION',
          stepNumberLabel: `${stepPrefix}.3`,
          description: `Rotated Parent ${P.key} Left`,
        },
        treeState: cloneSplayTree(root),
        activeNodeIds: [X.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      return root;
    }

    if (!root.right) return root;

    // Single Zag Step (at Root)
    const P = root;
    const X = root.right;

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `${stepPrefix}.1: Zag Step (Single Left Rotate at Root ${P.key})`,
      subtitle: `Target ${X.key} is immediate right child of Root ${P.key}`,
      category: 'TREE',
      algorithmName: `Splay Tree ${operationName}`,
      facultyExplanation: `Target node ${X.key} is direct right child of root ${P.key}. Perform a single Left Rotation (Zag) to bring it to the root.`,
      mathematicalDerivation: `\\text{Zag: } \\text{RotateLeft}(\\text{Root } = ${P.key}) \\implies ${X.key} \\text{ becomes Root.}`,
      examRule: 'Zag Rule: Single left rotation when target is direct right child of root.',
      statusBadge: { text: 'Zag: Single Rotate', variant: 'accent' },
      rotationMeta: {
        type: 'ZIG',
        pivotKey: P.key,
        elevatingKey: X.key,
        direction: 'counter-clockwise',
        subPhase: 'ROTATION_EXECUTION',
        stepNumberLabel: `${stepPrefix}.1`,
        description: `Single Left Rotate on Root ${P.key}`,
      },
      treeState: cloneSplayTree(root),
      activeNodeIds: [P.id, X.id],
      traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
      traceTableRows: collectSplayRows(root),
    });

    return leftRotate(root);
  }
}

export function generateSplayInsertionSteps(keys: number[]): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  splayNodeId = 1;
  let root: TreeNode | null = null;

  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: 'Initial State: Empty Splay Tree',
    subtitle: `Preparing to insert keys: [${keys.join(', ')}]`,
    category: 'TREE',
    algorithmName: 'Splay Tree Insertion',
    facultyExplanation: 'A Splay Tree is a self-adjusting binary search tree where every newly inserted or accessed node is immediately splayed to the root using Zig, Zig-Zig, and Zig-Zag operations.',
    mathematicalDerivation: '\\text{Operation: } \\text{BST Insert}(k) \\implies \\text{Splay}(k) \\to \\text{Root}',
    examRule: 'Fundamental Invariant: The most recently inserted or accessed element is ALWAYS the root of the splay tree.',
    statusBadge: { text: 'Empty Splay Tree', variant: 'normal' },
    treeState: null,
    traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
    traceTableRows: [],
  });

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (!root) {
      root = createSplayNode(key);
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Step ${i + 1}: Insert ${key} as Root`,
        subtitle: `Tree was empty; ${key} becomes the root`,
        category: 'TREE',
        algorithmName: 'Splay Tree Insertion',
        facultyExplanation: `Inserted key ${key} as the root of the empty splay tree.`,
        mathematicalDerivation: `\\text{Root} = ${key}`,
        examRule: 'First insertion in an empty splay tree directly forms the root.',
        statusBadge: { text: `Root = ${key}`, variant: 'success' },
        treeState: cloneSplayTree(root),
        activeNodeIds: [root.id],
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });
      continue;
    }

    // Step A: Standard BST Insert
    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Step ${i + 1}.1: Standard BST Insertion of Key ${key}`,
      subtitle: `Inserting ${key} into BST before splaying to root`,
      category: 'TREE',
      algorithmName: 'Splay Tree Insertion',
      facultyExplanation: `Insert key ${key} into the splay tree following standard BST ordering rules. Once inserted at a leaf, we will splay it to the root.`,
      mathematicalDerivation: `\\text{Insert } ${key} \\text{ at appropriate leaf position}`,
      examRule: 'Step 1: Perform regular BST insert. Step 2: Splay the inserted node to the root.',
      statusBadge: { text: `Inserting ${key}`, variant: 'accent' },
      treeState: cloneSplayTree(root),
      traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
      traceTableRows: collectSplayRows(root),
    });

    root = bstInsert(root, key);

    // Step B: Splay to root
    root = splayAndRecord(root, key, steps, 'Insertion', `Step ${i + 1}.2 Splay`);
  }

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: 'Splay Tree Construction Complete',
    subtitle: `All ${keys.length} keys processed. Most recent key ${keys[keys.length - 1]} is at the root.`,
    category: 'TREE',
    algorithmName: 'Splay Tree Insertion',
    facultyExplanation: `All keys [${keys.join(', ')}] have been inserted and splayed. The tree is a valid BST.`,
    mathematicalDerivation: '\\text{Amortized Cost: } O(m \\log n) \\text{ across } m \\text{ operations via Potential Method.}',
    examRule: 'Verify that the last inserted key is at the root of the tree.',
    statusBadge: { text: 'Construction Complete', variant: 'success' },
    treeState: cloneSplayTree(root),
    traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
    traceTableRows: collectSplayRows(root),
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}

function bstInsert(root: TreeNode, key: number): TreeNode {
  if (key < root.key) {
    if (!root.left) {
      root.left = createSplayNode(key);
    } else {
      root.left = bstInsert(root.left, key);
    }
  } else if (key > root.key) {
    if (!root.right) {
      root.right = createSplayNode(key);
    } else {
      root.right = bstInsert(root.right, key);
    }
  }
  return root;
}

export function generateSplaySearchSteps(keys: number[], searchKey: number): StepSnapshot[] {
  let root: TreeNode | null = null;
  splayNodeId = 1;
  const dummySteps: StepSnapshot[] = [];
  for (const k of keys) {
    if (!root) root = createSplayNode(k);
    else {
      root = bstInsert(root, k);
      root = splayAndRecord(root, k, dummySteps, 'Init');
    }
  }

  const steps: StepSnapshot[] = [];

  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: `Search for Key ${searchKey} in Splay Tree`,
    subtitle: `Starting search in tree with keys: [${keys.join(', ')}]`,
    category: 'TREE',
    algorithmName: 'Splay Tree Search',
    facultyExplanation: `In a Splay Tree, searching for key ${searchKey} will access nodes along the search path. Regardless of whether ${searchKey} is found, the accessed node (either target or last accessed ancestor) is splayed to the root.`,
    mathematicalDerivation: `\\text{Search}(${searchKey}) \\implies \\text{Splay accessed node to root.}`,
    examRule: 'Search Invariant: Successful search splays target. Unsuccessful search splays the last-visited leaf node to root.',
    statusBadge: { text: `Searching for ${searchKey}`, variant: 'accent' },
    treeState: cloneSplayTree(root),
    traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
    traceTableRows: collectSplayRows(root),
  });

  root = splayAndRecord(root, searchKey, steps, 'Search', 'Search-Splay');

  const found = root && root.key === searchKey;

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: found ? `Key ${searchKey} Found & Splayed to Root` : `Key ${searchKey} Not Found — Last Node Splayed to Root`,
    subtitle: `Current Root is ${root ? root.key : 'None'}`,
    category: 'TREE',
    algorithmName: 'Splay Tree Search',
    facultyExplanation: found
      ? `Key ${searchKey} was successfully found and splayed to the root of the splay tree.`
      : `Key ${searchKey} was not present in the tree. The last accessed node ${root ? root.key : ''} has been splayed to the root.`,
    mathematicalDerivation: found ? `\\text{Root} = ${searchKey} \\text{ (Successful Search)}` : `\\text{Root} = ${root ? root.key : ''} \\text{ (Unsuccessful Search)}`,
    examRule: 'Exams test whether you correctly splayed the last accessed node upon search miss.',
    statusBadge: { text: found ? 'Key Found & Splayed' : 'Not Found (Splayed Last)', variant: found ? 'success' : 'warning' },
    treeState: cloneSplayTree(root),
    traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
    traceTableRows: collectSplayRows(root),
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}

export function generateSplayDeletionSteps(
  keys: number[],
  keyToDelete: number,
  mode: 'bottom-up' | 'top-down' = 'bottom-up'
): StepSnapshot[] {
  let root: TreeNode | null = null;
  splayNodeId = 1;
  const dummySteps: StepSnapshot[] = [];
  for (const k of keys) {
    if (!root) root = createSplayNode(k);
    else {
      root = bstInsert(root, k);
      root = splayAndRecord(root, k, dummySteps, 'Init');
    }
  }

  const steps: StepSnapshot[] = [];

  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: `Initial State: Splay Tree Before Deleting ${keyToDelete}`,
    subtitle: `Mode: ${mode === 'bottom-up' ? 'Bottom-Up Deletion via Join(L, R)' : 'Top-Down Deletion'}`,
    category: 'TREE',
    algorithmName: `Splay Tree Deletion (${mode})`,
    facultyExplanation: `Bottom-Up Deletion Algorithm:\n1. Splay target ${keyToDelete} to the root.\n2. If root != ${keyToDelete}, key does not exist.\n3. Disconnect left subtree L and right subtree R.\n4. If L is empty, new root is R.\n5. Otherwise, splay max element in L to L's root, then attach R as its right child.`,
    mathematicalDerivation: `\\text{Delete}(k) = \\text{Join}(\\text{SplayMax}(L), R) \\text{ after disconnecting } k.`,
    examRule: 'Bottom-Up Deletion: Splay target to root -> Split L & R -> Splay max(L) to root -> Attach R as right child.',
    statusBadge: { text: `Deleting ${keyToDelete}`, variant: 'accent' },
    treeState: cloneSplayTree(root),
    traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
    traceTableRows: collectSplayRows(root),
  });

  // Step 1: Splay keyToDelete to root
  root = splayAndRecord(root, keyToDelete, steps, 'Deletion (Phase 1)', 'Step 1-Splay');

  if (!root || root.key !== keyToDelete) {
    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Key ${keyToDelete} Not Found in Tree`,
      subtitle: 'Deletion aborted',
      category: 'TREE',
      algorithmName: 'Splay Tree Deletion',
      facultyExplanation: `Key ${keyToDelete} is not in the tree. The last accessed node ${root ? root.key : ''} is at the root.`,
      mathematicalDerivation: '\\text{Key not found.}',
      examRule: 'If key is absent, splay last accessed node to root and terminate.',
      statusBadge: { text: 'Key Not Found', variant: 'danger' },
      treeState: cloneSplayTree(root),
      traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
      traceTableRows: collectSplayRows(root),
    });
    steps.forEach((s) => (s.totalSteps = steps.length));
    return steps;
  }

  // Step 2: Disconnect root
  const L = root.left;
  const R = root.right;

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `Step 2: Disconnect Root ${keyToDelete} → Split Subtrees L & R`,
    subtitle: `Subtree L: [${L ? L.key : 'Empty'}], Subtree R: [${R ? R.key : 'Empty'}]`,
    category: 'TREE',
    algorithmName: 'Splay Tree Deletion',
    facultyExplanation: `Target ${keyToDelete} is at the root. Delete ${keyToDelete} by severing its pointers to left subtree L and right subtree R.`,
    mathematicalDerivation: `T \\setminus \\{${keyToDelete}\\} = (L, R)`,
    examRule: 'Split step: Clearly isolate subtrees L and R.',
    statusBadge: { text: `Root ${keyToDelete} Removed`, variant: 'warning' },
    treeState: cloneSplayTree(L || R),
    traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
    traceTableRows: collectSplayRows(L || R),
  });

  if (!L) {
    root = R || null;
  } else {
    // Splay max in L to root of L
    let maxL = L;
    while (maxL.right) maxL = maxL.right;

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Step 3: Splay Maximum Key ${maxL.key} to Root of Left Subtree L`,
      subtitle: `Since ${maxL.key} is the max in L, it will have NO right child`,
      category: 'TREE',
      algorithmName: 'Splay Tree Deletion',
      facultyExplanation: `Find the maximum key in left subtree L (${maxL.key}) and splay it to the root of L. Because ${maxL.key} is maximal, its right child is guaranteed to be NULL.`,
      mathematicalDerivation: `\\text{SplayMax}(L) \\implies ${maxL.key}.\\text{right} = \\emptyset`,
      examRule: 'Key Invariant: Splaying max(L) guarantees that max(L).right is NULL, providing an exact slot to attach R.',
      statusBadge: { text: `Splaying Max(L) = ${maxL.key}`, variant: 'accent' },
      treeState: cloneSplayTree(L),
      traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
      traceTableRows: collectSplayRows(L),
    });

    const newL = splayAndRecord(L, maxL.key, steps, 'Deletion (Phase 3: SplayMax)', 'Step 3-SplayMax');
    if (newL) {
      newL.right = R || null;
      root = newL;
    }
  }

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `Step 4: Join Subtrees → Deletion of ${keyToDelete} Complete`,
    subtitle: `New Root is ${root ? root.key : 'Empty'}`,
    category: 'TREE',
    algorithmName: 'Splay Tree Deletion',
    facultyExplanation: `Attached right subtree R as the right child of splayed left root. Splay tree deletion is complete and the tree remains a valid self-adjusting BST.`,
    mathematicalDerivation: `\\text{Final Root: } ${root ? root.key : 'None'}`,
    examRule: 'Final exam step: Draw the joined tree with updated root.',
    statusBadge: { text: 'Deletion Complete', variant: 'success' },
    treeState: cloneSplayTree(root),
    traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
    traceTableRows: collectSplayRows(root),
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}
