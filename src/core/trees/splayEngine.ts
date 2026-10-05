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
 * If key is not present, splays the last accessed node to root.
 * Records step snapshots for every Zig, Zig-Zig, and Zig-Zag rotation.
 */
function splayAndRecord(
  root: TreeNode | null | undefined,
  key: number,
  steps: StepSnapshot[],
  operationName: string
): TreeNode | null {
  if (!root || root.key === key) return root || null;

  // Key lies in Left Subtree
  if (key < root.key) {
    if (!root.left) return root; // Key not present, root.left is empty

    // Case 1: Zig-Zig (Left-Left)
    if (key < root.left.key) {
      if (root.left.left) {
        root.left.left = splayAndRecord(root.left.left, key, steps, operationName);
      }
      
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Zig-Zig (Left-Left) Splay at Grandparent ${root.key}`,
        subtitle: `Node ${key} and parent ${root.left.key} are both left children`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Target node is in the Left-Left position relative to grandparent ${root.key}. For Zig-Zig, rotate Grandparent ${root.key} Right FIRST, then rotate Parent ${root.left.key} Right.`,
        mathematicalDerivation: `\\text{Zig-Zig: } \\text{RotateRight}(G = ${root.key}) \\to \\text{RotateRight}(P = ${root.left.key})`,
        examRule: 'Zig-Zig Rule: ALWAYS rotate grandparent first, then parent. (Rotating parent first is a classic exam error!)',
        statusBadge: { text: 'Zig-Zig Rotation', variant: 'warning' },
        treeState: cloneSplayTree(root),
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      root = rightRotate(root);
    }
    // Case 2: Zig-Zag (Left-Right)
    else if (key > root.left.key) {
      if (root.left.right) {
        root.left.right = splayAndRecord(root.left.right, key, steps, operationName);
      }

      if (root.left.right) {
        steps.push({
          stepIndex: steps.length,
          totalSteps: 0,
          title: `Zig-Zag (Left-Right) Splay: Rotate Parent ${root.left.key} Left`,
          subtitle: `Node ${key} is right child of left child ${root.left.key}`,
          category: 'TREE',
          algorithmName: `Splay Tree ${operationName}`,
          facultyExplanation: `Target is in Left-Right position (Zig-Zag). First rotate Parent ${root.left.key} Left, then rotate Grandparent ${root.key} Right.`,
          mathematicalDerivation: `\\text{Zig-Zag: } \\text{RotateLeft}(P = ${root.left.key}) \\to \\text{RotateRight}(G = ${root.key})`,
          examRule: 'Zig-Zag Rule: Rotate parent first, then grandparent (identical to AVL double rotation).',
          statusBadge: { text: 'Zig-Zag (Step 1)', variant: 'warning' },
          treeState: cloneSplayTree(root),
          traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
          traceTableRows: collectSplayRows(root),
        });

        root.left = leftRotate(root.left);
      }
    }

    if (!root.left) return root;

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Zig (Right Rotate on Root ${root.key})`,
      subtitle: `Bringing node to the root`,
      category: 'TREE',
      algorithmName: `Splay Tree ${operationName}`,
      facultyExplanation: `Target node is now the immediate left child of root ${root.key}. Perform a single Right Rotation (Zig) to bring it to the root.`,
      mathematicalDerivation: `\\text{Zig: } \\text{RotateRight}(\\text{Root } = ${root.key})`,
      examRule: 'Zig Rule: Single rotation applied when target parent is the root.',
      statusBadge: { text: 'Zig (Right Rotate)', variant: 'accent' },
      treeState: cloneSplayTree(root),
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
        root.right.left = splayAndRecord(root.right.left, key, steps, operationName);
      }

      if (root.right.left) {
        steps.push({
          stepIndex: steps.length,
          totalSteps: 0,
          title: `Zag-Zig (Right-Left) Splay: Rotate Parent ${root.right.key} Right`,
          subtitle: `Node ${key} is left child of right child ${root.right.key}`,
          category: 'TREE',
          algorithmName: `Splay Tree ${operationName}`,
          facultyExplanation: `Target is in Right-Left position (Zag-Zig). First rotate Parent ${root.right.key} Right, then rotate Grandparent ${root.key} Left.`,
          mathematicalDerivation: `\\text{Zag-Zig: } \\text{RotateRight}(P = ${root.right.key}) \\to \\text{RotateLeft}(G = ${root.key})`,
          examRule: 'Zag-Zig Rule: Rotate parent right, then grandparent left.',
          statusBadge: { text: 'Zag-Zig (Step 1)', variant: 'warning' },
          treeState: cloneSplayTree(root),
          traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
          traceTableRows: collectSplayRows(root),
        });

        root.right = rightRotate(root.right);
      }
    }
    // Case 4: Zag-Zag (Right-Right)
    else if (key > root.right.key) {
      if (root.right.right) {
        root.right.right = splayAndRecord(root.right.right, key, steps, operationName);
      }

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Zag-Zag (Right-Right) Splay at Grandparent ${root.key}`,
        subtitle: `Node ${key} and parent ${root.right.key} are both right children`,
        category: 'TREE',
        algorithmName: `Splay Tree ${operationName}`,
        facultyExplanation: `Target is in Right-Right position (Zag-Zag). Rotate Grandparent ${root.key} Left FIRST, then rotate Parent ${root.right.key} Left.`,
        mathematicalDerivation: `\\text{Zag-Zag: } \\text{RotateLeft}(G = ${root.key}) \\to \\text{RotateLeft}(P = ${root.right.key})`,
        examRule: 'Zag-Zag Rule: Rotate grandparent first, then parent.',
        statusBadge: { text: 'Zag-Zag Rotation', variant: 'warning' },
        treeState: cloneSplayTree(root),
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });

      root = leftRotate(root);
    }

    if (!root.right) return root;

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Zag (Left Rotate on Root ${root.key})`,
      subtitle: `Bringing node to the root`,
      category: 'TREE',
      algorithmName: `Splay Tree ${operationName}`,
      facultyExplanation: `Target node is now the immediate right child of root ${root.key}. Perform a single Left Rotation (Zag) to bring it to the root.`,
      mathematicalDerivation: `\\text{Zag: } \\text{RotateLeft}(\\text{Root } = ${root.key})`,
      examRule: 'Zag Rule: Single left rotation applied when target parent is the root.',
      statusBadge: { text: 'Zag (Left Rotate)', variant: 'accent' },
      treeState: cloneSplayTree(root),
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
        title: `Insert First Key ${key} as Root`,
        subtitle: `Root node created with key ${key}`,
        category: 'TREE',
        algorithmName: 'Splay Tree Insertion',
        facultyExplanation: `First key ${key} inserted directly as root.`,
        mathematicalDerivation: `\\text{Root} = ${key}`,
        examRule: 'Initial key becomes root.',
        statusBadge: { text: `Root = ${key}`, variant: 'success' },
        treeState: cloneSplayTree(root),
        traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
        traceTableRows: collectSplayRows(root),
      });
      continue;
    }

    // Step 1: Splay tree around key
    root = splayAndRecord(root, key, steps, 'Insertion');

    // Step 2: Allocate new node and attach
    const newNode = createSplayNode(key);
    if (key < root!.key) {
      newNode.right = root;
      newNode.left = root!.left || null;
      root!.left = null;
    } else {
      newNode.left = root;
      newNode.right = root!.right || null;
      root!.right = null;
    }
    root = newNode;

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Key ${key} Inserted and Installed as New Root`,
      subtitle: `Splay tree restructured around ${key}`,
      category: 'TREE',
      algorithmName: 'Splay Tree Insertion',
      facultyExplanation: `Key ${key} has been inserted. The previous tree was split around ${key}, and ${key} becomes the new root with former subtrees properly attached.`,
      mathematicalDerivation: `\\text{New Root} = ${key}, \\; \\text{Left} < ${key}, \\; \\text{Right} > ${key}`,
      examRule: 'Post-insertion check: Verify newly inserted node is at the root and BST ordering holds.',
      statusBadge: { text: `Root = ${key}`, variant: 'success' },
      treeState: cloneSplayTree(root),
      traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
      traceTableRows: collectSplayRows(root),
    });
  }

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}

