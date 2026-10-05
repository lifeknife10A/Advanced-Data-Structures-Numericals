import React, { useState } from 'react';
import { StepSnapshot } from '../../types/animation';
import { DerivationCard } from './DerivationCard';
import { TraceTable } from './TraceTable';
import { HistoryLog } from './HistoryLog';
import { BookOpen, Table, History, Layers } from 'lucide-react';

interface ExamPaneProps {
  snapshot: StepSnapshot | null;
  allSteps: StepSnapshot[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const ExamPane: React.FC<ExamPaneProps> = ({
  snapshot,
  allSteps,
  currentStepIndex,
  onSelectStep,
}) => {
  const [activeTab, setActiveTab] = useState<'derivation' | 'table' | 'history'>('derivation');

  return (
    <div className="bg-[#FAF8F5] border border-[#E2D8C7] rounded-xl overflow-hidden shadow-xs flex flex-col h-[540px]">
      {/* Pane Tabs Header */}
      <div className="flex items-center justify-between px-5 bg-[#F4EFE6] border-b border-[#E2D8C7]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('derivation')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-serif font-bold border-b-2 transition-all ${
              activeTab === 'derivation'
                ? 'border-[#8C2D19] text-[#8C2D19] bg-[#FAF8F5]'
                : 'border-transparent text-[#59524A] hover:text-[#221F1E]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Faculty Derivation</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-serif font-bold border-b-2 transition-all ${
              activeTab === 'table'
                ? 'border-[#8C2D19] text-[#8C2D19] bg-[#FAF8F5]'
                : 'border-transparent text-[#59524A] hover:text-[#221F1E]'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Live Trace Table</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-serif font-bold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-[#8C2D19] text-[#8C2D19] bg-[#FAF8F5]'
                : 'border-transparent text-[#59524A] hover:text-[#221F1E]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Step Ledger ({allSteps.length})</span>
          </button>
        </div>

        {/* Auxiliary State Badge */}
        {snapshot?.auxiliaryState && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#59524A] bg-[#EDE5D8] px-3 py-1.5 rounded-lg border border-[#D4C6B1]">
            <Layers className="w-3.5 h-3.5 text-[#8C6D3B]" />
            <span className="font-bold">{snapshot.auxiliaryState.label}:</span>
            <span>[{snapshot.auxiliaryState.items.join(', ')}]</span>
          </div>
        )}
      </div>

      {/* Pane Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'derivation' && <DerivationCard snapshot={snapshot} />}
        {activeTab === 'table' && (
          <TraceTable
            headers={snapshot?.traceTableHeaders || []}
            rows={snapshot?.traceTableRows || []}
            activeRowIndex={snapshot?.activeTableRowIndex}
          />
        )}
        {activeTab === 'history' && (
          <HistoryLog
            allSteps={allSteps}
            currentStepIndex={currentStepIndex}
            onSelectStep={onSelectStep}
          />
        )}
      </div>
    </div>
  );
};
