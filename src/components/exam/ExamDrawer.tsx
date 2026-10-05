import React, { useState } from 'react';
import { StepSnapshot } from '../../types/animation';
import { DerivationCard } from './DerivationCard';
import { TraceTable } from './TraceTable';
import { HistoryLog } from './HistoryLog';
import { BookOpen, Table, History, Layers, X, GraduationCap } from 'lucide-react';

interface ExamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: StepSnapshot | null;
  allSteps: StepSnapshot[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const ExamDrawer: React.FC<ExamDrawerProps> = ({
  isOpen,
  onClose,
  snapshot,
  allSteps,
  currentStepIndex,
  onSelectStep,
}) => {
  const [activeTab, setActiveTab] = useState<'derivation' | 'table' | 'history'>('derivation');

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#221F1E]/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        />
      )}

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-xl sm:max-w-2xl bg-[#FAF8F5] border-l border-[#C4B59D] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#F4EFE6] border-b border-[#E2D8C7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EDE5D8] border border-[#C4B59D] flex items-center justify-center text-[#8C2D19] shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#221F1E] m-0">
                Faculty Exam & Derivation Ledger
              </h3>
              <p className="text-xs text-[#59524A] font-serif italic m-0">
                {snapshot?.algorithmName || 'Numerical Derivation Trace'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#847B72] hover:text-[#221F1E] hover:bg-[#EDE5D8] transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 bg-[#FAF8F5] border-b border-[#E2D8C7]">
          <div className="flex items-center gap-1">
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

        {/* Drawer Scrollable Content */}
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
    </>
  );
};
