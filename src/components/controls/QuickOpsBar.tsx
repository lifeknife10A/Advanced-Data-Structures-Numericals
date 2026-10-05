import React, { useState } from 'react';
import { PlusCircle, Trash2, Search, CornerDownRight } from 'lucide-react';

interface QuickOpsBarProps {
  algorithmId: string;
  currentKeys: number[];
  currentDeleteKeys?: number[];
  currentSearchKey?: number;
  onApplyOperation: (keys: number[], deleteKeys?: number[], searchKey?: number) => void;
}

export const QuickOpsBar: React.FC<QuickOpsBarProps> = ({
  algorithmId,
  currentKeys,
  currentDeleteKeys = [],
  currentSearchKey,
  onApplyOperation,
}) => {
  const isDelete = algorithmId.includes('delete');
  const isSearch = algorithmId.includes('search');
  const isInsert = !isDelete && !isSearch;

  // Local state for interactive operations
  const [nodeInput, setNodeInput] = useState<string>('');

  // Handle on-the-fly Insert
  const handleInsertNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeInput.trim()) return;

    const newKeys = nodeInput
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n));

    if (newKeys.length > 0) {
      const updatedKeys = [...currentKeys, ...newKeys];
      onApplyOperation(updatedKeys);
      setNodeInput('');
    }
  };

  // Handle on-the-fly Delete
  const handleDeleteNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeInput.trim()) return;

    const keysToDelete = nodeInput
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n));

    if (keysToDelete.length > 0) {
      onApplyOperation(currentKeys, keysToDelete);
      setNodeInput('');
    }
  };

  // Handle on-the-fly Search
  const handleSearchNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeInput.trim()) return;

    const targetKey = Number(nodeInput.trim());
    if (!isNaN(targetKey)) {
      onApplyOperation(currentKeys, undefined, targetKey);
      setNodeInput('');
    }
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#C4B59D] rounded-xl p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-3.5">
        {/* Left Side: Current Tree Nodes Preview & Quick Click Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-serif font-bold text-[#59524A] flex items-center gap-1.5 shrink-0">
            <CornerDownRight className="w-4 h-4 text-[#8C2D19]" />
            <span>Tree Nodes:</span>
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {currentKeys.map((k) => {
              const isMarkedDelete = isDelete && currentDeleteKeys.includes(k);
              const isMarkedSearch = isSearch && currentSearchKey === k;

              return (
                <button
                  key={k}
                  onClick={() => {
                    if (isDelete) {
                      onApplyOperation(currentKeys, [k]);
                    } else if (isSearch) {
                      onApplyOperation(currentKeys, undefined, k);
                    }
                  }}
                  title={
                    isDelete
                      ? `Click to delete node ${k}`
                      : isSearch
                      ? `Click to search node ${k}`
                      : `Node ${k}`
                  }
                  className={`px-2.5 py-1 rounded-md text-xs sm:text-sm font-mono font-bold transition-all min-h-[32px] flex items-center justify-center ${
                    isMarkedDelete
                      ? 'bg-[#FDF2F0] text-[#8C2D19] border-2 border-[#8C2D19] line-through'
                      : isMarkedSearch
                      ? 'bg-[#FAF0EE] text-[#8C2D19] border-2 border-[#8C2D19]'
                      : 'bg-[#F4EFE6] text-[#221F1E] border border-[#D4C6B1] hover:border-[#8C2D19] hover:bg-[#EDE5D8]'
                  }`}
                >
                  {k}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Direct Interactive Action Input */}
        <div className="w-full lg:w-auto">
          {/* 1. DELETION FORM */}
          {isDelete && (
            <form onSubmit={handleDeleteNode} className="flex items-center gap-2 w-full">
              <div className="relative flex-1 sm:w-56">
                <input
                  type="text"
                  value={nodeInput}
                  onChange={(e) => setNodeInput(e.target.value)}
                  placeholder="Key to delete (e.g. 20)"
                  className="w-full px-3 py-2 sm:py-1.5 text-sm font-mono bg-[#FAF8F5] border-2 border-[#8C2D19]/40 rounded-lg focus:outline-hidden focus:border-[#8C2D19] text-[#221F1E]"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-[#8C2D19] text-[#FAF8F5] text-xs sm:text-sm font-serif font-bold hover:bg-[#722312] shadow-xs transition-all shrink-0 min-h-[36px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </form>
          )}

          {/* 2. SEARCH FORM */}
          {isSearch && (
            <form onSubmit={handleSearchNode} className="flex items-center gap-2 w-full">
              <div className="relative flex-1 sm:w-56">
                <input
                  type="number"
                  value={nodeInput}
                  onChange={(e) => setNodeInput(e.target.value)}
                  placeholder="Target key (e.g. 35)"
                  className="w-full px-3 py-2 sm:py-1.5 text-sm font-mono bg-[#FAF8F5] border-2 border-[#8C6D3B]/40 rounded-lg focus:outline-hidden focus:border-[#8C6D3B] text-[#221F1E]"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-[#8C6D3B] text-[#FAF8F5] text-xs sm:text-sm font-serif font-bold hover:bg-[#73572D] shadow-xs transition-all shrink-0 min-h-[36px]"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>
          )}

          {/* 3. INSERTION FORM */}
          {isInsert && (
            <form onSubmit={handleInsertNode} className="flex items-center gap-2 w-full">
              <div className="relative flex-1 sm:w-52">
                <input
                  type="text"
                  value={nodeInput}
                  onChange={(e) => setNodeInput(e.target.value)}
                  placeholder="Key(s) to add (e.g. 25)"
                  className="w-full px-3 py-2 sm:py-1.5 text-sm font-mono bg-[#FAF8F5] border-2 border-[#C4B59D] rounded-lg focus:outline-hidden focus:border-[#8C2D19] text-[#221F1E]"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-[#FAF8F5] text-[#8C2D19] border-2 border-[#8C2D19] text-xs sm:text-sm font-serif font-bold hover:bg-[#8C2D19] hover:text-[#FAF8F5] shadow-xs transition-all shrink-0 min-h-[36px]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Node</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
