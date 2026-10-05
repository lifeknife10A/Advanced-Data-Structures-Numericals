import { TreeNode, NodeColor } from '../../types/tree';
import { StepSnapshot, TraceTableRow } from '../../types/animation';

let rbNodeCounter = 1;

interface RBNode {
  id: string;
  key: number;
  color: NodeColor;
  left: RBNode | null;
  right: RBNode | null;
  parent: RBNode | null;
}

function createRBNode(key: number, color: NodeColor = 'RED'): RBNode {
  return {
    id: `rb-${key}-${rbNodeCounter++}`,
    key,
    color,
    left: null,
    right: null,
    parent: null,
  };
}

function convertRBToTreeNode(node: RBNode | null): TreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    key: node.key,
    color: node.color,
    height: 1,
    balanceFactor: 0,
    left: convertRBToTreeNode(node.left),
    right: convertRBToTreeNode(node.right),
    badgeText: node.color,
  };
}

function collectRBRows(root: RBNode | null): TraceTableRow[] {
  const rows: TraceTableRow[] = [];
  function traverse(n: RBNode | null, bh: number) {
    if (!n) return;
    const currentBh = bh + (n.color === 'BLACK' ? 1 : 0);
    traverse(n.left, currentBh);
    rows.push({
      id: `rb-row-${n.key}`,
      cells: [
        n.key,
        n.color,
        n.parent ? n.parent.key : 'ROOT',
        n.left ? n.left.key : 'NIL (B)',
        n.right ? n.right.key : 'NIL (B)',
        currentBh,
      ],
      isHighlighted: n.color === 'RED',
    });
    traverse(n.right, currentBh);
  }
  traverse(root, 0);
  return rows;
}

function rotateLeftRB(root: RBNode, x: RBNode): RBNode {
  const y = x.right!;
  x.right = y.left;
  if (y.left) y.left.parent = x;

  y.parent = x.parent;
  if (!x.parent) {
    root = y;
  } else if (x === x.parent.left) {
    x.parent.left = y;
  } else {
    x.parent.right = y;
  }

  y.left = x;
  x.parent = y;
  return root;
}

function rotateRightRB(root: RBNode, y: RBNode): RBNode {
  const x = y.left!;
  y.left = x.right;
  if (x.right) x.right.parent = y;

  x.parent = y.parent;
  if (!y.parent) {
    root = x;
  } else if (y === y.parent.right) {
    y.parent.right = x;
  } else {
    y.parent.left = x;
  }

  x.right = y;
  y.parent = x;
  return root;
}