export function generateSplaySearchSteps(treeKeys: number[], searchKey: number): StepSnapshot[] {
  // Construct initial splay tree
  splayNodeId = 1;
  let root: TreeNode | null = null;
  const dummySteps: StepSnapshot[] = [];
  for (const k of treeKeys) {
    if (!root) {
      root = createSplayNode(k);
    } else {
      root = splayAndRecord(root, k, dummySteps, 'Insertion');
      const newNode = createSplayNode(k);
      if (k < root!.key) {
        newNode.right = root;
        newNode.left = root!.left || null;
        root!.left = null;
      } else {
        newNode.left = root;
        newNode.right = root!.right || null;
        root!.right = null;
      }
      root = newNode;
    }
  }

  const steps: StepSnapshot[] = [];

  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: `Search for Key ${searchKey} in Splay Tree`,
    subtitle: `Target Key: ${searchKey}`,
    category: 'TREE',
    algorithmName: 'Splay Tree Search',
    facultyExplanation: `Searching for key ${searchKey}. Splay tree property dictates that searching for a key will splay either that key (if found) or the last accessed non-null node (if not found) to the root.`,
    mathematicalDerivation: `\\text{Search}(${searchKey}) \\implies \\text{Splay Target / Last Accessed Node to Root}`,
    examRule: 'Search Invariant: Whether the search is SUCCESSFUL or UNSUCCESSFUL, the tree MUST be splayed to bring the accessed node to the root!',
    statusBadge: { text: `Searching ${searchKey}`, variant: 'accent' },
    treeState: cloneSplayTree(root),
    traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
    traceTableRows: collectSplayRows(root),
  });

  root = splayAndRecord(root, searchKey, steps, 'Search');

  const isFound = root?.key === searchKey;

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: isFound ? `Key ${searchKey} FOUND and Splayed to Root!` : `Key ${searchKey} NOT FOUND (Last Accessed Node ${root?.key} Splayed to Root)`,
    subtitle: isFound ? `Search succeeded. Root is now ${searchKey}` : `Search failed. Closest ancestor ${root?.key} is now Root`,
    category: 'TREE',
    algorithmName: 'Splay Tree Search',
    facultyExplanation: isFound
      ? `Key ${searchKey} was found in the tree and splayed to the root through a series of rotations.`
      : `Key ${searchKey} is not present in the tree. The last non-null node accessed during the search (${root?.key}) was splayed to the root.`,
    mathematicalDerivation: isFound
      ? `\\text{Root} = ${searchKey} \\quad (\\mathbf{Found})`
      : `\\text{Root} = ${root?.key} \\quad (\\mathbf{Not Found, Last Accessed Node})`,
    examRule: 'Exam Conclusion: Always redraw the final tree with the accessed element at the root.',
    statusBadge: { text: isFound ? 'Key Found (At Root)' : 'Key Not Found (At Root)', variant: isFound ? 'success' : 'danger' },
    treeState: cloneSplayTree(root),
    traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
    traceTableRows: collectSplayRows(root),
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}

