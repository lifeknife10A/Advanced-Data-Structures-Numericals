# Advanced Data Structures Numericals
### *University Exam & Step-by-Step Mathematical Derivation Platform*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-lifeknife10a.github.io-8C2D19?style=for-the-badge&logo=githubpages&logoColor=white)](https://lifeknife10a.github.io/Advanced-Data-Structures-Numericals/)

[![React 19](https://img.shields.io/badge/React-19.2.8-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC.svg)](https://tailwindcss.com/)
[![KaTeX](https://img.shields.io/badge/KaTeX-0.19.0-3775A9.svg)](https://katex.org/)
[![pnpm](https://img.shields.io/badge/Maintained%20with-pnpm-F69220.svg)](https://pnpm.io/)
[![Design](https://img.shields.io/badge/Aesthetic-Champagne%20Editorial%20Academic-C4B59D.svg)]()
[![Playwright Verified](https://img.shields.io/badge/Playwright-100%25%20Passing-2EAD33.svg)]()

> 🌐 **Live Web Application**: [https://lifeknife10a.github.io/Advanced-Data-Structures-Numericals/](https://lifeknife10a.github.io/Advanced-Data-Structures-Numericals/)

---

## 📖 Table of Contents
1. [Executive Overview & Vision](#executive-overview--vision)
2. [Design Philosophy — Champagne Editorial Academic](#design-philosophy--champagne-editorial-academic)
3. [Key Platform Capabilities](#key-platform-capabilities)
4. [Exhaustive Algorithmic Theory & Derivations](#exhaustive-algorithmic-theory--derivations)
   - [1. AVL Trees (Adelson-Velsky & Landis)](#1-avl-trees-adelson-velsky--landis)
   - [2. 2-3 Search Trees (B-Tree Order 3)](#2-2-3-search-trees-b-tree-order-3)
   - [3. Splay Trees (Self-Adjusting BST)](#3-splay-trees-self-adjusting-bst)
   - [4. Red-Black Trees (Symmetric Binary B-Trees)](#4-red-black-trees-symmetric-binary-b-trees)
   - [5. Breadth-First Search (BFS)](#5-breadth-first-search-bfs)
   - [6. Depth-First Search (DFS)](#6-depth-first-search-dfs)
   - [7. Dijkstra's Single-Source Shortest Path](#7-dijkstras-single-source-shortest-path)
   - [8. Kruskal's Minimum Spanning Tree (MST)](#8-kruskals-minimum-spanning-tree-mst)
   - [9. Prim's Minimum Spanning Tree (MST)](#9-prims-minimum-spanning-tree-mst)
   - [10. Topological Sorting (Kahn's BFS & Vertex Removal)](#10-topological-sorting-kahns-bfs--vertex-removal)
5. [System Architecture & Codebase Tour](#system-architecture--codebase-tour)
6. [Interactive Controls & Faculty Drawer Guide](#interactive-controls--faculty-drawer-guide)
7. [Installation & Local Development](#installation--local-development)
8. [University Exam Rubric & Answer-Sheet Formatting](#university-exam-rubric--answer-sheet-formatting)
9. [License](#license)

---

## Executive Overview & Vision

In university-level computer science curricula, **Advanced Data Structures and Graph Algorithms** form the bedrock of algorithmic mastery. However, standard computer science textbooks and generic visualizer websites fall short in one critical dimension: **exam-grade numerical derivation traces**.

Students taking university examinations are not simply asked to draw the final tree or graph. They are evaluated on **intermediate state correctness**:
- Balance factor calculations ($\text{BF}(u) = h_L - h_R$) after every single insertion or deletion.
- Exact rotation classifications ($\text{LL}, \text{RR}, \text{LR}, \text{RL}$) with pivot identification.
- Uncle recoloring vs. tri-node restructuring cases in Red-Black Trees.
- Temporary 4-node split-and-promote sequences in 2-3 Trees.
- Potential-driven zig, zig-zig, and zig-zag splaying cascades in Splay Trees.
- Disjoint Set Union (DSU) parent-pointer trees with path compression in Kruskal's MST.
- Priority queue edge relaxation ledgers ($\text{dist}[v] = \min(\text{dist}[v], \text{dist}[u] + w(u,v))$) in Dijkstra.
- In-degree array updates and DAG cycle detection in Topological Sorting.

**Advanced Data Structures Numericals** was engineered from first principles to bridge this gap. It provides a pure, deterministic, mathematically grounded simulation engine paired with an academic slide-out derivation ledger, allowing students and instructors to verify complex numerical questions step-by-step with zero ambiguity.

---

## Design Philosophy — Champagne Editorial Academic

Generic CS tools often employ blinding high-saturation gradients, neon animations, and cluttered dark-mode dashboards. This platform deliberately adopts a **Champagne Editorial Academic** aesthetic inspired by classical university press publications and archival manuscripts:

- **Warm Champagne / Ivory Canvas** (`#FAF8F5`, `#F4EFE6`): Soft on the eyes for extended study sessions, simulating premium archival paper.
- **Deep Espresso Ink** (`#221F1E`, `#3D3730`): High-contrast, legible text with high optical density.
- **Venetian Terracotta & Antique Ochre Accents** (`#8C2D19`, `#8C6D3B`): Thoughtful semantic highlights for rotations, recoloring, cut edges, and visited states.
- **Classical Serif Typography**:
  - `Playfair Display` for bold algorithmic chapter titles.
  - `EB Garamond` for readable, dignified mathematical prose and exam notes.
  - `Cinzel` for formal structural headings and balance invariant banners.
  - `JetBrains Mono` for precise state vectors, memory arrays, and trace tables.
- **KaTeX Native Rendering**: Flawless LaTeX mathematical typesetting for formulas, invariants, and complexity bounds.

---

## Key Platform Capabilities

| Capability | Description |
| :--- | :--- |
| **Complete Step Snapshots** | Every single algorithmic step generates an immutable snapshot containing tree/graph state, node coordinates, highlight classes, active status messages, and KaTeX mathematical formulas. |
| **Granular Rotation Sub-Steps** | Rotations are not treated as atomic jumps; when an imbalance occurs at Step $X$, it is decomposed into educational sub-steps ($X.1$ Imbalance Detection & Pivot Isolation $\to$ $X.2$ Subtree Reparenting & Pointer Shift $\to$ $X.3$ Invariant Restored) with animated SVG rotation curved arcs. |
| **Slide-Out Faculty Drawer** | An expandable right-side ledger displaying the current operation, algorithmic justification, step-by-step historical log, live state tables (distance, balance factor, in-degree, DSU), and KaTeX equations. |
| **One-Click Markdown Exporter** | Generates cleanly formatted, copy-pasteable Markdown answers for assignments, plotter copy formats, and exam solution keys. |
| **Interactive Inline Operations** | Click any node directly on the canvas to trigger immediate deletions (bottom-up / top-down), launch key searches, or insert custom keys on the fly. |
| **Dynamic Reingold-Tilford Layout** | Tree nodes dynamically scale and space themselves using an adapted layered tree drawing algorithm to eliminate visual overlap even in unbalanced intermediate states. |
| **Granular Playback Engine** | Scrubber timeline, step-by-step navigation ($\leftarrow / \rightarrow$), continuous autoplay, and variable playback speeds ($0.5\times, 1\times, 2\times$). |
| **Curated University Presets** | Includes classic exam numericals, adversarial degenerate trees, cascade rotation sequences, and complex weighted graphs. |

---

## Exhaustive Algorithmic Theory & Derivations

```
                               ┌─────────────────────────────────────────┐
                               │  ADVANCED DATA STRUCTURES NUMERICALS    │
                               └────────────────────┬────────────────────┘
                                                    │
                   ┌────────────────────────────────┴────────────────────────────────┐
                   │                                                                 │
     ┌─────────────▼─────────────┐                                     ┌─────────────▼─────────────┐
     │   BALANCED TREE ENGINES   │                                     │  GRAPH ALGORITHM ENGINES  │
     └─────────────┬─────────────┘                                     └─────────────┬─────────────┘
                   │                                                                 │
     ├── AVL Insertion & Deletion                                      ├── Breadth-First Search (BFS)
     ├── 2-3 Tree Search & Insert                                      ├── Depth-First Search (DFS)
     ├── Splay Search, Insert, Delete                                  ├── Dijkstra's Shortest Path
     └── Red-Black Tree Insertion                                      ├── Kruskal's MST (DSU)
                                                                       ├── Prim's MST (Cut Property)
                                                                       └── Topological Sorting
```

---

### 1. AVL Trees (Adelson-Velsky & Landis)

An **AVL Tree** is a strictly height-balanced Binary Search Tree where for every node $u \in T$, the heights of its left and right subtrees differ by at most 1.

#### Mathematical Invariants
$$\text{BF}(u) = h(\text{left}(u)) - h(\text{right}(u)) \in \{-1, 0, +1\}$$
$$h(u) = 1 + \max\big(h(\text{left}(u)),\, h(\text{right}(u))\big),\quad \text{with } h(\varnothing) = -1 \text{ or } 0$$

#### Rebalancing Rotations
When a node $A$ becomes unbalanced ($\text{BF}(A) \notin \{-1, 0, +1\}$), we determine the pivot node $B$ (the child along the insertion path) and execute one of four rotations:

```
1. LL (Left-Left) Rotation:
   Condition: BF(A) = +2 and BF(B) >= 0 (Inserted in Left subtree of Left child)
   Action: RightRotate(A)

         A (+2)                  B (0)
        /     \                /       \
      B (+1)   T3    ==>     C (0)      A (0)
     /     \                /     \    /     \
    C (0)   T2             T0     T1  T2     T3
   /    \
  T0    T1

2. RR (Right-Right) Rotation:
   Condition: BF(A) = -2 and BF(B) <= 0 (Inserted in Right subtree of Right child)
   Action: LeftRotate(A)

      A (-2)                     B (0)
     /      \                  /       \
    T1       B (-1)   ==>    A (0)      C (0)
            /     \         /     \    /     \
           T2      C (0)   T1     T2  T3     T4
                  /    \
                 T3    T4

3. LR (Left-Right) Double Rotation:
   Condition: BF(A) = +2 and BF(B) = -1 (Inserted in Right subtree of Left child)
   Action: LeftRotate(B), then RightRotate(A)

         A (+2)                  A (+2)                  C (0)
        /     \                 /     \                /       \
      B (-1)   T3    ==>      C (0)    T3    ==>     B (0)      A (0)
     /     \                 /     \                /     \    /     \
    T0      C (0)          B (0)   T2              T0     T1  T2     T3
           /     \        /     \
          T1     T2      T0     T1

4. RL (Right-Left) Double Rotation:
   Condition: BF(A) = -2 and BF(B) = +1 (Inserted in Left subtree of Right child)
   Action: RightRotate(B), then LeftRotate(A)
```

#### AVL Deletion Mechanics
1. Perform standard BST deletion:
   - **Case I (Leaf)**: Directly splice out node.
   - **Case II (Single Child)**: Bypass node with its child.
   - **Case III (Two Children)**: Replace node's key with its **Inorder Successor** ($\min(\text{RightSubtree})$) or **Inorder Predecessor** ($\max(\text{LeftSubtree})$), then recursively delete that successor/predecessor.
2. Retrace upward from the physical point of deletion to the root:
   - Update $h(u)$ and $\text{BF}(u)$.
   - If $|\text{BF}(u)| = 2$, execute appropriate rotation.
   - Unlike insertion (which requires at most one rotation), deletion can trigger **cascade rotations** up to $O(\log n)$ times.

---

### 2. 2-3 Search Trees (B-Tree Order 3)

A **2-3 Tree** is a multi-way search tree that maintains perfect balance: all leaf nodes are situated at the exact same depth.

#### Structural Properties
- **2-Node**: Contains **1 key** ($K_1$) and **2 children** ($L, R$). For all keys $x$ in $L$, $x < K_1$; for all $y$ in $R$, $y > K_1$.
- **3-Node**: Contains **2 keys** ($K_1 < K_2$) and **3 children** ($L, M, R$). $L < K_1 < M < K_2 < R$.
- **Height Property**: A 2-3 tree with $N$ keys has height $h$ satisfying:
$$\lfloor \log_3(N + 1) \rfloor \le h \le \lfloor \log_2(N + 1) \rfloor$$

```
   2-Node:                           3-Node:
     [ K1 ]                          [ K1 | K2 ]
    /      \                        /     |     \
  L (<K1)   R (>K1)              L (<K1)  M     R (>K2)
                                       (K1<M<K2)
```

#### Insertion & Split-Promote Mechanics
1. **Search Descent**: Follow standard search rules to reach the target leaf node.
2. **Leaf Has Space (2-Node $\to$ 3-Node)**:
   - Insert key into the 2-node in sorted order: $[K_1] + K_{\text{new}} \implies [K_{\text{small}} \mid K_{\text{large}}]$. Tree height is unchanged.
3. **Leaf is Full (3-Node $\to$ Temporary 4-Node Split)**:
   - Sort the 3 keys: $[K_{\text{low}}, K_{\text{mid}}, K_{\text{high}}]$.
   - Split into two 2-nodes: Left child $[K_{\text{low}}]$ and Right child $[K_{\text{high}}]$.
   - Promote median key $K_{\text{mid}}$ to the parent node.
4. **Recursive Upward Propagation**:
   - If parent is a 2-node, absorb $K_{\text{mid}}$ to become a 3-node.
   - If parent is a 3-node, repeat split-and-promote upward.
   - If the root splits, create a new root 2-node containing $K_{\text{mid}}$. **This is the only way a 2-3 Tree increases in height.**

---

### 3. Splay Trees (Self-Adjusting BST)

A **Splay Tree** is a self-adjusting Binary Search Tree designed by Daniel Sleator and Robert Tarjan. Any access operation (search, insert, delete) moves the accessed node to the root via a sequence of tree rotations called **splaying**.

#### Complexity & Potential Function
While individual operations may take $O(n)$ in the worst case, the amortized time over any sequence of $m$ operations is $O(m \log n)$. This is proven using Tarjan's potential function:
$$\Phi(T) = \sum_{x \in T} \log(\text{size}(x)), \quad \text{where } \text{size}(x) = |\text{Subtree}(x)|$$

#### Splay Primitive Steps
Let $x$ be the active node, $p = \text{parent}(x)$, and $g = \text{parent}(p)$:

```
1. Zig Step (Root Child):
   x has no grandparent (p is the root).
   Action: Single rotation on edge (x, p).

         p (Root)                  x (Root)
        /        \                /        \
       x          C     ==>      A          p
      / \                                  / \
     A   B                                B   C

2. Zig-Zig Step (Same Direction):
   x and p are both left children, or both right children.
   Action: Rotate(p, g) first, then Rotate(x, p).

           g                            p                          x
          / \                          / \                        / \
         p   D                        x   g                      A   p
        / \           ==>            / \ / \         ==>            / \
       x   C                        A  B C  D                      B   g
      / \                                                             / \
     A   B                                                           C   D

3. Zig-Zag Step (Opposite Directions):
   x is right child of left child p (or left child of right child p).
   Action: Rotate(x, p) first, then Rotate(x, g).

           g                            g                          x
          / \                          / \                       /   \
         p   D                        x   D                    p       g
        / \           ==>            / \             ==>      / \     / \
       A   x                        p   C                    A   B   C   D
          / \                      / \
         B   C                    A   B
```

#### Deletion Algorithms
- **Bottom-Up Deletion**:
  1. Access target key $K$ (splays $K$ to root).
  2. If root key $\ne K$, key does not exist.
  3. Disconnect left subtree $L$ and right subtree $R$.
  4. If $L = \varnothing$, new root is $R$.
  5. Otherwise, find $\max(L)$ and splay it to the root of $L$. Since $\max(L)$ has no right child, attach $R$ as the right child of $\max(L)$.
- **Top-Down Deletion**: Uses top-down partitioning during the descent to split and merge subtrees without second-pass pointer traversals.

---

### 4. Red-Black Trees (Symmetric Binary B-Trees)

A **Red-Black Tree** is an isometric binary representation of a 2-3-4 tree with 5 strict color invariants.

#### The 5 Red-Black Invariants
1. **Node Color**: Every node is colored either $\text{RED}$ or $\text{BLACK}$.
2. **Root Invariant**: The root node is strictly $\text{BLACK}$.
3. **Leaf Invariant**: Every leaf ($\text{NIL}$ sentinel) is $\text{BLACK}$.
4. **Red Invariant**: If a node is $\text{RED}$, both of its children must be $\text{BLACK}$ (no two consecutive red nodes on any path).
5. **Black-Height Invariant**: For every node $u$, all simple paths from $u$ to descendant leaves contain the exact same number of $\text{BLACK}$ nodes ($\text{bh}(u)$).

#### Insertion & Violation Restoration
When inserting key $z$, color it $\text{RED}$. If $z$'s parent $p$ is $\text{RED}$, we have a Double-Red violation ($p \in \text{RED}, z \in \text{RED}$). Let $g = \text{parent}(p)$ and $y = \text{sibling}(p)$ (the uncle of $z$):

```
Case 1: Uncle y is RED (Recoloring Case)
Action:
  1. Color p -> BLACK
  2. Color y -> BLACK
  3. Color g -> RED
  4. Set z = g and continue checking up the tree.

           g (B)                           g (R) <-- new z
          /     \                         /     \
        p (R)   y (R)         ==>       p (B)   y (B)
       /                               /
      z (R)                           z (R)

Case 2: Uncle y is BLACK & Triangle (z is Right Child of Left Parent)
Action:
  1. LeftRotate(p)
  2. Transform into Case 3 (Line configuration with z = old p).

           g (B)                           g (B)
          /     \                         /     \
        p (R)   y (B)         ==>       z (R)   y (B)
          \                            /
           z (R)                      p (R)

Case 3: Uncle y is BLACK & Line (z is Left Child of Left Parent)
Action:
  1. Color p -> BLACK
  2. Color g -> RED
  3. RightRotate(g)
  4. Violation completely resolved!

           g (B)                           p (B)
          /     \                         /     \
        p (R)   y (B)         ==>       z (R)   g (R)
       /                                          \
      z (R)                                       y (B)
```

---

### 5. Breadth-First Search (BFS)

**Breadth-First Search** systematically explores an unweighted graph $G = (V, E)$ level by level using a First-In, First-Out (FIFO) queue.

#### Algorithm Specification
```
Algorithm BFS(G, s):
  For each u in V:
    visited[u] = false, dist[u] = infinity, parent[u] = null
  visited[s] = true, dist[s] = 0
  Queue.enqueue(s)

  While Queue is not empty:
    u = Queue.dequeue()
    For each v in Adj[u]:
      If not visited[v]:
        visited[v] = true
        dist[v] = dist[u] + 1
        parent[v] = u
        Queue.enqueue(v)
```
- **Edge Classification**:
  - **Tree Edge**: $(u, v)$ where $v$ was discovered for the first time from $u$.
  - **Cross Edge**: $(u, v)$ connecting vertices on the same or adjacent BFS levels without an ancestor relationship.

---

### 6. Depth-First Search (DFS)

**Depth-First Search** explores as deep as possible along each branch before backtracking, utilizing a Last-In, First-Out (LIFO) recursion stack.

#### Timestamp Invariants & Edge Classification
Each vertex $u$ is annotated with discovery time $d[u]$ and finishing time $f[u]$ ($1 \le d[u] < f[u] \le 2|V|$):
- **Tree Edge**: $(u, v)$ leads to an undiscovered vertex $v$.
- **Back Edge**: $(u, v)$ leads to an active ancestor on the recursion stack ($d[v] < d[u] < f[u] < f[v]$). **Presence of a back edge indicates a cycle.**
- **Forward Edge**: $(u, v)$ leads to a completed descendant ($d[u] < d[v] < f[v] < f[u]$).
- **Cross Edge**: $(u, v)$ leads to an unrelated completed branch ($d[v] < f[v] < d[u] < f[u]$).

---

### 7. Dijkstra's Single-Source Shortest Path

**Dijkstra's Algorithm** finds the shortest paths from a source vertex $s$ to all other vertices in a directed/undirected graph with non-negative edge weights ($w(u, v) \ge 0$).

#### Triangle Inequality & Relaxation Formula
At each step, extract the vertex $u$ with minimum tentative distance $\text{dist}[u]$ from priority queue $Q$. For every outgoing edge $(u, v) \in E$, test the relaxation condition:

$$\text{If } \text{dist}[u] + w(u, v) < \text{dist}[v] \implies \begin{cases} \text{dist}[v] \leftarrow \text{dist}[u] + w(u, v) \\ \pi[v] \leftarrow u \end{cases}$$

#### State Vector Tracking Table
The engine outputs the complete exam-grade state ledger across every iteration:

$$\begin{array}{|c|c|c|c|c|}
\hline
\textbf{Step} & \textbf{Active } u & \textbf{Examined Edge } (u,v) & \textbf{Condition } \text{dist}[u] + w < \text{dist}[v] & \textbf{Updated State Vector } [\text{dist}, \pi] \\
\hline
0 & \text{Init} & - & - & s: [0, -], A: [\infty, -], B: [\infty, -] \\
1 & s & (s, A, 4), (s, B, 2) & 0 + 4 < \infty, 0 + 2 < \infty & A: [4, s], B: [2, s] \\
\hline
\end{array}$$

---

### 8. Kruskal's Minimum Spanning Tree (MST)

**Kruskal's Algorithm** constructs a Minimum Spanning Tree for a connected, undirected weighted graph $G = (V, E, w)$ using a greedy approach governed by a Disjoint Set Union (DSU) data structure.

#### Mathematical Formulation
1. Sort all edges $E$ in non-decreasing order of weight:
$$w(e_1) \le w(e_2) \le \dots \le w(e_{|E|})$$
2. Initialize $|V|$ singleton sets: $\text{MakeSet}(v)$ for each $v \in V$.
3. For each edge $e = (u, v)$ in sorted order:
   - Compute root representatives: $r_u = \text{Find}(u)$ and $r_v = \text{Find}(v)$.
   - **Cycle Avoidance Condition**:
$$\begin{cases} r_u \ne r_v \implies \text{ACCEPT } e \text{ into MST}, \quad \text{Union}(r_u, r_v) \\ r_u = r_v \implies \text{REJECT } e \text{ (Would create a cycle)} \end{cases}$$
4. Terminate when exactly $|V| - 1$ edges have been accepted.

#### Disjoint Set Union with Path Compression
$$\text{Find}(x) = \begin{cases} x & \text{if } \text{parent}[x] = x \\ \text{parent}[x] \leftarrow \text{Find}(\text{parent}[x]) & \text{otherwise (Path Compression)} \end{cases}$$

---

### 9. Prim's Minimum Spanning Tree (MST)

**Prim's Algorithm** grows a single tree $T = (V_T, E_T)$ from an arbitrary starting root $s$, maintaining the cut property at every transition.

#### The Cut Property
Let $S = V_T$ be the set of visited vertices and $V \setminus S$ be unvisited vertices. The cut $(S, V \setminus S)$ partitions the graph. The algorithm selects the minimum-weight edge crossing this cut:
$$e^* = \arg\min_{(u, v) \in E,\, u \in S,\, v \in V \setminus S} w(u, v)$$
Adding $e^*$ is guaranteed to be safe for the Minimum Spanning Tree.

---

### 10. Topological Sorting (Kahn's BFS & Vertex Removal)

A **Topological Sort** of a Directed Acyclic Graph (DAG) $G = (V, E)$ is a linear ordering of vertices such that for every directed edge $(u, v) \in E$, vertex $u$ precedes $v$ in the ordering.

#### Method A: Kahn's In-Degree BFS Algorithm
1. Compute the in-degree array for all $v \in V$:
$$\text{deg}^-(v) = |\{u \in V \mid (u, v) \in E\}|$$
2. Enqueue all vertices with $\text{deg}^-(v) = 0$ into queue $Q$.
3. While $Q$ is not empty:
   - Dequeue $u$, append $u$ to topological output list.
   - For each outgoing edge $(u, v) \in E$:
     - Decrement $\text{deg}^-(v) \leftarrow \text{deg}^-(v) - 1$.
     - If $\text{deg}^-(v) == 0$, $\text{enqueue}(Q, v)$.
4. **Cycle Detection**: If $|\text{Output}| < |V|$, the graph contains at least one directed cycle and no valid topological ordering exists.

#### Method B: Source Vertex Removal
Visually and numerically eliminate independent vertices ($\text{deg}^-(v) = 0$) and erase their incident outgoing edges one by one until the graph is empty.

---

## System Architecture & Codebase Tour

```
Advanced Data Structures Numericals/
├── index.html                     # Champagne typography & KaTeX CDN entrypoint
├── package.json                   # React 19 + TypeScript + Vite + Tailwind v4
├── tsconfig.app.json              # Optimized TS configuration
├── vite.config.ts                 # Modern ESM build configuration
├── src/
│   ├── main.tsx                   # React root mount
│   ├── App.tsx                    # Primary state coordinator & layout shell
│   ├── types/
│   │   ├── tree.ts                # AVL, 2-3, Splay, Red-Black node definitions
│   │   ├── graph.ts               # Adjacency, weighted edge, and coordinate models
│   │   └── animation.ts           # Step snapshot & derivation interfaces
│   ├── core/
│   │   ├── trees/
│   │   │   ├── avlEngine.ts       # AVL rebalance, rotation, and deletion engine
│   │   │   ├── twoThreeEngine.ts  # 2-3 search, split, and promote engine
│   │   │   ├── splayEngine.ts     # Splay zig/zig-zig/zig-zag & deletion engine
│   │   │   └── redBlackEngine.ts  # Red-Black uncle recolor & rotation engine
│   │   └── graphs/
│   │       ├── bfsEngine.ts       # BFS FIFO queue & tree edge tracer
│   │       ├── dfsEngine.ts       # DFS recursion stack & timestamp tracer
│   │       ├── dijkstraEngine.ts  # Dijkstra priority table & relaxation engine
│   │       ├── kruskalEngine.ts   # Kruskal edge sorting & DSU forest engine
│   │       ├── primEngine.ts      # Prim cut-crossing edge selection engine
│   │       └── topoEngine.ts      # Kahn's in-degree BFS & removal engine
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── TreeCanvas.tsx     # Reingold-Tilford adaptive SVG tree renderer
│   │   │   └── GraphCanvas.tsx    # Force/circular SVG graph renderer
│   │   ├── exam/
│   │   │   ├── ExamDrawer.tsx     # Slide-out faculty derivation ledger
│   │   │   ├── DerivationLedger.tsx # KaTeX step explanations & math blocks
│   │   │   └── LiveTraceTable.tsx # Live state tables (dist, BF, indegree, DSU)
│   │   ├── controls/
│   │   │   ├── PlaybackControls.tsx # Scrubber, speed, and step navigation
│   │   │   ├── PresetsBar.tsx     # University exam preset selection bar
│   │   │   ├── QuickOpsBar.tsx    # Inline node delete chips & search probes
│   │   │   └── CustomInputModal.tsx # Custom sequence insertion modal
│   │   └── layout/
│   │       ├── Header.tsx         # Academic brand header & category switcher
│   │       └── AlgorithmTabs.tsx  # Algorithm mode tabs
│   └── data/
│       └── presets.ts             # Curated exam numerical presets
```

---

## Interactive Controls & Faculty Drawer Guide

```
+---------------------------------------------------------------------------------------------+
|  [GraduationCap] Advanced Data Structures Numericals               [Tree Mode] [Graph Mode] |
+---------------------------------------------------------------------------------------------+
|  [AVL Insert] [AVL Delete] [2-3 Tree] [Splay Tree] [Red-Black Tree]                         |
+---------------------------------------------------------------------------------------------+
|  Presets: [Standard Balance] [Adversarial LL/RR] [Cascade Deletion]  [+ Custom Sequence]    |
+---------------------------------------------------------------------------------------------+
|  Quick Ops: Search [ 25 ] (Go) | Delete Nodes: (10) (20) (25) (30) (40) (50)  | [Ledger >>] |
+---------------------------------------------------------------------------------------------+
|                                                                                             |
|                                       ( 30 )  BF: 0                                         |
|                                      /      \                                               |
|                           BF: 0 ( 20 )      ( 40 ) BF: -1                                   |
|                                 /   \            \                                          |
|                               (10)  (25)         (50)                                       |
|                                                                                             |
+---------------------------------------------------------------------------------------------+
|  [ |<< ] [ < Prev ] [ Play / Pause ] [ Next > ] [ >>| ]   ---o------- [ 1.0x ]              |
+---------------------------------------------------------------------------------------------+
```

### 1. Slide-Out Faculty Drawer (`ExamDrawer.tsx`)
- Click **"Faculty Ledger"** or the right panel icon to slide out the academic inspector.
- **Current Step Header**: Displays the precise sub-phase (e.g., `SEARCHING_LEAF`, `ROTATING_LL`, `UNCLE_RECOLOR_CASE_1`, `EDGE_RELAXATION`).
- **Mathematical Formula Banner**: Renders KaTeX balance equations, triangle inequalities, or DSU union states.
- **Live State Table**:
  - AVL/Trees: Nodes, current heights $h(u)$, balance factors $\text{BF}(u)$, and balance status.
  - Dijkstra: Vertices $v$, current tentative distance $\text{dist}[v]$, predecessor $\pi[v]$, and visited status.
  - Kruskal: Sorted edge list, edge weights, component roots $\text{Find}(u), \text{Find}(v)$, and decision ($\text{Accepted} / \text{Cycle}$).
  - Topological Sort: Vertices, in-degree count $\text{deg}^-(v)$, and zero-indegree status.
- **Step History Log**: Chronological timeline of all derivations performed so far.
- **Copy to Markdown**: Exports the complete exam trace to clipboard with one click.

### 2. Quick Operations Bar (`QuickOpsBar.tsx`)
- **Interactive Deletion Chips**: Displays all active node keys currently in the tree. Click any chip (e.g. `(25)`) to immediately compute and trace the full deletion derivation for that node.
- **Search Key Probe**: Enter any integer and click **Search** to trace successful or unsuccessful search paths.
- **On-The-Fly Insertion**: Enter a new key and click **Insert** to observe dynamic rebalancing.

---

## Installation & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (Version $\ge 18.0.0$)
- [pnpm](https://pnpm.io/) (Recommended package manager)

```bash
# Verify pnpm installation
pnpm --version
```

### 1. Clone the Repository
```bash
git clone https://github.com/lifeknife10A/Advanced-Data-Structures-Numericals.git
cd "Advanced Data Structures Numericals"
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Launch Development Server
```bash
pnpm run dev
```
Open your browser and navigate to `http://localhost:5173/`.

### 4. Build for Production
```bash
pnpm run build
```
Generates an optimized, type-checked production bundle in the `dist/` directory.

### 5. Preview Production Build
```bash
pnpm run preview
```

---

## University Exam Rubric & Answer-Sheet Formatting

When answering university exam questions for AVL, 2-3 Trees, Splay Trees, Red-Black Trees, or Graphs, follow the standardized rubric demonstrated below (which matches the platform's **Copy to Markdown** output):

### Sample AVL Exam Answer Structure
```markdown
## Q1. AVL Tree Construction
Insert the sequence: [10, 20, 30, 40, 50, 25]

Ans:
- Step 1: Insert 10
  - Root node: 10 (BF: 0)
- Step 2: Insert 20
  - Insert 20 as right child of 10.
  - Heights: h(10) = 1, h(20) = 0.
  - BF(10) = 0 - 1 = -1 (Balanced).
- Step 3: Insert 30
  - Insert 30 as right child of 20.
  - Heights: h(10) = 2, h(20) = 1, h(30) = 0.
  - BF(10) = 0 - 2 = -2 (Unbalanced: RR Case at node 10).
  - Rotation: Execute LeftRotate(10) with pivot 20.
  - Resulting Root: 20, Left: 10, Right: 30.
```

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

*Designed and engineered with academic precision for computer science students and educators worldwide.*
