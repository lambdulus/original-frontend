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

      {
        isRunning ?
        <i
          className="enabled fas fa-pause fa-2x"
          onClick={ onStop }
        />
          :
        <i
          className="enabled fas fa-forward fa-2x"
          onClick={ onRun }
        />  
      }

      {/* <button
        className='controlButton'
        
        disabled={ false }
      >
        { isRunning ? 'STOP' : 'RUN' }
      </button> */}
      {/* <button className='controlButton' onClick={ onStep } disabled={ isRunning }>STEP</button> */}
      {
        isRunning ?
        <i
          className="disabled fas fa-play fa-2x"
          onClick={ () => {} }
        />
          :
        <i
          className="enabled fas fa-play fa-2x"
          onClick={ onStep }
        />
      }

      {
        isRunning ?
        <i
          className="disabled fas fa-redo-alt fa-2x"
          onClick={ () => {} }
        />
          :
        <i
          className="enabled fas fa-redo-alt fa-2x"
          onClick={ onClear }
        />
      }
      {/* <i
        className="fas fa-redo-alt fa-2x"
        onClick={ onClear }
       />

      <button className='controlButton' onClick={ onClear } disabled={ isRunning }>CLEAR</button> */}
    </div>
  )
}