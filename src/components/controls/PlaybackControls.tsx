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
    <div className="bg-[#FAF8F5] border-t border-[#E2D8C7] px-5 py-3.5 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Scrubber & Step Label */}
        <div className="flex items-center gap-4 w-full md:w-1/2">
          <span className="text-sm font-serif font-bold text-[#59524A] whitespace-nowrap min-w-[95px]">
            Step {currentStep + 1} / {Math.max(totalSteps, 1)}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(totalSteps - 1, 0)}
            value={currentStep}
            onChange={(e) => onStepChange(Number(e.target.value))}
            className="w-full h-2 bg-[#E2D8C7] rounded-lg appearance-none cursor-pointer accent-[#8C2D19]"
          />
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-2">
          {/* Jump to Start */}
          <button
            onClick={() => onStepChange(0)}
            disabled={currentStep === 0}
            title="First Step"
            className="p-2 rounded-lg hover:bg-[#F4EFE6] text-[#59524A] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E2D8C7]"
          >
            <SkipBack className="w-4.5 h-4.5" />
          </button>

          {/* Previous Step */}
          <button
            onClick={() => onStepChange(Math.max(currentStep - 1, 0))}
            disabled={currentStep === 0}
            title="Previous Step"
            className="p-2 rounded-lg hover:bg-[#F4EFE6] text-[#59524A] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E2D8C7]"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={onPlayPauseToggle}
            className="px-4 py-2 rounded-lg bg-[#8C2D19] text-[#FAF8F5] hover:bg-[#722312] font-serif text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
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
            className="p-2 rounded-lg hover:bg-[#F4EFE6] text-[#59524A] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E2D8C7]"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>

          {/* Jump to End */}
          <button
            onClick={() => onStepChange(totalSteps - 1)}
            disabled={currentStep >= totalSteps - 1}
            title="Final Step"
            className="p-2 rounded-lg hover:bg-[#F4EFE6] text-[#59524A] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E2D8C7]"
          >
            <SkipForward className="w-4.5 h-4.5" />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            title="Reset to Initial State"
            className="p-2 rounded-lg hover:bg-[#F4EFE6] text-[#59524A] border border-[#E2D8C7] ml-2"
          >
            <RotateCcw className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 bg-[#F4EFE6] p-1.5 rounded-lg border border-[#E2D8C7]">
          <Gauge className="w-4 h-4 text-[#847B72] ml-1 mr-0.5" />
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${
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
  );
};