export function generateSplayDeletionSteps(treeKeys: number[], deleteKey: number): StepSnapshot[] {
  // Construct tree
  splayNodeId = 1;
  let root: TreeNode | null = null;
  const dummySteps: StepSnapshot[] = [];
  for (const k of treeKeys) {
    if (!root) {
      root = createSplayNode(k);
    } else {
      root = splayAndRecord(root, k, dummySteps, 'Insertion');
      const newNode = createSplayNode(k);
      if (k < root!.key) {
        newNode.right = root;
        newNode.left = root!.left || null;
        root!.left = null;
      } else {
        newNode.left = root;
        newNode.right = root!.right || null;
        root!.right = null;
      }
      root = newNode;
    }
  }

  const steps: StepSnapshot[] = [];

  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: `Bottom-Up Splay Deletion of Key ${deleteKey}`,
    subtitle: `Initial tree before deletion`,
    category: 'TREE',
    algorithmName: 'Splay Tree Deletion',
    facultyExplanation: `Bottom-Up Splay Deletion Protocol:\n1. Splay target key ${deleteKey} to the root.\n2. Delete root ${deleteKey}, disconnecting Left Subtree (L) and Right Subtree (R).\n3. Splay the MAXIMUM element in L to the root of L (which will have no right child).\n4. Attach R as the right child of L's root.`,
    mathematicalDerivation: `\\text{Protocol: } \\text{Splay}(${deleteKey}) \\to \\text{Split}(L, R) \\to \\text{SplayMax}(L) \\to \\text{Attach}(R)`,
    examRule: 'Exam Deletion Rule: Remember to splay the max of the left subtree before attaching the right subtree.',
    statusBadge: { text: `Target = ${deleteKey}`, variant: 'normal' },
    treeState: cloneSplayTree(root),
    traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
    traceTableRows: collectSplayRows(root),
  });

  // Step 1: Splay target to root
  root = splayAndRecord(root, deleteKey, steps, 'Deletion');

  if (!root || root.key !== deleteKey) {
    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Key ${deleteKey} Not Found in Tree`,
      subtitle: `Cannot delete non-existent key`,
      category: 'TREE',
      algorithmName: 'Splay Tree Deletion',
      facultyExplanation: `Key ${deleteKey} does not exist in the tree. Deletion aborted.`,
      mathematicalDerivation: `${deleteKey} \\notin T`,
      examRule: 'Key not found.',
      statusBadge: { text: 'Key Not Found', variant: 'danger' },
      treeState: cloneSplayTree(root),
      traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
      traceTableRows: collectSplayRows(root),
    });
    steps.forEach((s) => (s.totalSteps = steps.length));
    return steps;
  }

  // Step 2: Sever root into L and R
  const L = root.left || null;
  const R = root.right || null;

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: `Step 2: Sever Root ${deleteKey} into Subtrees L and R`,
    subtitle: `Left Subtree (L) and Right Subtree (R) disconnected`,
    category: 'TREE',
    algorithmName: 'Splay Tree Deletion',
    facultyExplanation: `Removed root node ${deleteKey}. We now have two disjoint subtrees: Left Subtree L and Right Subtree R.`,
    mathematicalDerivation: `T \\setminus \\{${deleteKey}\\} = L \\cup R`,
    examRule: 'Sever step: Node removed at root, splitting into two independent binary trees.',
    statusBadge: { text: 'Root Severed', variant: 'warning' },
    treeState: cloneSplayTree(L || R),
    traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
    traceTableRows: collectSplayRows(L || R),
  });

  if (!L) {
    root = R;
  } else {
    // Step 3: Splay max in L to root of L
    let maxInL = L;
    while (maxInL.right) {
      maxInL = maxInL.right;
    }
    const maxKey = maxInL.key;

    const splayedL = splayAndRecord(L, maxKey, steps, 'Deletion Join');
    if (splayedL) {
      splayedL.right = R;
      root = splayedL;
    }

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Step 3: Joined Subtrees (Max of L is New Root)`,
      subtitle: `Splayed max key ${maxKey} to root of L and attached R to its right child`,
      category: 'TREE',
      algorithmName: 'Splay Tree Deletion',
      facultyExplanation: `Splayed the maximum key ${maxKey} in Left Subtree L to its root. Since ${maxKey} is the maximum in L, its right child was empty. Attached Right Subtree R as its right child.`,
      mathematicalDerivation: `\\text{Root} = ${maxKey}, \\; \\text{Left} = L', \\; \\text{Right} = R`,
      examRule: 'Final exam step: Verify that root has no elements larger than it in its left subtree and all elements in right subtree are larger.',
      statusBadge: { text: 'Deletion Complete', variant: 'success' },
      treeState: cloneSplayTree(root),
      traceTableHeaders: ['Key', 'Depth', 'Left Child', 'Right Child', 'Role'],
      traceTableRows: collectSplayRows(root),
    });
  }

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}
