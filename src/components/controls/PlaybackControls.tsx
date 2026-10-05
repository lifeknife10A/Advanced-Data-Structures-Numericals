import React, { useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Gauge 
} from 'lucide-react';

interface PlaybackControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onStepChange: (step: number) => void;
  onPlayPauseToggle: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  playbackSpeed,
  onStepChange,
  onPlayPauseToggle,
  onSpeedChange,
  onReset,
}) => {
  // Auto-advance timer when playing
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.round(2000 / playbackSpeed);
    const timer = setInterval(() => {
      if (currentStep < totalSteps - 1) {
        onStepChange(currentStep + 1);
      } else {
        onPlayPauseToggle(); // pause at end
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, currentStep, totalSteps, playbackSpeed, onStepChange, onPlayPauseToggle]);

  return (
    <div className="bg-[#FAF8F5] border-t border-[#E2D8C7] px-3.5 sm:px-5 py-3 sm:py-3.5 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Scrubber & Step Label (Full width on mobile) */}
        <div className="flex items-center gap-2.5 sm:gap-4 w-full md:w-1/2">
          <span className="text-xs sm:text-sm font-serif font-bold text-[#59524A] whitespace-nowrap min-w-[85px] sm:min-w-[95px]">
            Step {currentStep + 1} / {Math.max(totalSteps, 1)}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(totalSteps - 1, 0)}
            value={currentStep}
            onChange={(e) => onStepChange(Number(e.target.value))}
            className="w-full h-2.5 sm:h-2 bg-[#E2D8C7] rounded-lg appearance-none cursor-pointer accent-[#8C2D19]"
          />
        </div>

        {/* Action Controls and Speed (Wrapped nicely on mobile) */}
        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto flex-wrap">
          {/* Primary Playback Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Jump to Start */}
            <button
              onClick={() => onStepChange(0)}
              disabled={currentStep === 0}
              title="First Step"
              className="p-2 sm:p-2 rounded-lg hover:bg-[#F4EFE6] text-[#59524A] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E2D8C7] min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Previous Step */}
            <button
              onClick={() => onStepChange(Math.max(currentStep - 1, 0))}
              disabled={currentStep === 0}
              title="Previous Step"
              className="p-2 sm:p-2 rounded-lg hover:bg-[#F4EFE6] text-[#59524A] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E2D8C7] min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={onPlayPauseToggle}
              className="px-3 sm:px-4 py-2 rounded-lg bg-[#8C2D19] text-[#FAF8F5] hover:bg-[#722312] font-serif text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 shadow-xs transition-all min-h-[36px]"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Auto Play</span>
                </>
              )}
            </button>

            {/* Next Step */}
            <button
              onClick={() => onStepChange(Math.min(currentStep + 1, totalSteps - 1))}
              disabled={currentStep >= totalSteps - 1}
              title="Next Step"
              className="p-2 sm:p-2 rounded-lg hover:bg-[#F4EFE6] text-[#59524A] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E2D8C7] min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>

            {/* Jump to End */}
            <button
              onClick={() => onStepChange(totalSteps - 1)}
              disabled={currentStep >= totalSteps - 1}
              title="Final Step"
              className="p-2 sm:p-2 rounded-lg hover:bg-[#F4EFE6] text-[#59524A] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E2D8C7] min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              title="Reset to Initial State"
              className="p-2 sm:p-2 rounded-lg hover:bg-[#F4EFE6] text-[#59524A] border border-[#E2D8C7] min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-[#F4EFE6] p-1 rounded-lg border border-[#E2D8C7] shrink-0">
            <Gauge className="w-3.5 h-3.5 text-[#847B72] ml-1 mr-0.5 hidden xs:inline" />
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 sm:px-2.5 py-1 rounded text-[11px] sm:text-xs font-mono font-semibold transition-all ${
                  playbackSpeed === s
                    ? 'bg-[#FAF8F5] text-[#8C2D19] font-bold border border-[#C4B59D]'
                    : 'text-[#59524A] hover:text-[#221F1E]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
