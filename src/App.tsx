import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/layout/Header';
import { AlgorithmTabs } from './components/layout/AlgorithmTabs';
import { PresetsBar } from './components/controls/PresetsBar';
import { QuickOpsBar } from './components/controls/QuickOpsBar';
import { PlaybackControls } from './components/controls/PlaybackControls';
import { CustomInputModal } from './components/controls/CustomInputModal';
import { TreeCanvas } from './components/canvas/TreeCanvas';
import { GraphCanvas } from './components/canvas/GraphCanvas';
import { ExamDrawer } from './components/exam/ExamDrawer';
import { PRESET_LIBRARY, PresetItem } from './data/presets';
import { StepSnapshot } from './types/animation';
import { BookOpen, PanelRightOpen, Sparkles } from 'lucide-react';

// Algorithmic Engines
import { generateAVLInsertionSteps, generateAVLDeletionSteps } from './core/trees/avlEngine';
import { generateTwoThreeInsertionSteps, generateTwoThreeSearchSteps } from './core/trees/twoThreeEngine';
import { generateSplayInsertionSteps, generateSplaySearchSteps, generateSplayDeletionSteps } from './core/trees/splayEngine';
import { generateRedBlackInsertionSteps } from './core/trees/redBlackEngine';
import { generateBFSSteps } from './core/graphs/bfsEngine';
import { generateDFSSteps } from './core/graphs/dfsEngine';
import { generateDijkstraSteps } from './core/graphs/dijkstraEngine';
import { generateKruskalSteps } from './core/graphs/kruskalEngine';
import { generatePrimSteps } from './core/graphs/primEngine';
import { generateTopoSortSteps } from './core/graphs/topoEngine';

