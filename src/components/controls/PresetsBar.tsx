import React from 'react';
import { PRESET_LIBRARY, PresetItem } from '../../data/presets';
import { BookMarked, SlidersHorizontal, ArrowUpRight } from 'lucide-react';

interface PresetsBarProps {
  activeAlgorithmId: string;
  activePresetId: string;
  isTree: boolean;
  onSelectPreset: (preset: PresetItem) => void;
  onOpenCustomModal: () => void;
}

export const PresetsBar: React.FC<PresetsBarProps> = ({
  activeAlgorithmId,
  activePresetId,
  isTree,
  onSelectPreset,
  onOpenCustomModal,
}) => {
  const matchingPresets = PRESET_LIBRARY.filter(
    (p) => p.algorithm === activeAlgorithmId || activeAlgorithmId.startsWith(p.algorithm)
  );

  return (
    <div className="bg-[#FAF8F5] border-b border-[#E2D8C7] px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Preset Selector Chips */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C2D19] shrink-0 mr-1">
            <BookMarked className="w-4 h-4" />
            <span>Standard Exam Numericals:</span>
          </div>

          {matchingPresets.map((preset) => {
            const isSelected = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-serif shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#8C2D19] text-[#FAF8F5] font-semibold shadow-xs'
                    : 'bg-[#F4EFE6] text-[#59524A] hover:text-[#221F1E] border border-[#E2D8C7] hover:border-[#C4B59D]'
                }`}
              >
                <span>{preset.title}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                  isSelected ? 'bg-[#722312] text-[#FAF8F5]' : 'bg-[#EDE5D8] text-[#59524A]'
                }`}>
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Input Trigger */}
        {isTree && (
          <button
            onClick={onOpenCustomModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-serif font-semibold bg-[#FAF8F5] text-[#59524A] hover:text-[#8C2D19] border border-[#C4B59D] hover:border-[#8C2D19] transition-all self-start sm:self-auto shrink-0 shadow-2xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Custom Sequence</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#847B72]" />
          </button>
        )}
      </div>
    </div>
  );
};
