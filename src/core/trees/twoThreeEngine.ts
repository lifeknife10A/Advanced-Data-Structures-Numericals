import { TreeNode } from '../../types/tree';
import { StepSnapshot, TraceTableRow } from '../../types/animation';

let nodeCounter = 1;

interface TwoThreeInternalNode {
  id: string;
  keys: number[];
  children: TwoThreeInternalNode[];
  isLeaf: boolean;
}

function create23Node(keys: number[] = [], isLeaf: boolean = true): TwoThreeInternalNode {
  return {
    id: `node-23-${nodeCounter++}`,
    keys: [...keys].sort((a, b) => a - b),
    children: [],
    isLeaf,
  };
}

function convertToTreeNode(node: TwoThreeInternalNode | null): TreeNode | null {
  if (!node) return null;

  const treeNode: TreeNode = {
    id: node.id,
    key: node.keys[0] || 0,
    keys: [...node.keys],
    height: 1,
    balanceFactor: 0,
    left: null,
    middle: null,
    right: null,
  };

  if (node.children.length === 2) {
    treeNode.left = convertToTreeNode(node.children[0]);
    treeNode.right = convertToTreeNode(node.children[1]);
  } else if (node.children.length === 3) {
    treeNode.left = convertToTreeNode(node.children[0]);
    treeNode.middle = convertToTreeNode(node.children[1]);
    treeNode.right = convertToTreeNode(node.children[2]);
  } else if (node.children.length === 4) {
    // Temporary 4-child during split visualization
    treeNode.left = convertToTreeNode(node.children[0]);
    treeNode.middle = convertToTreeNode(node.children[1]);
    treeNode.right = convertToTreeNode(node.children[2]);
  }

  return treeNode;
}

function clone23Tree(node: TwoThreeInternalNode | null): TwoThreeInternalNode | null {
  if (!node) return null;
  return {
    id: node.id,
    keys: [...node.keys],
    isLeaf: node.isLeaf,
    children: node.children.map((c) => clone23Tree(c)!),
  };
}

function collect23Rows(root: TwoThreeInternalNode | null): TraceTableRow[] {
  const rows: TraceTableRow[] = [];
  function traverse(n: TwoThreeInternalNode | null, depth: number) {
    if (!n) return;
    rows.push({
      id: `row-${n.id}`,
      cells: [
        `[ ${n.keys.join(', ')} ]`,
        n.isLeaf ? 'Leaf Node' : 'Internal Node',
        n.keys.length === 1 ? '2-Node (1 key, 2 children)' : n.keys.length === 2 ? '3-Node (2 keys, 3 children)' : '4-Node (Overflow!)',
        `Depth ${depth}`,
        n.keys.length > 2 ? 'OVERFLOW (Split required)' : 'VALID',
      ],
      isHighlighted: n.keys.length > 2,
    });
    n.children.forEach((c) => traverse(c, depth + 1));
  }
  traverse(root, 0);
  return rows;
}

