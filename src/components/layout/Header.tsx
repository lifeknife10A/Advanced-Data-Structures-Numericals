import React from 'react';
import { BookOpen, GraduationCap, Compass } from 'lucide-react';

interface HeaderProps {
  category: 'TREE' | 'GRAPH';
  onCategoryChange: (cat: 'TREE' | 'GRAPH') => void;
}

export const Header: React.FC<HeaderProps> = ({ category, onCategoryChange }) => {
  return (
    <header className="border-b border-[#E2D8C7] bg-[#FAF8F5]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Editorial Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F4EFE6] border-2 border-[#C4B59D] flex items-center justify-center text-[#8C2D19] shadow-sm shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#221F1E] font-serif m-0">
                Advanced Data Structures Numericals
              </h1>
              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-[#EDE5D8] text-[#59524A] border border-[#D4C6B1] font-mono">
                Faculty Exam Engine
              </span>
            </div>
            <p className="text-sm sm:text-base text-[#59524A] font-serif italic mt-0.5">
              Step-by-step balanced tree & graph algorithm derivations with rigorous exam rubrics
            </p>
          </div>
        </div>

        {/* Primary Category Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-[#F4EFE6] p-1.5 rounded-xl border border-[#E2D8C7]">
          <button
            onClick={() => onCategoryChange('TREE')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm sm:text-base font-serif font-medium transition-all ${
              category === 'TREE'
                ? 'bg-[#FAF8F5] text-[#8C2D19] font-bold shadow-sm border border-[#D4C6B1]'
                : 'text-[#59524A] hover:text-[#221F1E]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#8C2D19]" />
            <span>Tree Data Structures</span>
          </button>

          <button
            onClick={() => onCategoryChange('GRAPH')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm sm:text-base font-serif font-medium transition-all ${
              category === 'GRAPH'
                ? 'bg-[#FAF8F5] text-[#8C2D19] font-bold shadow-sm border border-[#D4C6B1]'
                : 'text-[#59524A] hover:text-[#221F1E]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#8C6D3B]" />
            <span>Graph Algorithms</span>
          </button>
        </div>
      </div>
    </header>
  );
};
