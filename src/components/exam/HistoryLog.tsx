import React, { useState } from 'react';
import { StepSnapshot } from '../../types/animation';
import { Copy, Check, FileText } from 'lucide-react';

interface HistoryLogProps {
  allSteps: StepSnapshot[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({
  allSteps,
  currentStepIndex,
  onSelectStep,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    if (allSteps.length === 0) return;

    let md = `# ${allSteps[0]?.algorithmName || 'Algorithm'} — Step-by-Step Derivation Trace\n\n`;

    allSteps.forEach((step, idx) => {
      md += `## Step ${idx + 1}: ${step.title}\n`;
      if (step.subtitle) md += `*${step.subtitle}*\n\n`;
      md += `**Faculty Explanation:**\n${step.facultyExplanation}\n\n`;
      if (step.mathematicalDerivation) {
        md += `**Derivation:**\n$$\n${step.mathematicalDerivation}\n$$\n\n`;
      }
      if (step.examRule) {
        md += `> **Exam Rule:** ${step.examRule}\n\n`;
      }
      md += `\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-3">
      {/* Action Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2D8C7]">
        <div className="flex items-center gap-1.5 text-xs font-serif font-semibold text-[#59524A]">
          <FileText className="w-4 h-4 text-[#8C2D19]" />
          <span>Execution Ledger ({allSteps.length} steps)</span>
        </div>
        <button
          onClick={handleCopyMarkdown}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-serif font-medium bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#8C2D19] border border-[#C4B59D] rounded-md shadow-2xs transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#2B4C38]" />
              <span className="text-[#2B4C38]">Copied Markdown!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Markdown Solution</span>
            </>
          )}
        </button>
      </div>

      {/* Step List */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {allSteps.map((step, idx) => {
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={idx}
              onClick={() => onSelectStep(idx)}
              className={`p-3 rounded-lg border text-xs font-serif cursor-pointer transition-all ${
                isCurrent
                  ? 'bg-[#FAF8F5] border-[#8C2D19] shadow-xs ring-1 ring-[#8C2D19]/20'
                  : 'bg-[#F4EFE6]/70 border-[#E2D8C7] hover:bg-[#FAF8F5] hover:border-[#C4B59D]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] font-bold text-[#8C2D19]">
                  Step {idx + 1}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EDE5D8] text-[#59524A]">
                  {step.statusBadge.text}
                </span>
              </div>
              <p className="font-bold text-[#221F1E] m-0 mb-1">{step.title}</p>
              <p className="text-[#59524A] text-[11.5px] line-clamp-2 m-0">
                {step.facultyExplanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
