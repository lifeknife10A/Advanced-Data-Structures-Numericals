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

// Rotations
function rotateRight(y: TreeNode): TreeNode {
  const x = y.left!;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  updateNodeMetrics(y);
  updateNodeMetrics(x);

  return x;
}

function rotateLeft(x: TreeNode): TreeNode {
  const y = x.right!;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  updateNodeMetrics(x);
  updateNodeMetrics(y);

  return y;
}

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
      title: `Step ${i + 1}.1: BST Insertion of Key ${key}`,
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
    root = insertAndRecord(root, key, steps);
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

  // Assign total steps
  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}

function insertAndRecord(
  node: TreeNode | null | undefined,
  key: number,
  steps: StepSnapshot[]
): TreeNode {
  if (!node) {
    const newNode = createNode(key);
    newNode.isHighlighted = true;
    newNode.highlightVariant = 'new';
    newNode.badgeText = 'New';
    return newNode;
  }

  if (key < node.key) {
    node.left = insertAndRecord(node.left, key, steps);
  } else if (key > node.key) {
    node.right = insertAndRecord(node.right, key, steps);
  } else {
    // Duplicate keys ignored
    return node;
  }

  updateNodeMetrics(node);

  const bf = node.balanceFactor;

  // Case 1: Left-Left (LL)
  if (bf > 1 && node.left && key < node.left.key) {
    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `LL Violation at Node ${node.key}`,
      subtitle: `BF(${node.key}) = +2, BF(${node.left.key}) = +1`,
      category: 'TREE',
      algorithmName: 'AVL Tree Insertion',
      facultyExplanation: `Node ${node.key} has Balance Factor +2 (left-heavy), and newly inserted key ${key} is in the Left Subtree of left child ${node.left.key}. This is a Left-Left (LL) Case. Perform a Single Right Rotation on Node ${node.key}.`,
      mathematicalDerivation: `BF(${node.key}) = h_L - h_R = ${getHeight(node.left)} - ${getHeight(node.right)} = +2 \\implies \\text{Right Rotation on } ${node.key}`,
      examRule: 'LL Case Resolution: Right Rotation on node with BF = +2. Left child becomes new subtree root.',
      statusBadge: { text: 'LL Case (Right Rotate)', variant: 'danger' },
      treeState: cloneTree(node),
      activeNodeIds: [node.id, node.left.id],
      traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
      traceTableRows: collectTableRows(node),
    });

    const rotated = rotateRight(node);
    return rotated;
  }

  // Case 2: Right-Right (RR)
  if (bf < -1 && node.right && key > node.right.key) {
    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `RR Violation at Node ${node.key}`,
      subtitle: `BF(${node.key}) = -2, BF(${node.right.key}) = -1`,
      category: 'TREE',
      algorithmName: 'AVL Tree Insertion',
      facultyExplanation: `Node ${node.key} has Balance Factor -2 (right-heavy), and key ${key} was added to the Right Subtree of right child ${node.right.key}. This is a Right-Right (RR) Case. Perform a Single Left Rotation on Node ${node.key}.`,
      mathematicalDerivation: `BF(${node.key}) = h_L - h_R = ${getHeight(node.left)} - ${getHeight(node.right)} = -2 \\implies \\text{Left Rotation on } ${node.key}`,
      examRule: 'RR Case Resolution: Left Rotation on node with BF = -2. Right child becomes new subtree root.',
      statusBadge: { text: 'RR Case (Left Rotate)', variant: 'danger' },
      treeState: cloneTree(node),
      activeNodeIds: [node.id, node.right.id],
      traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
      traceTableRows: collectTableRows(node),
    });

    const rotated = rotateLeft(node);
    return rotated;
  }

  // Case 3: Left-Right (LR)
  if (bf > 1 && node.left && key > node.left.key) {
    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `LR Violation at Node ${node.key}`,
      subtitle: `BF(${node.key}) = +2, BF(${node.left.key}) = -1`,
      category: 'TREE',
      algorithmName: 'AVL Tree Insertion',
      facultyExplanation: `Node ${node.key} has Balance Factor +2 (left-heavy), but key ${key} is in the Right Subtree of left child ${node.left.key} (LR Case). Perform a Double Rotation: (1) Left Rotation on Left Child ${node.left.key}, then (2) Right Rotation on Node ${node.key}.`,
      mathematicalDerivation: `BF(${node.key}) = +2, \\; BF(${node.left.key}) = -1 \\implies \\text{RotateLeft}(${node.left.key}) \\to \\text{RotateRight}(${node.key})`,
      examRule: 'LR Case Resolution: Double rotation (Left on child, Right on parent).',
      statusBadge: { text: 'LR Case (Left-Right Double Rotate)', variant: 'warning' },
      treeState: cloneTree(node),
      activeNodeIds: [node.id, node.left.id],
      traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
      traceTableRows: collectTableRows(node),
    });

    node.left = rotateLeft(node.left);
    return rotateRight(node);
  }

  // Case 4: Right-Left (RL)
  if (bf < -1 && node.right && key < node.right.key) {
    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `RL Violation at Node ${node.key}`,
      subtitle: `BF(${node.key}) = -2, BF(${node.right.key}) = +1`,
      category: 'TREE',
      algorithmName: 'AVL Tree Insertion',
      facultyExplanation: `Node ${node.key} has Balance Factor -2 (right-heavy), but key ${key} is in the Left Subtree of right child ${node.right.key} (RL Case). Perform a Double Rotation: (1) Right Rotation on Right Child ${node.right.key}, then (2) Left Rotation on Node ${node.key}.`,
      mathematicalDerivation: `BF(${node.key}) = -2, \\; BF(${node.right.key}) = +1 \\implies \\text{RotateRight}(${node.right.key}) \\to \\text{RotateLeft}(${node.key})`,
      examRule: 'RL Case Resolution: Double rotation (Right on child, Left on parent).',
      statusBadge: { text: 'RL Case (Right-Left Double Rotate)', variant: 'warning' },
      treeState: cloneTree(node),
      activeNodeIds: [node.id, node.right.id],
      traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
      traceTableRows: collectTableRows(node),
    });

    node.right = rotateRight(node.right);
    return rotateLeft(node);
  }

  return node;
}

