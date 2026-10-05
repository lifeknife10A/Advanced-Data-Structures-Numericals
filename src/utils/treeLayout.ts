import { TreeNode } from '../types/tree';

/**
 * Calculates (x, y) coordinates for binary and multi-way search trees (including 2-3 Trees)
 * Uses an in-order x-coordinate layout combined with level-based y-coordinates,
 * followed by subtree centering.
 */
export function layoutTree(
  root: TreeNode | null | undefined,
  canvasWidth: number = 1000,
  canvasHeight: number = 580,
  isTwoThree: boolean = false
): TreeNode | null {
  if (!root) return null;

  // Deep clone to prevent mutating internal engine structures
  const clonedRoot: TreeNode = JSON.parse(JSON.stringify(root));

  if (isTwoThree) {
    layoutTwoThreeTree(clonedRoot, canvasWidth, canvasHeight);
    return clonedRoot;
  }

  // Find max tree depth
  function getMaxDepth(n: TreeNode | null | undefined): number {
    if (!n) return 0;
    return 1 + Math.max(getMaxDepth(n.left), getMaxDepth(n.right));
  }

  const maxDepth = getMaxDepth(clonedRoot);
  const topPadding = 75;
  const availableHeight = canvasHeight - topPadding - 80;
  const levelGapY = Math.min(Math.max(availableHeight / Math.max(maxDepth, 1), 75), 110);

  // Binary tree layout: In-order traversal assigns x-coordinate increments
  let currentX = 0;

  function setCoordinates(node: TreeNode, depth: number) {
    if (node.left) {
      setCoordinates(node.left, depth + 1);
    }

    node.x = currentX;
    currentX += 1;
    node.y = topPadding + depth * levelGapY;

    if (node.right) {
      setCoordinates(node.right, depth + 1);
    }
  }

  setCoordinates(clonedRoot, 0);

  // Normalize and scale X coordinates to fit canvas
  const totalSlots = Math.max(currentX - 1, 1);
  const marginX = 100;
  const availableWidth = Math.max(canvasWidth - marginX * 2, 260);

  function scaleTree(node: TreeNode) {
    if (node.x !== undefined) {
      node.x = marginX + (node.x / totalSlots) * availableWidth;
    }
    if (node.left) scaleTree(node.left);
    if (node.right) scaleTree(node.right);
  }

  scaleTree(clonedRoot);
  return clonedRoot;
}

/**
 * Custom layout for 2-3 Trees (multi-way nodes with left, middle, right children)
 */
function layoutTwoThreeTree(root: TreeNode, canvasWidth: number, canvasHeight: number) {
  const levelGapY = 110;
  const topPadding = 80;

  // Compute subtree widths
  function computeWidth(node: TreeNode): number {
    const isLeaf = !node.left && !node.middle && !node.right;
    if (isLeaf) return 1;

    let width = 0;
    if (node.left) width += computeWidth(node.left);
    if (node.middle) width += computeWidth(node.middle);
    if (node.right) width += computeWidth(node.right);
    return Math.max(width, 1);
  }

  function assignPositions(
    node: TreeNode,
    leftBound: number,
    rightBound: number,
    depth: number
  ) {
    node.x = (leftBound + rightBound) / 2;
    node.y = topPadding + depth * levelGapY;

    const children: TreeNode[] = [];
    if (node.left) children.push(node.left);
    if (node.middle) children.push(node.middle);
    if (node.right) children.push(node.right);

    if (children.length === 0) return;

    const totalWeight = children.reduce((sum, child) => sum + computeWidth(child), 0);
    let currentLeft = leftBound;
    const span = rightBound - leftBound;

    children.forEach((child) => {
      const childWeight = computeWidth(child);
      const childSpan = (childWeight / totalWeight) * span;
      const childRight = currentLeft + childSpan;
      assignPositions(child, currentLeft, childRight, depth + 1);
      currentLeft = childRight;
    });
  }

  const marginX = 80;
  assignPositions(root, marginX, canvasWidth - marginX, 0);
}
