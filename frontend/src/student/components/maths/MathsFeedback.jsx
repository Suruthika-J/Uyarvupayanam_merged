import React from 'react'

// Shared feedback + action panels for the Math Adventure gameplay surfaces
// (TopicWorld and DailyChallenge). One consistent teaching flow:
//   correct -> cheer + "why"
//   wrong    -> "Let's look again together" + Try Again / Show me how
//   reveal   -> step-by-step explanation + try again / move on
//   complete -> world finished + next world unlocked
const MathsFeedback = ({
  status,
  explanation = '',
  worldNameEn = '',
  complete = false,
  completeNextName = '',
  finalWorld = false,
  reporting = false,
  onMap,
  onTryAgain,
  onShowExplanation,
  onNext,
  nextLabel = 'Next world stop →',
  onCompleteContinue,
  completeContinueLabel = '',
  singleAction = false,
}) => {
  if (complete) {
    return (
      <div className="mth-feedback mth-feedback-complete" role="status" aria-live="polite">
        <span className="mth-fb-burst" aria-hidden="true" />
        <span className="mth-fb-burst mth-fb-burst-two" aria-hidden="true" />
        <div>
          <strong>
            {finalWorld ? "You travelled the whole trail — amazing!" : `${worldNameEn} complete — ${completeNextName} is unlocked!`}
          </strong>
          <p className="mth-fb-explanation">
            {finalWorld
              ? 'You finished every world of the Math Adventure. Come back any time to explore again.'
              : `Every stop in ${worldNameEn} is done. The trail now opens ahead — ${completeNextName} is waiting for you.`}
          </p>
        </div>
        <div className="mth-actions">
          <button type="button" className="mth-btn mth-btn-ghost" onClick={onMap}>
            Back to the map
          </button>
          {!finalWorld && (
            <button type="button" className="mth-btn mth-btn-primary" onClick={onCompleteContinue}>
              {completeContinueLabel || `Continue to ${completeNextName} →`}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (status === 'retry') {
    return (
      <div className="mth-feedback mth-feedback-retry" role="status" aria-live="polite">
        <div>
          <strong>Let&apos;s look again together.</strong>
          <p>
            Watch the {worldNameEn} objects once more — how they come together, split into groups, or move. No one is
            keeping score; every try teaches you something.
          </p>
        </div>
        <div className="mth-actions">
          <button type="button" className="mth-btn mth-btn-primary" onClick={onTryAgain}>
            Try Again
          </button>
          <button type="button" className="mth-btn mth-btn-ghost" onClick={onShowExplanation}>
            Show me how
          </button>
        </div>
      </div>
    )
  }

  if (status === 'reveal') {
    return (
      <div className="mth-feedback mth-feedback-reveal" role="status" aria-live="polite">
        <div>
          <strong>Here&apos;s the step-by-step:</strong>
          {explanation && <p className="mth-fb-explanation">{explanation}</p>}
          <p className="mth-fb-hint">Then try tapping a fresh answer — you&apos;ve got this.</p>
        </div>
        <div className="mth-actions">
          <button type="button" className="mth-btn mth-btn-ghost" onClick={onTryAgain}>
            Try the answer again
          </button>
          <button type="button" className="mth-btn mth-btn-primary" onClick={onNext}>
            {nextLabel}
          </button>
        </div>
      </div>
    )
  }

  if (status === 'correct') {
    return (
      <div className="mth-feedback mth-feedback-correct" role="status" aria-live="polite">
        <span className="mth-fb-burst" aria-hidden="true" />
        <div>
          <strong>You did it — that&apos;s how {worldNameEn} works!</strong>
          {explanation && <p className="mth-fb-explanation">{explanation}</p>}
        </div>
        <div className="mth-actions">
          {!singleAction && (
            <button type="button" className="mth-btn mth-btn-ghost" onClick={onMap}>
              Back to the map
            </button>
          )}
          <button type="button" className="mth-btn mth-btn-primary" disabled={reporting} onClick={onNext}>
            {reporting ? 'Saving…' : nextLabel}
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default MathsFeedback