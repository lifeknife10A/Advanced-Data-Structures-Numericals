import React from 'react';
import { 
  GitFork, 
  Layers, 
  RefreshCw, 
  ShieldAlert, 
  Share2, 
  GitMerge, 
  Milestone, 
  Network, 
  TreePine, 
  ArrowRightCircle 
} from 'lucide-react';

export interface AlgorithmOption {
  id: string;
  name: string;
  shortTag: string;
  category: 'TREE' | 'GRAPH';
  icon: React.ReactNode;
}

export const ALGORITHM_OPTIONS: AlgorithmOption[] = [
  // Trees
  { id: 'avl-insert', name: 'AVL Tree (Insertion)', shortTag: 'AVL Insert', category: 'TREE', icon: <GitFork className="w-4.5 h-4.5" /> },
  { id: 'avl-delete', name: 'AVL Tree (Deletion)', shortTag: 'AVL Delete', category: 'TREE', icon: <GitFork className="w-4.5 h-4.5" /> },
  { id: '2-3-insert', name: '2-3 Tree (Insertion)', shortTag: '2-3 Insert', category: 'TREE', icon: <Layers className="w-4.5 h-4.5" /> },
  { id: '2-3-search', name: '2-3 Tree (Search)', shortTag: '2-3 Search', category: 'TREE', icon: <Layers className="w-4.5 h-4.5" /> },
  { id: 'splay-insert', name: 'Splay Tree (Insertion)', shortTag: 'Splay Insert', category: 'TREE', icon: <RefreshCw className="w-4.5 h-4.5" /> },
  { id: 'splay-search', name: 'Splay Tree (Search)', shortTag: 'Splay Search', category: 'TREE', icon: <RefreshCw className="w-4.5 h-4.5" /> },
  { id: 'splay-delete', name: 'Splay Tree (Deletion)', shortTag: 'Splay Delete', category: 'TREE', icon: <RefreshCw className="w-4.5 h-4.5" /> },
  { id: 'rb-insert', name: 'Red-Black Tree (Insertion)', shortTag: 'Red-Black', category: 'TREE', icon: <ShieldAlert className="w-4.5 h-4.5" /> },

  // Graphs
  { id: 'bfs', name: 'Breadth-First Search (BFS)', shortTag: 'BFS', category: 'GRAPH', icon: <Share2 className="w-4.5 h-4.5" /> },
  { id: 'dfs', name: 'Depth-First Search (DFS)', shortTag: 'DFS', category: 'GRAPH', icon: <GitMerge className="w-4.5 h-4.5" /> },
  { id: 'dijkstra', name: "Dijkstra's Shortest Path", shortTag: 'Dijkstra', category: 'GRAPH', icon: <Milestone className="w-4.5 h-4.5" /> },
  { id: 'kruskal', name: "Kruskal's MST (DSU)", shortTag: 'Kruskal', category: 'GRAPH', icon: <Network className="w-4.5 h-4.5" /> },
  { id: 'prim', name: "Prim's MST (Growing Cut)", shortTag: 'Prim', category: 'GRAPH', icon: <TreePine className="w-4.5 h-4.5" /> },
  { id: 'topo-kahn', name: "Topological Sort (Kahn BFS)", shortTag: 'Topo Kahn', category: 'GRAPH', icon: <ArrowRightCircle className="w-4.5 h-4.5" /> },
  { id: 'topo-source', name: 'Topological Sort (Source Removal)', shortTag: 'Topo Source', category: 'GRAPH', icon: <ArrowRightCircle className="w-4.5 h-4.5" /> },
];

interface AlgorithmTabsProps {
  category: 'TREE' | 'GRAPH';
  activeAlgorithmId: string;
  onSelectAlgorithm: (id: string) => void;
}

export const AlgorithmTabs: React.FC<AlgorithmTabsProps> = ({
  category,
  activeAlgorithmId,
  onSelectAlgorithm,
}) => {
  const filteredOptions = ALGORITHM_OPTIONS.filter((opt) => opt.category === category);

  return (
    <div className="border-b border-[#E2D8C7] bg-[#F4EFE6]/80 px-4 sm:px-6 lg:px-8 py-2.5 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
        {filteredOptions.map((opt) => {
          const isActive = opt.id === activeAlgorithmId;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectAlgorithm(opt.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-serif transition-all ${
                isActive
                  ? 'bg-[#FAF8F5] text-[#8C2D19] font-bold border border-[#C4B59D] shadow-xs'
                  : 'text-[#59524A] hover:text-[#221F1E] hover:bg-[#EDE5D8]/70 border border-transparent'
              }`}
            >
              <span className={isActive ? 'text-[#8C2D19]' : 'text-[#847B72]'}>
                {opt.icon}
              </span>
              <span>{opt.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
