// Registry that maps a wire question type to its interactive component.
// Plain data file: components stay in the .jsx files, this map only imports
// them (same pattern as data/socialQuestionTypes.js). shared-choice types
// (multiple-choice / true-false / scenario / predict / compare) reuse one
// component.

import SciMultipleChoice from '../components/science/renderers/SciMultipleChoice'
import SciImageChoice from '../components/science/renderers/SciImageChoice'
import SciMatching from '../components/science/renderers/SciMatching'
import SciOrdering from '../components/science/renderers/SciOrdering'
import SciSort from '../components/science/renderers/SciSort'
import SciMap from '../components/science/renderers/SciMap'
import SciFillBlank from '../components/science/renderers/SciFillBlank'

export const QUESTION_RENDERERS = {
  'multiple-choice': SciMultipleChoice,
  'true-false': SciMultipleChoice,
  scenario: SciMultipleChoice,
  predict: SciMultipleChoice,
  compare: SciMultipleChoice,
  'image-choice': SciImageChoice,
  matching: SciMatching,
  ordering: SciOrdering,
  sort: SciSort,
  'image-map': SciMap,
  'fill-blank': SciFillBlank,
}