export function generateTwoThreeInsertionSteps(keys: number[]): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  nodeCounter = 1;
  let root: TwoThreeInternalNode | null = null;

  // Initial Step
  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: 'Initial State: Empty 2-3 Tree',
    subtitle: `Preparing to insert keys: [${keys.join(', ')}]`,
    category: 'TREE',
    algorithmName: '2-3 Tree Insertion',
    facultyExplanation: 'A 2-3 tree is a perfectly balanced multiway search tree. All leaf nodes are at the same depth. Every internal node is either a 2-node (1 key, 2 children) or a 3-node (2 keys, 3 children).',
    mathematicalDerivation: '\\text{Invariant: All leaves at same depth } h. \\quad \\text{Node capacity} \\in [1, 2] \\text{ keys}.',
    examRule: 'Core Principle: 2-3 trees grow UPWARDS from the leaves when roots split, maintaining perfect height balance.',
    statusBadge: { text: 'Empty Tree', variant: 'normal' },
    treeState: null,
    traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
    traceTableRows: [],
  });

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (!root) {
      root = create23Node([key], true);
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Insert Key ${key} into Empty Tree`,
        subtitle: `Creates root 2-node [${key}]`,
        category: 'TREE',
        algorithmName: '2-3 Tree Insertion',
        facultyExplanation: `Key ${key} inserted as root 2-node [${key}].`,
        mathematicalDerivation: `\\text{Root} = [${key}] \\quad (\\text{2-node, Leaf})`,
        examRule: 'Step 1: First key creates root 2-node at height 1.',
        statusBadge: { text: `Inserted ${key}`, variant: 'success' },
        treeState: convertToTreeNode(root),
        traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
        traceTableRows: collect23Rows(root),
      });
      continue;
    }

    // Step Snapshot before insertion
    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Step ${i + 1}: Insert Key ${key}`,
      subtitle: `Traversing to locate appropriate leaf node for ${key}`,
      category: 'TREE',
      algorithmName: '2-3 Tree Insertion',
      facultyExplanation: `Search down the tree using multi-way comparisons to find the leaf where ${key} belongs. Then insert ${key} into the leaf.`,
      mathematicalDerivation: `\\text{Locate leaf for } ${key} \\implies \\text{Add key to sorted leaf list.}`,
      examRule: 'Insertion Rule: Always insert keys into leaf nodes first, never into internal nodes directly.',
      statusBadge: { text: `Inserting ${key}`, variant: 'accent' },
      treeState: convertToTreeNode(root),
      traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
      traceTableRows: collect23Rows(root),
    });

    const splitResult = insert23Internal(root, key, steps);
    if (splitResult) {
      // Root split!
      const newRoot = create23Node([splitResult.promotedKey], false);
      newRoot.children = [splitResult.leftChild, splitResult.rightChild];
      root = newRoot;

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Root Split: Tree Height Increases!`,
        subtitle: `Middle key [${splitResult.promotedKey}] forms new Root`,
        category: 'TREE',
        algorithmName: '2-3 Tree Insertion',
        facultyExplanation: `The root overflowed into a 4-node and split. Middle key ${splitResult.promotedKey} is promoted to create a new root 2-node. The tree height increases by 1, and all leaves remain at the exact same depth.`,
        mathematicalDerivation: `\\text{Root Split: } [${splitResult.promotedKey}] \\text{ with left child } [${splitResult.leftChild.keys.join(', ')}] \\text{ and right child } [${splitResult.rightChild.keys.join(', ')}].`,
        examRule: 'Exam Highlight: 2-3 trees ONLY grow in height when the root splits!',
        statusBadge: { text: 'Root Split (Height +1)', variant: 'warning' },
        treeState: convertToTreeNode(root),
        traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
        traceTableRows: collect23Rows(root),
      });
    }
  }

  // Final Step
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: '2-3 Tree Construction Completed',
    subtitle: `All keys [${keys.join(', ')}] inserted successfully`,
    category: 'TREE',
    algorithmName: '2-3 Tree Insertion',
    facultyExplanation: `All keys have been integrated. Every node satisfies the 2-3 tree invariants: all internal nodes have 2 or 3 children, and all leaves reside at the same bottom level.`,
    mathematicalDerivation: `\\text{Valid 2-3 Tree with } ${keys.length} \\text{ keys.}`,
    examRule: 'Final exam check: Verify all leaf nodes are horizontally aligned at the exact same level.',
    statusBadge: { text: 'Complete & Balanced', variant: 'success' },
    treeState: convertToTreeNode(root),
    traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
    traceTableRows: collect23Rows(root),
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}

interface SplitResult {
  promotedKey: number;
  leftChild: TwoThreeInternalNode;
  rightChild: TwoThreeInternalNode;
}

function insert23Internal(
  node: TwoThreeInternalNode,
  key: number,
  steps: StepSnapshot[]
): SplitResult | null {
  if (node.isLeaf) {
    // Add key to leaf
    node.keys.push(key);
    node.keys.sort((a, b) => a - b);

    if (node.keys.length <= 2) {
      // Leaf was a 2-node, now a 3-node. No split!
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Added ${key} to Leaf (Becomes 3-Node)`,
        subtitle: `Leaf keys: [${node.keys.join(', ')}]`,
        category: 'TREE',
        algorithmName: '2-3 Tree Insertion',
        facultyExplanation: `Leaf was a 2-node with 1 key. Inserting ${key} turns it into a valid 3-node containing [${node.keys.join(', ')}]. No split or promotion needed.`,
        mathematicalDerivation: `\\text{Leaf: } [${node.keys.join(', ')}] \\quad (\\text{Valid 3-node, } \\le 2 \\text{ keys})`,
        examRule: 'Case 1: Adding a key to a 2-node leaf requires NO splitting or promotions.',
        statusBadge: { text: 'Added to 2-Node Leaf', variant: 'success' },
        treeState: convertToTreeNode(node),
        traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
        traceTableRows: collect23Rows(node),
      });
      return null;
    }

    // Leaf overflowed! (3 keys $\to$ temporary 4-node)
    const leftKey = node.keys[0];
    const midKey = node.keys[1];
    const rightKey = node.keys[2];

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Leaf Overflow: Temporary 4-Node [${node.keys.join(', ')}]`,
      subtitle: `Middle key ${midKey} will be promoted; Left: [${leftKey}], Right: [${rightKey}]`,
      category: 'TREE',
      algorithmName: '2-3 Tree Insertion',
      facultyExplanation: `Leaf overflowed with 3 keys: [${node.keys.join(', ')}]. Split leaf into two 2-nodes: Left [${leftKey}] and Right [${rightKey}]. Promote middle key ${midKey} to parent.`,
      mathematicalDerivation: `\\text{Split: } [${leftKey}, ${midKey}, ${rightKey}] \\implies \\text{Promote } ${midKey}, \\; \\text{Left: } [${leftKey}], \\; \\text{Right: } [${rightKey}]`,
      examRule: 'Split Rule: Middle element is ALWAYS promoted. Smallest stays left, largest goes right.',
      statusBadge: { text: 'Leaf Split & Promote', variant: 'warning' },
      treeState: convertToTreeNode(node),
      traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
      traceTableRows: collect23Rows(node),
    });

    return {
      promotedKey: midKey,
      leftChild: create23Node([leftKey], true),
      rightChild: create23Node([rightKey], true),
    };
  }

  // Internal node traversal
  let childIndex = 0;
  if (node.keys.length === 1) {
    childIndex = key < node.keys[0] ? 0 : 1;
  } else {
    if (key < node.keys[0]) childIndex = 0;
    else if (key < node.keys[1]) childIndex = 1;
    else childIndex = 2;
  }

  const childSplit = insert23Internal(node.children[childIndex], key, steps);
  if (!childSplit) return null;

  // Absorb child split into current internal node
  node.keys.push(childSplit.promotedKey);
  node.keys.sort((a, b) => a - b);

  // Replace old child with split left and right children
  node.children.splice(childIndex, 1, childSplit.leftChild, childSplit.rightChild);

  if (node.keys.length <= 2) {
    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Parent Absorbed Promoted Key ${childSplit.promotedKey}`,
      subtitle: `Parent node becomes 3-node [${node.keys.join(', ')}]`,
      category: 'TREE',
      algorithmName: '2-3 Tree Insertion',
      facultyExplanation: `Parent had room (was a 2-node). It absorbed promoted key ${childSplit.promotedKey} and connected the new split children. It is now a valid 3-node with 3 children.`,
      mathematicalDerivation: `\\text{Parent Keys: } [${node.keys.join(', ')}], \\quad \\text{Children Count} = 3`,
      examRule: 'Case 2: If parent is a 2-node, it absorbs the promoted key and no further splits are needed.',
      statusBadge: { text: 'Promotion Absorbed', variant: 'success' },
      treeState: convertToTreeNode(node),
      traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
      traceTableRows: collect23Rows(node),
    });
    return null;
  }

  // Parent also overflowed! (Cascading split)
  const leftKey = node.keys[0];
  const midKey = node.keys[1];
  const rightKey = node.keys[2];

  const leftInternal = create23Node([leftKey], false);
  leftInternal.children = [node.children[0], node.children[1]];

  const rightInternal = create23Node([rightKey], false);
  rightInternal.children = [node.children[2], node.children[3]];

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `Cascading Split: Internal Node Overflows!`,
    subtitle: `Promoting ${midKey} to higher ancestor`,
    category: 'TREE',
    algorithmName: '2-3 Tree Insertion',
    facultyExplanation: `Internal node already had 2 keys and overflowed to [${node.keys.join(', ')}]. Split into left internal node [${leftKey}] (with 2 children) and right internal node [${rightKey}] (with 2 children). Promote ${midKey} upward.`,
    mathematicalDerivation: `\\text{Promote } ${midKey} \\to \\text{Ancestor.} \\quad \\text{Left Subtree: } [${leftKey}], \\; \\text{Right Subtree: } [${rightKey}]`,
    examRule: 'Cascading Split: Continue promoting middle keys until reaching a parent with room or splitting the root.',
    statusBadge: { text: 'Cascading Internal Split', variant: 'danger' },
    treeState: convertToTreeNode(node),
    traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
    traceTableRows: collect23Rows(node),
  });

  return {
    promotedKey: midKey,
    leftChild: leftInternal,
    rightChild: rightInternal,
  };
}

