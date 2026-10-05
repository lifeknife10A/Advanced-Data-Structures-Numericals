import React, { useState } from 'react';
import { StepSnapshot } from '../../types/animation';
import { DerivationCard } from './DerivationCard';
import { TraceTable } from './TraceTable';
import { HistoryLog } from './HistoryLog';
import { BookOpen, Table, History, X, GraduationCap } from 'lucide-react';

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
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-full sm:max-w-xl md:max-w-2xl bg-[#FAF8F5] border-l border-[#C4B59D] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#F4EFE6] border-b border-[#E2D8C7] flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EDE5D8] border border-[#C4B59D] flex items-center justify-center text-[#8C2D19] shadow-xs shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-serif font-bold text-[#221F1E] m-0 truncate">
                Faculty Exam & Derivation Ledger
              </h3>
              <p className="text-[11px] sm:text-xs text-[#59524A] font-serif italic m-0 truncate">
                {snapshot?.algorithmName || 'Numerical Derivation Trace'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg text-[#847B72] hover:text-[#221F1E] hover:bg-[#EDE5D8] transition-colors shrink-0"
            title="Close Drawer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Equal width on mobile) */}
        <div className="flex items-center justify-between px-2 sm:px-6 bg-[#FAF8F5] border-b border-[#E2D8C7] overflow-x-auto">
          <div className="flex items-center w-full sm:w-auto gap-0.5 sm:gap-1">
            <button
              onClick={() => setActiveTab('derivation')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-serif font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'derivation'
                  ? 'border-[#8C2D19] text-[#8C2D19] bg-[#FAF8F5]'
                  : 'border-transparent text-[#59524A] hover:text-[#221F1E]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Derivation</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-serif font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'table'
                  ? 'border-[#8C2D19] text-[#8C2D19] bg-[#FAF8F5]'
                  : 'border-transparent text-[#59524A] hover:text-[#221F1E]'
              }`}
            >
              <Table className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Trace Table</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-serif font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'history'
                  ? 'border-[#8C2D19] text-[#8C2D19] bg-[#FAF8F5]'
                  : 'border-transparent text-[#59524A] hover:text-[#221F1E]'
              }`}
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>History ({allSteps.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Tab Content Container with Safe Bottom Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-8 sm:pb-6">
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
