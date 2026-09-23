// Registry that maps a wire question type to its interactive component.
// Plain data file: components stay in the .jsx files, this map only imports
// them (same pattern as data/mathQuestionTypes.js). shared-choice types
// (multiple-choice / true-false / fact-myth / scenario) reuse one component.

import MultipleChoiceQuestion from '../components/social/renderers/MultipleChoiceQuestion'
import ImageChoiceQuestion from '../components/social/renderers/ImageChoiceQuestion'
import MatchingQuestion from '../components/social/renderers/MatchingQuestion'
import OrderingQuestion from '../components/social/renderers/OrderingQuestion'
import MapQuestion from '../components/social/renderers/MapQuestion'
import FillBlankQuestion from '../components/social/renderers/FillBlankQuestion'

export const QUESTION_RENDERERS = {
  'multiple-choice': MultipleChoiceQuestion,
  'true-false': MultipleChoiceQuestion,
  'fact-myth': MultipleChoiceQuestion,
  scenario: MultipleChoiceQuestion,
  'image-choice': ImageChoiceQuestion,
  matching: MatchingQuestion,
  ordering: OrderingQuestion,
  'image-map': MapQuestion,
  'fill-blank': FillBlankQuestion,
}