export function generateTwoThreeSearchSteps(treeKeys: number[], searchKey: number): StepSnapshot[] {
  // Construct tree first
  nodeCounter = 1;
  let root: TwoThreeInternalNode | null = null;
  const dummySteps: StepSnapshot[] = [];
  for (const k of treeKeys) {
    if (!root) {
      root = create23Node([k], true);
    } else {
      const split = insert23Internal(root, k, dummySteps);
      if (split) {
        const nr = create23Node([split.promotedKey], false);
        nr.children = [split.leftChild, split.rightChild];
        root = nr;
      }
    }
  }

  const steps: StepSnapshot[] = [];

  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: `Search for Key ${searchKey} in 2-3 Tree`,
    subtitle: `Target Key: ${searchKey}`,
    category: 'TREE',
    algorithmName: '2-3 Tree Search',
    facultyExplanation: `Starting 2-3 tree search for key ${searchKey}. At each node, compare ${searchKey} against the node's sorted keys to choose the Left, Middle, or Right branch.`,
    mathematicalDerivation: `\\text{Search Key } k = ${searchKey}. \\quad \\text{Multi-way branching logic.}`,
    examRule: 'Search Invariant: For 2-node [k1]: left if < k1, right if > k1. For 3-node [k1, k2]: left if < k1, middle if k1 < k < k2, right if > k2.',
    statusBadge: { text: `Searching ${searchKey}`, variant: 'accent' },
    treeState: convertToTreeNode(root),
    traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
    traceTableRows: collect23Rows(root),
  });

  let current: TwoThreeInternalNode | null = root;
  let stepNum = 1;
  let found = false;

  while (current) {
    const keysStr = `[ ${current.keys.join(', ')} ]`;

    // Check if key is present in current node
    if (current.keys.includes(searchKey)) {
      found = true;
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Key ${searchKey} FOUND in Node ${keysStr}!`,
        subtitle: `Comparison matched directly at ${current.isLeaf ? 'Leaf' : 'Internal'} Node`,
        category: 'TREE',
        algorithmName: '2-3 Tree Search',
        facultyExplanation: `Key ${searchKey} matches one of the keys in node ${keysStr}. Search terminates successfully!`,
        mathematicalDerivation: `k = ${searchKey} \\in ${keysStr} \\implies \\mathbf{SUCCESS: Key Found}`,
        examRule: 'Exam Conclusion: Report node containing the key and total comparison count.',
        statusBadge: { text: 'Key Found (Success)', variant: 'success' },
        treeState: convertToTreeNode(root),
        traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
        traceTableRows: collect23Rows(root),
      });
      break;
    }

    if (current.isLeaf) {
      // Reached leaf and not found
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Key ${searchKey} NOT FOUND in Tree`,
        subtitle: `Reached leaf ${keysStr} without matching key`,
        category: 'TREE',
        algorithmName: '2-3 Tree Search',
        facultyExplanation: `Reached leaf node ${keysStr} and search key ${searchKey} is not present. Since leaf has no children, search terminates unsuccessfully.`,
        mathematicalDerivation: `k = ${searchKey} \\notin \\text{Tree} \\implies \\mathbf{FAILURE: Key Not Present}`,
        examRule: 'Exam Conclusion: State that search terminates at leaf without finding the element.',
        statusBadge: { text: 'Key Not Found', variant: 'danger' },
        treeState: convertToTreeNode(root),
        traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
        traceTableRows: collect23Rows(root),
      });
      break;
    }

    // Determine branch to take
    let nextChild: TwoThreeInternalNode | null = null;
    let branchName = '';

    if (current.keys.length === 1) {
      const k1 = current.keys[0];
      if (searchKey < k1) {
        branchName = `Left Branch (< ${k1})`;
        nextChild = current.children[0];
      } else {
        branchName = `Right Branch (> ${k1})`;
        nextChild = current.children[1];
      }
    } else {
      const k1 = current.keys[0];
      const k2 = current.keys[1];
      if (searchKey < k1) {
        branchName = `Left Branch (< ${k1})`;
        nextChild = current.children[0];
      } else if (searchKey < k2) {
        branchName = `Middle Branch (${k1} < ${searchKey} < ${k2})`;
        nextChild = current.children[1];
      } else {
        branchName = `Right Branch (> ${k2})`;
        nextChild = current.children[2];
      }
    }

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Step ${stepNum++}: Inspect Node ${keysStr} $\\to$ Follow ${branchName}`,
      subtitle: `Comparing ${searchKey} against ${keysStr}`,
      category: 'TREE',
      algorithmName: '2-3 Tree Search',
      facultyExplanation: `Comparing search key ${searchKey} against keys in node ${keysStr}. Following ${branchName} to the next level.`,
      mathematicalDerivation: `\\text{Inspect } ${keysStr} \\implies \\text{Traverse } ${branchName}`,
      examRule: 'Exam Step: Explicitly state the branch condition and target child.',
      statusBadge: { text: `Following ${branchName}`, variant: 'accent' },
      treeState: convertToTreeNode(root),
      traceTableHeaders: ['Node Keys', 'Node Category', 'Node Type', 'Depth', 'Status'],
      traceTableRows: collect23Rows(root),
    });

    current = nextChild;
  }

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}
