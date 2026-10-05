import React from 'react';
import katex from 'katex';
import { StepSnapshot } from '../../types/animation';
import { BookOpen, CheckCircle2, Info, RefreshCw } from 'lucide-react';

interface DerivationCardProps {
  snapshot: StepSnapshot | null;
}

export const DerivationCard: React.FC<DerivationCardProps> = ({ snapshot }) => {
  if (!snapshot) {
    return (
      <div className="p-8 text-center text-[#847B72] font-serif">
        <p className="text-base italic">No derivation available for this step.</p>
      </div>
    );
  }

  // Helper to render KaTeX formula safely
  const renderMath = (mathStr?: string) => {
    if (!mathStr) return null;
    try {
      const html = katex.renderToString(mathStr, {
        displayMode: true,
        throwOnError: false,
      });
      return <div dangerouslySetInnerHTML={{ __html: html }} className="my-2.5" />;
    } catch {
      return <div className="font-mono text-sm my-2.5">{mathStr}</div>;
    }
  };

  const badgeVariants = {
    normal: 'bg-[#EDE5D8] text-[#59524A] border-[#D4C6B1]',
    warning: 'bg-[#FDF7E8] text-[#8C6D3B] border-[#E8D4A8]',
    success: 'bg-[#EDF5F0] text-[#2B4C38] border-[#B7DAC3]',
    danger: 'bg-[#FDF2F0] text-[#8C2D19] border-[#F2C0B8]',
    accent: 'bg-[#FAF0EE] text-[#8C2D19] border-[#E8C0B8]',
  };

  return (
    <div className="space-y-4.5 p-6">
      {/* Title & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-[#E2D8C7]">
        <div>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#221F1E] m-0">
            {snapshot.title}
          </h4>
          {snapshot.subtitle && (
            <p className="text-xs sm:text-sm text-[#59524A] font-serif italic mt-1">
              {snapshot.subtitle}
            </p>
          )}
        </div>
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-semibold border self-start sm:self-auto shadow-2xs ${
            badgeVariants[snapshot.statusBadge.variant] || badgeVariants.normal
          }`}
        >
          {snapshot.statusBadge.text}
        </span>
      </div>

      {/* Rotation Mechanics Box (When rotation is in progress) */}
      {snapshot.rotationMeta && (
        <div className="bg-[#FAF0EE] border-2 border-[#8C2D19] rounded-xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#E8C0B8]">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#8C2D19] animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-xs sm:text-sm font-mono font-bold text-[#8C2D19] uppercase tracking-wider">
                {snapshot.rotationMeta.type} Rotation Mechanism
              </span>
            </div>
            {snapshot.rotationMeta.direction && (
              <span className="text-xs font-serif font-bold text-[#8C2D19] px-2.5 py-0.5 rounded bg-[#FAF8F5] border border-[#E8C0B8]">
                {snapshot.rotationMeta.direction === 'clockwise' ? '⟳ Clockwise (Right Rotate)' : '⟲ Counter-Clockwise (Left Rotate)'}
              </span>
            )}
          </div>
          <p className="text-sm font-serif text-[#221F1E] leading-relaxed m-0 font-medium">
            {snapshot.rotationMeta.description}
          </p>
          {snapshot.rotationMeta.transferredSubtree && (
            <div className="mt-2.5 pt-2 border-t border-[#E8C0B8] text-xs font-mono text-[#8C2D19] font-semibold">
              ↳ Subtree Transfer: {snapshot.rotationMeta.transferredSubtree}
            </div>
          )}
        </div>
      )}

      {/* KaTeX Mathematical Derivation Box */}
      {snapshot.mathematicalDerivation && (
        <div className="bg-[#FAF8F5] border border-[#C4B59D] rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C2D19] uppercase tracking-wider mb-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Mathematical / Formal Derivation</span>
          </div>
          <div className="text-[#221F1E] font-serif overflow-x-auto py-1">
            {renderMath(snapshot.mathematicalDerivation)}
          </div>
        </div>
      )}

      {/* Faculty Step-by-Step Explanation */}
      <div className="bg-[#F4EFE6] border border-[#E2D8C7] rounded-xl p-4.5">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#59524A] uppercase tracking-wider mb-2.5">
          <Info className="w-4 h-4 text-[#8C6D3B]" />
          <span>Faculty Written Explanation</span>
        </div>
        <div className="text-sm sm:text-base text-[#221F1E] font-serif leading-relaxed whitespace-pre-line">
          {snapshot.facultyExplanation}
        </div>
      </div>

      {/* Exam Rule / Grading Rubric Callout */}
      {snapshot.examRule && (
        <div className="bg-[#EDE5D8]/80 border-l-4 border-[#8C2D19] p-4 rounded-r-xl">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C2D19] uppercase tracking-wider mb-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Faculty Grading Rule / Exam Invariant</span>
          </div>
          <p className="text-xs sm:text-sm text-[#3D3833] font-serif leading-normal m-0">
            {snapshot.examRule}
          </p>
        </div>
      )}
    </div>
  );
};
