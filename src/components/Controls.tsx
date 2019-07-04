import React from 'react'

import './ControlsStyle.css'


export interface ControlsProps {
  onRun () : void
  onStop () : void
  onStep () : void
  onClear () : void
  isRunning : boolean
  isActive : boolean
  makeActive () : void
  isExercise : boolean
  makeExercise () : void
  endExercise () : void
}

export default function Controls (props : ControlsProps) : JSX.Element {
  const {
    onRun,
    onStop,
    onStep,
    onClear,
    isRunning,
    isActive,
    makeActive,
    isExercise,
    makeExercise,
    endExercise,
  } : ControlsProps = props
  
  return (
    <div id="controls">

      {/* {
        isRunning ?
        <i
          className="enabled fas fa-pause"
          onClick={ onStop }
        />
          :
        <i
          className="enabled fas fa-forward"
          onClick={ onRun }
        />  
      } */}

      {/* <button
        className='controlButton'
        
        disabled={ false }
      >
        { isRunning ? 'STOP' : 'RUN' }
      </button> */}
      {/* <button className='controlButton' onClick={ onStep } disabled={ isRunning }>STEP</button> */}
      {/* {
        isRunning ?
        <i
          className="disabled fas fa-play"
          onClick={ () => {} }
        />
          :
        <i
          className="enabled fas fa-play"
          onClick={ onStep }
        />
      }

      {
        isRunning ?
        <i
          className="disabled fas fa-redo-alt"
          onClick={ () => {} }
        />
          :
        <i
          className="enabled fas fa-redo-alt"
          onClick={ onClear }
        />
      } */}
      {
        isActive ?
          (
            <div className='badge'>
              active
            </div>
          )
          :
          (<div
            className='badge makeBadge'
            onClick={ makeActive }
          >
            make active
          </div>)
      }
      {
        isExercise ?
          (
            <div
              className='badge makeBadge'
              onClick={ endExercise }
            >
              end exercise
            </div>
          )
          :
          (<div
            className='badge makeBadge'
            onClick={ makeExercise }
          >
            make exercise
          </div>)
      }
      
      
      {/* <i
        className="fas fa-redo-alt fa-2x"
        onClick={ onClear }
       />

      <button className='controlButton' onClick={ onClear } disabled={ isRunning }>CLEAR</button> */}
    </div>
  )
}