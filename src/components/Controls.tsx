import React from 'react'

import './ControlsStyle.css'


export interface ControlsProps {
  onRun () : void,
  onStop () : void,
  onStep () : void,
  onClear () : void,
  isRunning : boolean,
}

export default function Controls (props : ControlsProps) : JSX.Element {
  const {
    onRun,
    onStop,
    onStep,
    onClear,
    isRunning,
  } : ControlsProps = props
  
  return (
    <div id="controls">
      <button
        className='controlButton'
        onClick={ () => isRunning ? onStop() : onRun() }
        disabled={ false }
      >
        { isRunning ? 'STOP' : 'RUN' }
      </button>
      <button className='controlButton' onClick={ onStep } disabled={ isRunning }>STEP</button>
      <button className='controlButton' onClick={ onClear } disabled={ isRunning }>CLEAR</button>
    </div>
  )
}