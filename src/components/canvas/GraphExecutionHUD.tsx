import React from 'react';
import { AuxiliaryState } from '../../types/animation';
import { Layers, ArrowRightCircle, CheckCircle2, ListOrdered, Sparkles, ArrowRight, CornerDownRight, Database } from 'lucide-react';

interface GraphExecutionHUDProps {
  auxiliaryState?: AuxiliaryState;
  algorithmName?: string;
}

export const GraphExecutionHUD: React.FC<GraphExecutionHUDProps> = ({
  auxiliaryState,
  algorithmName = '',
}) => {
  if (!auxiliaryState) return null;

  const { type, label, items = [], visitedItems = [], actionType = 'none', activeItem, enqueuedItems = [] } = auxiliaryState;

  const isDFS = type === 'stack' || algorithmName.toLowerCase().includes('depth');
  const isBFS = type === 'queue' || algorithmName.toLowerCase().includes('breadth');

  return (
    <div className="bg-[#F4EFE6] border-t-2 border-[#C4B59D] p-3 sm:p-4 rounded-b-2xl shadow-inner">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {/* ========================================================= */}
        {/* PANEL 1: LIVE CONTAINER (STACK FOR DFS / QUEUE FOR BFS) */}
        {/* ========================================================= */}
        <div className="bg-[#FAF8F5] border border-[#C4B59D] rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
          {/* Header & Status Indicator */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E2D8C7] mb-2.5">
            <div className="flex items-center gap-1.5 min-w-0">
              {isDFS ? (
                <Layers className="w-4 h-4 text-[#8C2D19] shrink-0" />
              ) : isBFS ? (
                <ArrowRightCircle className="w-4 h-4 text-[#8C6D3B] shrink-0" />
              ) : (
                <Database className="w-4 h-4 text-[#2B4C38] shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-serif font-bold text-[#221F1E] truncate">
                {isDFS ? 'LIFO Call Stack' : isBFS ? 'FIFO Queue' : label || 'Active Container'}
              </span>
            </div>

            {/* Action Badge */}
            {actionType === 'push' && activeItem && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#EBF5EE] text-[#2B4C38] border border-[#A3D9B1] animate-pulse">
                <span>PUSH ➜</span>
                <span className="underline">{activeItem}</span>
              </span>
            )}
            {actionType === 'pop' && activeItem && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FDF2F0] text-[#8C2D19] border border-[#F2C0B8] animate-pulse">
                <span>POP ⬅</span>
                <span className="underline">{activeItem} (Backtrack)</span>
              </span>
            )}
            {actionType === 'enqueue' && activeItem && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#EBF5EE] text-[#2B4C38] border border-[#A3D9B1] animate-pulse">
                <span>ENQUEUE ➜</span>
                <span className="underline">{activeItem}</span>
              </span>
            )}
            {actionType === 'dequeue' && activeItem && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FAF0EE] text-[#8C2D19] border border-[#F2C0B8] animate-pulse">
                <span>DEQUEUE ➜</span>
                <span className="underline">{activeItem}</span>
              </span>
            )}
            {actionType === 'none' && (
              <span className="text-[10.5px] font-mono text-[#847B72] bg-[#EDE5D8] px-2 py-0.5 rounded">
                Size: {items.length}
              </span>
            )}
          </div>

          {/* Visual Container Body */}
          <div className="flex-1 flex items-center min-h-[52px]">
            {isDFS ? (
              /* --- STACK VISUALIZER (Horizontal with Top on Right) --- */
              <div className="w-full flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                <div className="text-[10px] font-mono font-bold text-[#847B72] uppercase tracking-wider shrink-0 bg-[#EDE5D8] px-1.5 py-2 rounded-l border border-[#D4C6B1]">
                  Bottom
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  {items.map((item, idx) => {
                    const isTop = idx === items.length - 1;
                    const isActionActive = item === activeItem;

                    return (
                      <div key={`stack-${item}-${idx}`} className="relative flex flex-col items-center shrink-0">
                        {isTop && (
                          <span className="absolute -top-4 text-[9px] font-mono font-bold text-[#8C2D19] uppercase tracking-wider animate-bounce">
                            TOP ▾
                          </span>
                        )}
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm sm:text-base border-2 transition-all shadow-xs ${
                            isTop
                              ? 'bg-[#FAF0EE] text-[#8C2D19] border-[#8C2D19] shadow-sm scale-105'
                              : isActionActive
                              ? 'bg-[#EBF5EE] text-[#2B4C38] border-[#2B4C38]'
                              : 'bg-[#F4EFE6] text-[#221F1E] border-[#C4B59D]'
                          }`}
                        >
                          {item}
                        </div>
                        <span className="text-[9px] font-mono text-[#847B72] mt-0.5">[{idx}]</span>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div className="text-xs font-serif italic text-[#847B72] px-3 py-2 bg-[#F4EFE6] rounded-lg border border-dashed border-[#C4B59D]">
                      Stack is currently empty (All branches explored).
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="text-[10px] font-mono font-bold text-[#8C2D19] uppercase tracking-wider shrink-0 bg-[#FAF0EE] px-2 py-2 rounded-r border border-[#F2C0B8]">
                    Top
                  </div>
                )}
              </div>
            ) : isBFS ? (
              /* --- QUEUE VISUALIZER (FIFO from Front to Rear) --- */
              <div className="w-full flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                <div className="text-[10px] font-mono font-bold text-[#8C2D19] uppercase tracking-wider shrink-0 bg-[#FAF0EE] px-2 py-2 rounded-l border border-[#F2C0B8]">
                  Front ➜
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  {items.map((item, idx) => {
                    const isFront = idx === 0;
                    const isRear = idx === items.length - 1;

                    return (
                      <div key={`queue-${item}-${idx}`} className="relative flex flex-col items-center shrink-0">
                        {isFront && (
                          <span className="absolute -top-4 text-[9px] font-mono font-bold text-[#8C2D19] uppercase tracking-wider">
                            HEAD
                          </span>
                        )}
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm sm:text-base border-2 transition-all shadow-xs ${
                            isFront
                              ? 'bg-[#FAF0EE] text-[#8C2D19] border-[#8C2D19] shadow-sm'
                              : 'bg-[#F4EFE6] text-[#221F1E] border-[#C4B59D]'
                          }`}
                        >
                          {item}
                        </div>
                        <span className="text-[9px] font-mono text-[#847B72] mt-0.5">[{idx}]</span>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div className="text-xs font-serif italic text-[#847B72] px-3 py-2 bg-[#F4EFE6] rounded-lg border border-dashed border-[#C4B59D]">
                      Queue is empty (Level completed).
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono font-bold text-[#8C6D3B] uppercase tracking-wider shrink-0 bg-[#F4EFE6] px-2 py-2 rounded-r border border-[#D4C6B1]">
                  ➜ Rear
                </div>
              </div>
            ) : (
              /* --- GENERIC CONTAINER (Priority Queue / DSU / Candidates) --- */
              <div className="w-full flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none flex-wrap">
                {items.map((item, idx) => (
                  <span
                    key={`gen-${idx}`}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#F4EFE6] border border-[#C4B59D] text-[#221F1E]"
                  >
                    {item}
                  </span>
                ))}
                {items.length === 0 && (
                  <span className="text-xs font-serif italic text-[#847B72]">Container is empty.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* PANEL 2: VISITED / TRAVERSAL OUTPUT ARRAY */}
        {/* ========================================================= */}
        <div className="bg-[#FAF8F5] border border-[#C4B59D] rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E2D8C7] mb-2.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-[#2B4C38] shrink-0" />
              <span className="text-xs sm:text-sm font-serif font-bold text-[#221F1E] truncate">
                Visited Array (Traversal Output)
              </span>
            </div>

            <span className="text-[10.5px] font-mono text-[#2B4C38] bg-[#EBF5EE] border border-[#A3D9B1] px-2 py-0.5 rounded-full font-bold">
              Visited: {visitedItems.length}
            </span>
          </div>

          {/* Visual Array Cells */}
          <div className="flex-1 flex flex-col justify-center min-h-[52px]">
            {visitedItems.length > 0 ? (
              <div className="space-y-1.5">
                {/* Array Cells Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  <span className="text-[11px] font-mono font-bold text-[#59524A] uppercase tracking-wider mr-1 shrink-0">
                    Arr:
                  </span>
                  {visitedItems.map((item, idx) => {
                    const isLatest = idx === visitedItems.length - 1;

                    return (
                      <div key={`visited-${item}-${idx}`} className="relative flex flex-col items-center shrink-0">
                        {/* Index Indicator */}
                        <span className="text-[9px] font-mono text-[#847B72] font-semibold">[{idx}]</span>
                        {/* Cell Box */}
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm sm:text-base border-2 transition-all ${
                            isLatest
                              ? 'bg-[#FAF0EE] text-[#8C2D19] border-[#8C2D19] shadow-sm scale-105'
                              : 'bg-[#EDE5D8] text-[#221F1E] border-[#C4B59D]'
                          }`}
                        >
                          {item}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Traversal Arrow Chain */}
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#59524A] overflow-x-auto scrollbar-none pt-0.5">
                  <span className="text-[#8C2D19] shrink-0">Sequence:</span>
                  <span>{visitedItems.join(' → ')}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs font-serif italic text-[#847B72] px-3 py-2 bg-[#F4EFE6] rounded-lg border border-dashed border-[#C4B59D]">
                No vertices added to visited array yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
