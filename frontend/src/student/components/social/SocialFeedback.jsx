import React from 'react'

// Shared feedback + action panels for the World Explorer gameplay surfaces
// (SocialWorld and SocialDaily). One consistent teaching flow:
//   correct -> cheer + "why you're right"
//   wrong    -> "Let's explore this again" + Try Again / Show me how
//   reveal   -> step-by-step explanation + try again / move on
//   complete -> world finished + next world unlocked
const SocialFeedback = ({
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
      <div className="soc-feedback soc-feedback-complete" role="status" aria-live="polite">
        <span className="soc-fb-burst" aria-hidden="true" />
        <span className="soc-fb-burst soc-fb-burst-two" aria-hidden="true" />
        <div>
          <strong>
            {finalWorld ? 'You travelled the whole world — amazing!' : `${worldNameEn} explored — ${completeNextName} is unlocked!`}
          </strong>
          <p className="soc-fb-explanation">
            {finalWorld
              ? 'You explored every world of the World Explorer. Come back any time to wander again.'
              : `Every stop in ${worldNameEn} is done. The trail now opens ahead — ${completeNextName} is waiting for you.`}
          </p>
        </div>
        <div className="soc-actions">
          <button type="button" className="soc-btn soc-btn-ghost" onClick={onMap}>
            Back to the World Explorer
          </button>
          {!finalWorld && (
            <button type="button" className="soc-btn soc-btn-primary" onClick={onCompleteContinue}>
              {completeContinueLabel || `Continue to ${completeNextName} →`}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (status === 'retry') {
    return (
      <div className="soc-feedback soc-feedback-retry" role="status" aria-live="polite">
        <div>
          <strong>Let&apos;s explore this again.</strong>
          <p>
            Look at the {worldNameEn} once more — the pictures, the map, the words. No one is keeping score; every try
            teaches you something new.
          </p>
        </div>
        <div className="soc-actions">
          <button type="button" className="soc-btn soc-btn-primary" onClick={onTryAgain}>
            Try Again
          </button>
          <button type="button" className="soc-btn soc-btn-ghost" onClick={onShowExplanation}>
            Show me how
          </button>
        </div>
      </div>
    )
  }

  if (status === 'reveal') {
    return (
      <div className="soc-feedback soc-feedback-reveal" role="status" aria-live="polite">
        <div>
          <strong>Here&apos;s the step-by-step:</strong>
          {explanation && <p className="soc-fb-explanation">{explanation}</p>}
          <p className="soc-fb-hint">Then try tapping a fresh answer — you&apos;ve got this.</p>
        </div>
        <div className="soc-actions">
          <button type="button" className="soc-btn soc-btn-ghost" onClick={onTryAgain}>
            Try the answer again
          </button>
          <button type="button" className="soc-btn soc-btn-primary" onClick={onNext}>
            {nextLabel}
          </button>
        </div>
      </div>
    )
  }

  if (status === 'correct') {
    return (
      <div className="soc-feedback soc-feedback-correct" role="status" aria-live="polite">
        <span className="soc-fb-burst" aria-hidden="true" />
        <div>
          <strong>You did it — that&apos;s how {worldNameEn} works!</strong>
          {explanation && <p className="soc-fb-explanation">{explanation}</p>}
        </div>
        <div className="soc-actions">
          {!singleAction && (
            <button type="button" className="soc-btn soc-btn-ghost" onClick={onMap}>
              Back to the World Explorer
            </button>
          )}
          <button type="button" className="soc-btn soc-btn-primary" disabled={reporting} onClick={onNext}>
            {reporting ? 'Saving…' : nextLabel}
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default SocialFeedback