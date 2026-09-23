// Registry that maps a wire question type to its interactive component.
// Plain data file: components stay in the .jsx files, this map only imports
// them (same pattern as data/adhikaramEnvironments.js). Two of the spec's
// types share components - story/fill-blank questions still teach through
// counted objects, and numerical answers render as NumberChar chips.

import VisualCountQuestion from '../components/maths/VisualCountQuestion'
import MultipleChoiceQuestion from '../components/maths/MultipleChoiceQuestion'
import DragGroupQuestion from '../components/maths/DragGroupQuestion'
import ClockQuestion from '../components/maths/ClockQuestion'
import ShapeTouchQuestion from '../components/maths/ShapeTouchQuestion'
import FractionSliceQuestion from '../components/maths/FractionSliceQuestion'
import ChartBuildQuestion from '../components/maths/ChartBuildQuestion'

export const QUESTION_RENDERERS = {
  visual: VisualCountQuestion,
  story: VisualCountQuestion,
  'fill-blank': VisualCountQuestion,
  'multiple-choice': MultipleChoiceQuestion,
  numerical: MultipleChoiceQuestion,
  matching: MultipleChoiceQuestion,
  drag: DragGroupQuestion,
  clock: ClockQuestion,
  'shape-touch': ShapeTouchQuestion,
  'fraction-slice': FractionSliceQuestion,
  'chart-build': ChartBuildQuestion,
}