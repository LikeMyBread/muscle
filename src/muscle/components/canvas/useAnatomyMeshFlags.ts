import { useShallow } from 'zustand/react/shallow';
import { collectStudyGroupIdsForNode } from '../../curriculum/resolveStudyGroupForNode';
import type { MuscleMemoryNode } from '../../types/node';
import { useMuscleStore } from '../../store/useMuscleStore';
import { isNodeVisibleAtPeelDepth } from '../../layerDepthView';
import { buildMeshFlags, resolveMeshVisualState, type MeshRenderFlags } from './meshState';

export type AnatomyMeshFlags = MeshRenderFlags;

const HIDDEN_FLAGS: AnatomyMeshFlags = {
  visible: false,
  visualState: 'default',
};

export function useAnatomyMeshFlags(
  nodeId: string,
  node: MuscleMemoryNode | undefined,
): AnatomyMeshFlags {
  return useMuscleStore(
    useShallow((state) => {
      if (!node) {
        return HIDDEN_FLAGS;
      }

      // In Study Mode, interactions and visual highlights are strictly controlled by the study store
      if (state.studyActive) {
        const isTarget = state.studyTargetNodeId === nodeId;
        const isMistake = state.studyMistakeNodeId === nodeId;
        const isFocused =
          state.focusedNodeId === nodeId ||
          Boolean(state.focusedGroupNodeIds?.includes(nodeId));

        // The chosen mistake structure is always visible when answered incorrectly
        if (isMistake && state.studyAnswerState === 'incorrect') {
          return buildMeshFlags(node, 'incorrect');
        }

        // The target structure or focused example structure is always visible
        if (isTarget || isFocused) {
          if (state.studyAnswerState === 'correct') {
            return buildMeshFlags(node, 'correct');
          }
          return buildMeshFlags(node, 'highlight');
        }

        // For non-target/non-focused structures, respect layer peel depth
        if (!isNodeVisibleAtPeelDepth(node, state.layerPeelDepth)) {
          return HIDDEN_FLAGS;
        }

        // Non-target visible structures fade into the background when active target or focus is set
        const hasActiveFocus = Boolean(
          state.studyTargetNodeId ||
            state.focusedNodeId ||
            (state.focusedGroupNodeIds && state.focusedGroupNodeIds.length > 0),
        );
        return buildMeshFlags(node, hasActiveFocus ? 'faded' : 'default');
      }

      if (!isNodeVisibleAtPeelDepth(node, state.layerPeelDepth)) {
        return HIDDEN_FLAGS;
      }

      const highlightTarget =
        state.quiz.quizMode === 'locate_name' && state.quiz.feedback === 'idle'
          ? null
          : state.quiz.targetNodeId;

      const hoveredGroupNodeIds =
        state.mode === 'warmup' && state.hoveredNodeId
          ? collectStudyGroupIdsForNode(state.hoveredNodeId, {
              moduleId: state.bodyView === 'region' ? state.activeModuleId : undefined,
            })
          : null;

      const visualState = resolveMeshVisualState({
        nodeId,
        focusedNodeId: state.focusedNodeId,
        focusedGroupNodeIds: state.focusedGroupNodeIds,
        hoveredGroupNodeIds,
        hoveredNodeId: state.hoveredNodeId,
        quizTargetId: highlightTarget,
        quizFeedback: state.quiz.feedback,
        mode: state.mode,
      });

      return buildMeshFlags(node, visualState);
    }),
  );
}
