import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface CustomInputModalProps {
  isOpen: boolean;
  algorithmName: string;
  isTree: boolean;
  onClose: () => void;
  onSubmitKeys: (keys: number[], deleteKeys?: number[], searchKey?: number) => void;
}

export const CustomInputModal: React.FC<CustomInputModalProps> = ({
  isOpen,
  algorithmName,
  isTree,
  onClose,
  onSubmitKeys,
}) => {
  const [keysInput, setKeysInput] = useState<string>('20, 10, 30, 5, 15, 25, 35');
  const [secondaryInput, setSecondaryInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const parsedKeys = keysInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => {
          const num = Number(s);
          if (isNaN(num)) throw new Error(`Invalid number: "${s}"`);
          return num;
        });

      if (parsedKeys.length === 0) {
        throw new Error('Please enter at least one integer key.');
      }

      if (parsedKeys.length > 25) {
        throw new Error('Please limit custom sequence to 25 keys for clean visual clarity.');
      }

      let parsedDeleteKeys: number[] | undefined;
      let parsedSearchKey: number | undefined;

      if (secondaryInput.trim().length > 0) {
        if (algorithmName.includes('Search')) {
          parsedSearchKey = Number(secondaryInput.trim());
          if (isNaN(parsedSearchKey)) throw new Error('Search key must be a valid number');
        } else if (algorithmName.includes('Delete')) {
          parsedDeleteKeys = secondaryInput
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
            .map((s) => Number(s));
        }
      }

      onSubmitKeys(parsedKeys, parsedDeleteKeys, parsedSearchKey);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to parse input.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221F1E]/40 backdrop-blur-xs p-3.5 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#C4B59D] rounded-xl shadow-xl max-w-lg w-full max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#F4EFE6] border-b border-[#E2D8C7] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#8C2D19]" />
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#221F1E] m-0 truncate">
              Custom Sequence: {algorithmName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#847B72] hover:text-[#221F1E] hover:bg-[#EDE5D8]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
          <div>
            <label className="block text-xs font-serif font-semibold text-[#59524A] uppercase tracking-wider mb-1.5">
              {algorithmName.includes('Delete') ? 'Initial Tree Keys (Comma-separated)' : 'Key Sequence (Comma-separated)'}
            </label>
            <input
              type="text"
              value={keysInput}
              onChange={(e) => setKeysInput(e.target.value)}
              placeholder="e.g. 10, 20, 30, 40, 50, 25"
              className="w-full px-3 py-2 border border-[#C4B59D] rounded-lg bg-[#FAF8F5] text-[#221F1E] font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8C2D19]/40"
            />
            <p className="text-[11px] text-[#847B72] mt-1 font-serif italic">
              Values will be inserted sequentially from left to right.
            </p>
          </div>

          {algorithmName.includes('Delete') && (
            <div>
              <label className="block text-xs font-serif font-semibold text-[#59524A] uppercase tracking-wider mb-1.5">
                Keys to Delete (Comma-separated)
              </label>
              <input
                type="text"
                value={secondaryInput}
                onChange={(e) => setSecondaryInput(e.target.value)}
                placeholder="e.g. 20, 50"
                className="w-full px-3 py-2 border border-[#C4B59D] rounded-lg bg-[#FAF8F5] text-[#221F1E] font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8C2D19]/40"
              />
            </div>
          )}

          {algorithmName.includes('Search') && (
            <div>
              <label className="block text-xs font-serif font-semibold text-[#59524A] uppercase tracking-wider mb-1.5">
                Target Key to Search
              </label>
              <input
                type="number"
                value={secondaryInput}
                onChange={(e) => setSecondaryInput(e.target.value)}
                placeholder="e.g. 70"
                className="w-full px-3 py-2 border border-[#C4B59D] rounded-lg bg-[#FAF8F5] text-[#221F1E] font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8C2D19]/40"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs text-[#8C2D19] bg-[#8C2D19]/10 border border-[#8C2D19]/20 p-2.5 rounded-lg font-serif">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-[#E2D8C7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-serif text-[#59524A] hover:bg-[#F4EFE6] rounded-lg border border-[#E2D8C7] text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 sm:py-2 text-xs font-serif font-bold text-[#FAF8F5] bg-[#8C2D19] hover:bg-[#722312] rounded-lg shadow-xs transition-all text-center"
            >
              Generate Step-by-Step Derivation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
