import React from 'react';
import { TraceTableRow } from '../../types/animation';

interface TraceTableProps {
  headers: string[];
  rows: TraceTableRow[];
  activeRowIndex?: number;
}

export const TraceTable: React.FC<TraceTableProps> = ({
  headers,
  rows,
  activeRowIndex,
}) => {
  if (headers.length === 0 || rows.length === 0) {
    return (
      <div className="p-8 text-center text-[#847B72] font-serif">
        <p className="text-base italic">Trace table will populate as operations execute.</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 overflow-x-auto">
      <table className="w-full text-left border-collapse font-serif">
        <thead>
          <tr className="border-b-2 border-[#C4B59D] bg-[#F4EFE6]">
            {headers.map((h, i) => (
              <th
                key={i}
                className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-bold text-[#221F1E] whitespace-nowrap tracking-tight"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => {
            const isRowActive =
              row.isHighlighted || (activeRowIndex !== undefined && rowIdx === activeRowIndex);

            return (
              <tr
                key={row.id || rowIdx}
                className={`border-b border-[#E2D8C7] transition-colors ${
                  isRowActive
                    ? 'bg-[#FDF2F0] font-semibold text-[#8C2D19]'
                    : 'hover:bg-[#FAF8F5]/90 text-[#221F1E]'
                }`}
              >
                {row.cells.map((cell, cellIdx) => (
                  <td key={cellIdx} className="py-2 px-3 sm:py-2.5 sm:px-4 whitespace-nowrap font-mono text-xs sm:text-sm">
                    {typeof cell === 'string' &&
                    (cell.includes('UNBALANCED') || cell.includes('REJECT') || cell.includes('OVERFLOW')) ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-[#FDF2F0] text-[#8C2D19] border border-[#F2C0B8]">
                        {cell}
                      </span>
                    ) : typeof cell === 'string' &&
                      (cell.includes('BALANCED') || cell.includes('ACCEPT') || cell.includes('VALID') || cell.includes('FOUND')) ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-[#EDF5F0] text-[#2B4C38] border border-[#B7DAC3]">
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