export function generateAVLDeletionSteps(initialKeys: number[], deleteKeys: number[]): StepSnapshot[] {
  // Build initial tree
  let root: TreeNode | null = null;
  nextNodeId = 1;
  const dummySteps: StepSnapshot[] = [];
  for (const k of initialKeys) {
    root = insertAndRecord(root, k, dummySteps);
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

    root = deleteAndRecord(root, keyToDelete, steps);
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
  steps: StepSnapshot[]
): TreeNode | null {
  if (!node) return null;

  if (key < node.key) {
    node.left = deleteAndRecord(node.left, key, steps);
  } else if (key > node.key) {
    node.right = deleteAndRecord(node.right, key, steps);
  } else {
    // Found node to delete
    if (!node.left || !node.right) {
      const temp = node.left ? node.left : node.right;
      if (!temp) {
        // No child (Leaf)
        node = null;
      } else {
        // One child
        node = temp;
      }
    } else {
      // Two children: Get in-order successor (smallest in right subtree)
      const temp = getMinValueNode(node.right);
      const oldKey = node.key;
      node.key = temp.key;

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Node ${oldKey} Has Two Children: Replace with Successor ${temp.key}`,
        subtitle: `In-order successor ${temp.key} copied to node position`,
        category: 'TREE',
        algorithmName: 'AVL Tree Deletion',
        facultyExplanation: `Node ${oldKey} has two children. Find its in-order successor (minimum value in right subtree = ${temp.key}). Copy ${temp.key} into node ${oldKey}'s position, and recursively delete key ${temp.key} from the right subtree.`,
        mathematicalDerivation: `\\text{Successor}(${oldKey}) = ${temp.key}. \\quad \\text{Copy } ${temp.key} \\to \\text{Node}, \\text{ then delete duplicate in right subtree.}`,
        examRule: 'Rule: When deleting a 2-child node, always substitute the In-Order Successor (or Predecessor) and delete that leaf.',
        statusBadge: { text: 'In-order Successor Substituted', variant: 'warning' },
        treeState: cloneTree(node),
        traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
        traceTableRows: collectTableRows(node),
      });

      node.right = deleteAndRecord(node.right, temp.key, steps);
    }
  }

  if (!node) return null;

  updateNodeMetrics(node);
  const bf = node.balanceFactor;

  // Rebalance Check
  if (bf > 1 && node.left) {
    const leftBf = node.left.balanceFactor;
    if (leftBf >= 0) {
      // LL Case
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Rebalance After Deletion: LL Case at Node ${node.key}`,
        subtitle: `BF(${node.key}) = +2, BF(${node.left.key}) = ${leftBf >= 0 ? '+' : ''}${leftBf}`,
        category: 'TREE',
        algorithmName: 'AVL Tree Deletion',
        facultyExplanation: `Deletion in right subtree caused Node ${node.key} to become left-heavy with BF = +2. Since Left Child ${node.left.key} has BF ≥ 0, perform a Single Right Rotation on Node ${node.key}.`,
        mathematicalDerivation: `BF(${node.key}) = +2, BF(${node.left.key}) \\ge 0 \\implies \\text{Right Rotation on } ${node.key}`,
        examRule: 'LL Deletion Rebalance: Single Right Rotation restores balance.',
        statusBadge: { text: 'LL Deletion Rebalance', variant: 'danger' },
        treeState: cloneTree(node),
        traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
        traceTableRows: collectTableRows(node),
      });
      return rotateRight(node);
    } else {
      // LR Case
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Rebalance After Deletion: LR Case at Node ${node.key}`,
        subtitle: `BF(${node.key}) = +2, BF(${node.left.key}) = -1`,
        category: 'TREE',
        algorithmName: 'AVL Tree Deletion',
        facultyExplanation: `Node ${node.key} has BF = +2 and Left Child ${node.left.key} has BF = -1. Perform Double Rotation: Left on Child ${node.left.key}, then Right on Node ${node.key}.`,
        mathematicalDerivation: `BF(${node.key}) = +2, BF(${node.left.key}) = -1 \\implies \\text{RotateLeft}(${node.left.key}) \\to \\text{RotateRight}(${node.key})`,
        examRule: 'LR Deletion Rebalance: Double Rotation (Left-Right).',
        statusBadge: { text: 'LR Deletion Rebalance', variant: 'warning' },
        treeState: cloneTree(node),
        traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
        traceTableRows: collectTableRows(node),
      });
      node.left = rotateLeft(node.left);
      return rotateRight(node);
    }
  }

  if (bf < -1 && node.right) {
    const rightBf = node.right.balanceFactor;
    if (rightBf <= 0) {
      // RR Case
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Rebalance After Deletion: RR Case at Node ${node.key}`,
        subtitle: `BF(${node.key}) = -2, BF(${node.right.key}) = ${rightBf >= 0 ? '+' : ''}${rightBf}`,
        category: 'TREE',
        algorithmName: 'AVL Tree Deletion',
        facultyExplanation: `Deletion in left subtree caused Node ${node.key} to become right-heavy with BF = -2. Since Right Child ${node.right.key} has BF ≤ 0, perform a Single Left Rotation on Node ${node.key}.`,
        mathematicalDerivation: `BF(${node.key}) = -2, BF(${node.right.key}) \\le 0 \\implies \\text{Left Rotation on } ${node.key}`,
        examRule: 'RR Deletion Rebalance: Single Left Rotation restores balance.',
        statusBadge: { text: 'RR Deletion Rebalance', variant: 'danger' },
        treeState: cloneTree(node),
        traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
        traceTableRows: collectTableRows(node),
      });
      return rotateLeft(node);
    } else {
      // RL Case
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Rebalance After Deletion: RL Case at Node ${node.key}`,
        subtitle: `BF(${node.key}) = -2, BF(${node.right.key}) = +1`,
        category: 'TREE',
        algorithmName: 'AVL Tree Deletion',
        facultyExplanation: `Node ${node.key} has BF = -2 and Right Child ${node.right.key} has BF = +1. Perform Double Rotation: Right on Child ${node.right.key}, then Left on Node ${node.key}.`,
        mathematicalDerivation: `BF(${node.key}) = -2, BF(${node.right.key}) = +1 \\implies \\text{RotateRight}(${node.right.key}) \\to \\text{RotateLeft}(${node.key})`,
        examRule: 'RL Deletion Rebalance: Double Rotation (Right-Left).',
        statusBadge: { text: 'RL Deletion Rebalance', variant: 'warning' },
        treeState: cloneTree(node),
        traceTableHeaders: ['Node Key', 'Left Height (hL)', 'Right Height (hR)', 'Height (h)', 'Balance Factor (BF)', 'Status'],
        traceTableRows: collectTableRows(node),
      });
      node.right = rotateRight(node.right);
      return rotateLeft(node);
    }
  }

  return node;
}