export function App() {
  const [category, setCategory] = useState<'TREE' | 'GRAPH'>('TREE');
  const [activeAlgorithmId, setActiveAlgorithmId] = useState<string>('avl-insert');
  const [activePresetId, setActivePresetId] = useState<string>('avl-insert-standard');

  // Drawer Open / Closed State
  const [isExamDrawerOpen, setIsExamDrawerOpen] = useState<boolean>(false);

  // Custom Sequence State
  const [customParams, setCustomParams] = useState<{
    keys?: number[];
    deleteKeys?: number[];
    searchKey?: number;
  } | null>(null);

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Playback State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Find currently active preset
  const currentPreset = useMemo(() => {
    return (
      PRESET_LIBRARY.find((p) => p.id === activePresetId) ||
      PRESET_LIBRARY.find((p) => p.algorithm === activeAlgorithmId) ||
      PRESET_LIBRARY[0]
    );
  }, [activePresetId, activeAlgorithmId]);

  // Current active keys
  const activeKeys = customParams?.keys || currentPreset.keys || [10, 20, 30, 40, 50, 25];
  const activeDeleteKeys = customParams?.deleteKeys || currentPreset.deleteKeys || [70, 50, 60, 20];
  const activeSearchKey = customParams?.searchKey ?? currentPreset.searchKey ?? 70;

  // Generate Step Snapshots dynamically based on active algorithm & parameters
  const steps: StepSnapshot[] = useMemo(() => {
    const keys = activeKeys;
    const deleteKeys = activeDeleteKeys;
    const searchKey = activeSearchKey;
    const graph = currentPreset.graph;
    const startVertex = currentPreset.startVertex || 'A';

    switch (activeAlgorithmId) {
      // Tree Algorithms
      case 'avl-insert':
        return generateAVLInsertionSteps(keys);

      case 'avl-delete':
        return generateAVLDeletionSteps(keys, deleteKeys);

      case '2-3-insert':
        return generateTwoThreeInsertionSteps(keys);

      case '2-3-search':
        return generateTwoThreeSearchSteps(keys, searchKey);

      case 'splay-insert':
        return generateSplayInsertionSteps(keys);

      case 'splay-search':
        return generateSplaySearchSteps(keys, searchKey);

      case 'splay-delete':
        return generateSplayDeletionSteps(keys, searchKey);

      case 'rb-insert':
        return generateRedBlackInsertionSteps(keys);

      // Graph Algorithms
      case 'bfs':
        return graph ? generateBFSSteps(graph, startVertex) : [];

      case 'dfs':
        return graph ? generateDFSSteps(graph, startVertex) : [];

      case 'dijkstra':
        return graph ? generateDijkstraSteps(graph, startVertex) : [];

      case 'kruskal':
        return graph ? generateKruskalSteps(graph) : [];

      case 'prim':
        return graph ? generatePrimSteps(graph, startVertex) : [];

      case 'topo-kahn':
        return graph ? generateTopoSortSteps(graph, 'kahn_bfs') : [];

      case 'topo-source':
        return graph ? generateTopoSortSteps(graph, 'source_removal') : [];

      default:
        return generateAVLInsertionSteps(keys);
    }
  }, [activeAlgorithmId, activePresetId, customParams, currentPreset, activeKeys, activeDeleteKeys, activeSearchKey]);

  // Reset step index when algorithm or preset changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [activeAlgorithmId, activePresetId, customParams]);

  // Trigger celebration confetti upon reaching final step
  useEffect(() => {
    if (steps.length > 1 && currentStepIndex === steps.length - 1) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#8C2D19', '#8C6D3B', '#2B4C38', '#EDE5D8'],
      });
    }
  }, [currentStepIndex, steps.length]);

  const currentSnapshot = steps[currentStepIndex] || null;

  const handleCategoryChange = (newCat: 'TREE' | 'GRAPH') => {
    setCategory(newCat);
    setCustomParams(null);
    if (newCat === 'TREE') {
      setActiveAlgorithmId('avl-insert');
      setActivePresetId('avl-insert-standard');
    } else {
      setActiveAlgorithmId('bfs');
      setActivePresetId('bfs-standard');
    }
  };

  const handleSelectAlgorithm = (algoId: string) => {
    setActiveAlgorithmId(algoId);
    setCustomParams(null);
    const matching = PRESET_LIBRARY.find((p) => p.algorithm === algoId);
    if (matching) {
      setActivePresetId(matching.id);
    }
  };

  const handleSelectPreset = (preset: PresetItem) => {
    setActivePresetId(preset.id);
    setActiveAlgorithmId(preset.algorithm);
    setCustomParams(null);
  };

  const handleSubmitCustomKeys = (
    keys: number[],
    deleteKeys?: number[],
    searchKey?: number
  ) => {
    setCustomParams({ keys, deleteKeys, searchKey });
    setCurrentStepIndex(0);
  };

  const isTwoThree = activeAlgorithmId.startsWith('2-3');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#221F1E] relative">
      {/* Editorial Header */}
      <Header category={category} onCategoryChange={handleCategoryChange} />

      {/* Algorithm Navigation Tabs */}
      <AlgorithmTabs
        category={category}
        activeAlgorithmId={activeAlgorithmId}
        onSelectAlgorithm={handleSelectAlgorithm}
      />

      {/* Preset Numericals and Custom Input Bar */}
      <PresetsBar
        activeAlgorithmId={activeAlgorithmId}
        activePresetId={activePresetId}
        isTree={category === 'TREE'}
        onSelectPreset={handleSelectPreset}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
      />

      {/* Main Full Canvas Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
        {/* Interactive Quick Operations Bar for Trees (Direct Delete, Search, and Insert) */}
        {category === 'TREE' && (
          <QuickOpsBar
            algorithmId={activeAlgorithmId}
            currentKeys={activeKeys}
            currentDeleteKeys={activeDeleteKeys}
            currentSearchKey={activeSearchKey}
            onApplyOperation={handleSubmitCustomKeys}
          />
        )}

        {/* Canvas Header Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#8C2D19] shadow-2xs" />
            <h2 className="text-base sm:text-lg font-serif font-bold uppercase tracking-wider text-[#3D3833] m-0">
              Interactive {category === 'TREE' ? 'Tree' : 'Graph'} Canvas
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-[#EDE5D8] text-[#59524A] border border-[#D4C6B1]">
              {currentSnapshot?.algorithmName || ''}
            </span>
          </div>

          {/* Slide-out Ledger Drawer Trigger Button */}
          <button
            onClick={() => setIsExamDrawerOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold bg-[#F4EFE6] hover:bg-[#EDE5D8] text-[#8C2D19] border-2 border-[#C4B59D] hover:border-[#8C2D19] shadow-sm transition-all group"
          >
            <BookOpen className="w-4.5 h-4.5 text-[#8C2D19] group-hover:scale-110 transition-transform" />
            <span>Faculty Exam & Derivation Ledger</span>
            <PanelRightOpen className="w-4 h-4 text-[#8C6D3B] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Full Interactive Canvas */}
        <div className="w-full relative">
          {category === 'TREE' ? (
            <TreeCanvas
              tree={currentSnapshot?.treeState}
              activeNodeIds={currentSnapshot?.activeNodeIds}
              isTwoThree={isTwoThree}
              algorithmName={currentSnapshot?.algorithmName}
            />
          ) : (
            <GraphCanvas
              vertices={currentSnapshot?.graphState?.vertices}
              edges={currentSnapshot?.graphState?.edges}
              activeNodeIds={currentSnapshot?.activeNodeIds}
              activeEdgeIds={currentSnapshot?.activeEdgeIds}
              algorithmName={currentSnapshot?.algorithmName}
            />
          )}

          {/* Floating Drawer Quick-Open Pill on Canvas */}
          <button
            onClick={() => setIsExamDrawerOpen(true)}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF8F5]/90 hover:bg-[#FAF8F5] text-[#8C2D19] text-xs sm:text-sm font-serif font-bold border border-[#C4B59D] shadow-md backdrop-blur-xs transition-all hover:scale-102"
          >
            <Sparkles className="w-4 h-4 text-[#8C6D3B]" />
            <span>View Faculty Derivation</span>
            <PanelRightOpen className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Title & Explanation Banner Under Canvas */}
        <div className="bg-[#F4EFE6] border border-[#E2D8C7] rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm font-serif shadow-2xs">
          <div className="flex items-center gap-3 text-[#221F1E]">
            <span className="font-mono font-bold text-[#8C2D19] text-sm sm:text-base">
              Step {currentStepIndex + 1}:
            </span>
            <span className="font-bold text-sm sm:text-base text-[#221F1E]">
              {currentSnapshot?.title}
            </span>
            {currentSnapshot?.statusBadge && (
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#EDE5D8] text-[#59524A] border border-[#D4C6B1]">
                {currentSnapshot.statusBadge.text}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#847B72] font-mono text-xs sm:text-sm">
              {currentStepIndex + 1} of {steps.length}
            </span>
            <button
              onClick={() => setIsExamDrawerOpen(true)}
              className="text-xs font-serif font-bold text-[#8C2D19] underline hover:text-[#722312]"
            >
              Open Written Exam Steps →
            </button>
          </div>
        </div>
      </main>

      {/* Slide-over Faculty Exam Ledger Drawer */}
      <ExamDrawer
        isOpen={isExamDrawerOpen}
        onClose={() => setIsExamDrawerOpen(false)}
        snapshot={currentSnapshot}
        allSteps={steps}
        currentStepIndex={currentStepIndex}
        onSelectStep={(idx) => setCurrentStepIndex(idx)}
      />

      {/* Bottom Sticky Playback Controls */}
      <div className="sticky bottom-0 z-30">
        <PlaybackControls
          currentStep={currentStepIndex}
          totalSteps={steps.length}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onStepChange={(step) => setCurrentStepIndex(step)}
          onPlayPauseToggle={() => setIsPlaying(!isPlaying)}
          onSpeedChange={(speed) => setPlaybackSpeed(speed)}
          onReset={() => {
            setCurrentStepIndex(0);
            setIsPlaying(false);
          }}
        />
      </div>

      {/* Custom Key Sequence Input Modal */}
      <CustomInputModal
        isOpen={isCustomModalOpen}
        algorithmName={currentSnapshot?.algorithmName || 'Algorithm'}
        isTree={category === 'TREE'}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmitKeys={handleSubmitCustomKeys}
      />
    </div>
  );
}

export default App;