export function generateRedBlackInsertionSteps(keys: number[]): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  rbNodeCounter = 1;
  let root: RBNode | null = null;

  steps.push({
    stepIndex: 0,
    totalSteps: 0,
    title: 'Initial State: Empty Red-Black Tree',
    subtitle: `Preparing to insert sequence: [${keys.join(', ')}]`,
    category: 'TREE',
    algorithmName: 'Red-Black Tree Insertion',
    facultyExplanation: 'Red-Black Tree Properties:\n1. Every node is RED or BLACK.\n2. Root is always BLACK.\n3. All NIL leaves are BLACK.\n4. If a node is RED, both children must be BLACK (No consecutive REDs).\n5. Every simple path from a node to descendant leaves contains the same number of BLACK nodes (Black-Height).',
    mathematicalDerivation: '\\forall u \\in T, \\; \\text{color}(u) \\in \\{\\text{RED}, \\text{BLACK}\\}, \\quad \\text{Root is BLACK}, \\quad BH(u) \\text{ is uniform.}',
    examRule: 'Core Principle: Newly inserted nodes are ALWAYS colored RED initially.',
    statusBadge: { text: 'Empty RB Tree', variant: 'normal' },
    treeState: null,
    traceTableHeaders: ['Key', 'Color', 'Parent', 'Left Child', 'Right Child', 'Black-Height'],
    traceTableRows: [],
  });

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const newNode = createRBNode(key, 'RED');

    // Standard BST Insert
    let parent: RBNode | null = null;
    let curr: RBNode | null = root;

    while (curr) {
      parent = curr;
      if (key < curr.key) curr = curr.left;
      else if (key > curr.key) curr = curr.right;
      else break; // duplicate
    }

    newNode.parent = parent;

    if (!parent) {
      root = newNode;
    } else if (key < parent.key) {
      parent.left = newNode;
    } else {
      parent.right = newNode;
    }

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Step ${i + 1}.1: Insert Key ${key} as RED Node`,
      subtitle: `Attached as RED child of ${parent ? parent.key : 'Root'}`,
      category: 'TREE',
      algorithmName: 'Red-Black Tree Insertion',
      facultyExplanation: `Inserted key ${key} as a RED node following standard BST ordering. Now verifying if parent is RED (which triggers a Red-Red conflict).`,
      mathematicalDerivation: `\\text{Insert } ${key} \\text{ (RED)} \\implies \\text{Check } P(${key}) = ${parent ? parent.key : '\\emptyset'}`,
      examRule: 'Insertion Step: Insert as RED node to preserve black-height on all existing paths.',
      statusBadge: { text: `Inserted ${key} (RED)`, variant: 'accent' },
      treeState: convertRBToTreeNode(root),
      traceTableHeaders: ['Key', 'Color', 'Parent', 'Left Child', 'Right Child', 'Black-Height'],
      traceTableRows: collectRBRows(root),
    });

    // Fix Red-Black Violations
    if (root) {
      root = fixRedBlackInsert(root, newNode, steps);
    }
  }

  // Final Tree Snapshot
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: 'Red-Black Construction Complete',
    subtitle: `All ${keys.length} keys inserted. All RB properties hold.`,
    category: 'TREE',
    algorithmName: 'Red-Black Tree Insertion',
    facultyExplanation: `Construction finished for [${keys.join(', ')}]. The root is BLACK, no consecutive RED nodes exist, and all leaf paths have equal black-height.`,
    mathematicalDerivation: '\\text{All 5 Red-Black Invariants Satisfied.}',
    examRule: 'Final exam step: Confirm root is BLACK and annotate each node with its color (R/B).',
    statusBadge: { text: 'Valid Red-Black Tree', variant: 'success' },
    treeState: convertRBToTreeNode(root),
    traceTableHeaders: ['Key', 'Color', 'Parent', 'Left Child', 'Right Child', 'Black-Height'],
    traceTableRows: collectRBRows(root),
  });

  steps.forEach((s) => (s.totalSteps = steps.length));
  return steps;
}

function fixRedBlackInsert(root: RBNode, z: RBNode, steps: StepSnapshot[]): RBNode {
  let curr: RBNode = z;

  while (curr.parent && curr.parent.color === 'RED') {
    const parent = curr.parent;
    const grandparent = parent.parent;
    if (!grandparent) break;

    // Parent is LEFT child of Grandparent
    if (parent === grandparent.left) {
      const uncle = grandparent.right;

      // Case 1: Uncle is RED $\to$ Recolor
      if (uncle && uncle.color === 'RED') {
        parent.color = 'BLACK';
        uncle.color = 'BLACK';
        grandparent.color = 'RED';

        steps.push({
          stepIndex: steps.length,
          totalSteps: 0,
          title: `Case 1: Uncle ${uncle.key} is RED $\\implies$ Recolor`,
          subtitle: `Parent ${parent.key} & Uncle ${uncle.key} $\\to$ BLACK, Grandparent ${grandparent.key} $\\to$ RED`,
          category: 'TREE',
          algorithmName: 'Red-Black Tree Insertion',
          facultyExplanation: `Conflict at node ${curr.key}: Parent ${parent.key} is RED and Uncle ${uncle.key} is RED (Case 1).\nAction: Recolor Parent and Uncle to BLACK, and Grandparent ${grandparent.key} to RED. Move check up to Grandparent.`,
          mathematicalDerivation: `\\text{Case 1: } P(${parent.key}) \\to \\text{BLACK}, \\; U(${uncle.key}) \\to \\text{BLACK}, \\; G(${grandparent.key}) \\to \\text{RED}`,
          examRule: 'Case 1 Rule: When uncle is RED, only recoloring is needed (no rotations).',
          statusBadge: { text: 'Case 1: Recolor', variant: 'warning' },
          treeState: convertRBToTreeNode(root),
          traceTableHeaders: ['Key', 'Color', 'Parent', 'Left Child', 'Right Child', 'Black-Height'],
          traceTableRows: collectRBRows(root),
        });

        curr = grandparent;
      } else {
        // Case 2: Uncle is BLACK, Triangle (Left-Right)
        if (curr === parent.right) {
          curr = parent;
          root = rotateLeftRB(root, curr);

          steps.push({
            stepIndex: steps.length,
            totalSteps: 0,
            title: `Case 2: Uncle is BLACK (Triangle) $\\implies$ Left Rotate on ${curr.key}`,
            subtitle: `Transforming triangle configuration into a line (Case 3)`,
            category: 'TREE',
            algorithmName: 'Red-Black Tree Insertion',
            facultyExplanation: `Node ${curr.key} is right child of left child ${parent.key} (Triangle shape). Left rotate on Parent ${parent.key} to align into a straight line.`,
            mathematicalDerivation: `\\text{Case 2: } \\text{RotateLeft}(P = ${parent.key}) \\implies \\text{Transforms into Case 3}`,
            examRule: 'Case 2 Rule: Rotate child around parent to form a straight line.',
            statusBadge: { text: 'Case 2: Rotate Left', variant: 'warning' },
            treeState: convertRBToTreeNode(root),
            traceTableHeaders: ['Key', 'Color', 'Parent', 'Left Child', 'Right Child', 'Black-Height'],
            traceTableRows: collectRBRows(root),
          });
        }

        // Case 3: Uncle is BLACK, Line (Left-Left)
        if (curr.parent) {
          curr.parent.color = 'BLACK';
          if (curr.parent.parent) {
            curr.parent.parent.color = 'RED';
            root = rotateRightRB(root, curr.parent.parent);

            steps.push({
              stepIndex: steps.length,
              totalSteps: 0,
              title: `Case 3: Uncle is BLACK (Line) $\\implies$ Right Rotate on Grandparent`,
              subtitle: `Parent $\\to$ BLACK, Grandparent $\\to$ RED, Right Rotate`,
              category: 'TREE',
              algorithmName: 'Red-Black Tree Insertion',
              facultyExplanation: `Node ${curr.key} is in a straight line with Parent and Grandparent (Case 3).\nAction: Recolor Parent to BLACK, Grandparent to RED, and perform a Right Rotation on Grandparent.`,
              mathematicalDerivation: `\\text{Case 3: } P \\to \\text{BLACK}, \\; G \\to \\text{RED}, \\; \\text{RotateRight}(G)`,
              examRule: 'Case 3 Rule: Swap colors of Parent and Grandparent, then rotate parent around grandparent.',
              statusBadge: { text: 'Case 3: Rotate & Recolor', variant: 'danger' },
              treeState: convertRBToTreeNode(root),
              traceTableHeaders: ['Key', 'Color', 'Parent', 'Left Child', 'Right Child', 'Black-Height'],
              traceTableRows: collectRBRows(root),
            });
          }
        }
      }
    }
    // Parent is RIGHT child of Grandparent
    else {
      const uncle = grandparent.left;

      // Case 1: Uncle is RED $\to$ Recolor
      if (uncle && uncle.color === 'RED') {
        parent.color = 'BLACK';
        uncle.color = 'BLACK';
        grandparent.color = 'RED';

        steps.push({
          stepIndex: steps.length,
          totalSteps: 0,
          title: `Case 1: Uncle ${uncle.key} is RED $\\implies$ Recolor`,
          subtitle: `Parent ${parent.key} & Uncle ${uncle.key} $\\to$ BLACK, Grandparent ${grandparent.key} $\\to$ RED`,
          category: 'TREE',
          algorithmName: 'Red-Black Tree Insertion',
          facultyExplanation: `Conflict at node ${curr.key}: Parent ${parent.key} is RED and Uncle ${uncle.key} is RED (Case 1).\nAction: Recolor Parent and Uncle to BLACK, and Grandparent ${grandparent.key} to RED.`,
          mathematicalDerivation: `\\text{Case 1: } P(${parent.key}) \\to \\text{BLACK}, \\; U(${uncle.key}) \\to \\text{BLACK}, \\; G(${grandparent.key}) \\to \\text{RED}`,
          examRule: 'Case 1 Rule: When uncle is RED, only recoloring is needed (no rotations).',
          statusBadge: { text: 'Case 1: Recolor', variant: 'warning' },
          treeState: convertRBToTreeNode(root),
          traceTableHeaders: ['Key', 'Color', 'Parent', 'Left Child', 'Right Child', 'Black-Height'],
          traceTableRows: collectRBRows(root),
        });

        curr = grandparent;
      } else {
        // Case 2: Uncle is BLACK, Triangle (Right-Left)
        if (curr === parent.left) {
          curr = parent;
          root = rotateRightRB(root, curr);

          steps.push({
            stepIndex: steps.length,
            totalSteps: 0,
            title: `Case 2: Uncle is BLACK (Triangle) $\\implies$ Right Rotate on ${curr.key}`,
            subtitle: `Transforming triangle configuration into a line (Case 3)`,
            category: 'TREE',
            algorithmName: 'Red-Black Tree Insertion',
            facultyExplanation: `Node ${curr.key} is left child of right child ${parent.key} (Triangle shape). Right rotate on Parent ${parent.key} to align into a straight line.`,
            mathematicalDerivation: `\\text{Case 2: } \\text{RotateRight}(P = ${parent.key}) \\implies \\text{Transforms into Case 3}`,
            examRule: 'Case 2 Rule: Rotate child around parent to form a straight line.',
            statusBadge: { text: 'Case 2: Rotate Right', variant: 'warning' },
            treeState: convertRBToTreeNode(root),
            traceTableHeaders: ['Key', 'Color', 'Parent', 'Left Child', 'Right Child', 'Black-Height'],
            traceTableRows: collectRBRows(root),
          });
        }

        // Case 3: Uncle is BLACK, Line (Right-Right)
        if (curr.parent) {
          curr.parent.color = 'BLACK';
          if (curr.parent.parent) {
            curr.parent.parent.color = 'RED';
            root = rotateLeftRB(root, curr.parent.parent);

            steps.push({
              stepIndex: steps.length,
              totalSteps: 0,
              title: `Case 3: Uncle is BLACK (Line) $\\implies$ Left Rotate on Grandparent`,
              subtitle: `Parent $\\to$ BLACK, Grandparent $\\to$ RED, Left Rotate`,
              category: 'TREE',
              algorithmName: 'Red-Black Tree Insertion',
              facultyExplanation: `Node ${curr.key} is in a straight line with Parent and Grandparent (Case 3).\nAction: Recolor Parent to BLACK, Grandparent to RED, and perform a Left Rotation on Grandparent.`,
              mathematicalDerivation: `\\text{Case 3: } P \\to \\text{BLACK}, \\; G \\to \\text{RED}, \\; \\text{RotateLeft}(G)`,
              examRule: 'Case 3 Rule: Swap colors of Parent and Grandparent, then rotate parent around grandparent.',
              statusBadge: { text: 'Case 3: Rotate & Recolor', variant: 'danger' },
              treeState: convertRBToTreeNode(root),
              traceTableHeaders: ['Key', 'Color', 'Parent', 'Left Child', 'Right Child', 'Black-Height'],
              traceTableRows: collectRBRows(root),
            });
          }
        }
      }
    }
  }

  // Root is always BLACK
  if (root.color !== 'BLACK') {
    root.color = 'BLACK';
    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: 'Root Recolor to BLACK',
      subtitle: 'Enforcing Root Property (Root is always BLACK)',
      category: 'TREE',
      algorithmName: 'Red-Black Tree Insertion',
      facultyExplanation: 'The root of a Red-Black tree must always be BLACK. Recolor the root node to BLACK.',
      mathematicalDerivation: '\\text{color}(\\text{Root}) = \\text{BLACK}',
      examRule: 'Root Invariant: Always finish by setting the root color to BLACK.',
      statusBadge: { text: 'Root Set to BLACK', variant: 'normal' },
      treeState: convertRBToTreeNode(root),
      traceTableHeaders: ['Key', 'Color', 'Parent', 'Left Child', 'Right Child', 'Black-Height'],
      traceTableRows: collectRBRows(root),
    });
  }

  return root;
}
