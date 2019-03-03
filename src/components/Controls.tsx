import React, { FunctionComponent, } from 'react'


export interface ControlProps {
  run () : void,
  stepOver () : void,
  stepIn () : void,
  stepBack () : void,
  canRun : boolean,
  canStepOver : boolean,
  canStepIn : boolean,
  canGoBack : boolean,
}

export default function Controlls (props : ControlProps) : JSX.Element {
  const {
    run,
    stepOver,
    stepIn,
    stepBack,
    canRun,
    canStepOver,
    canStepIn,
    canGoBack,
  } : ControlProps = props
  
  return (
    <div>
      <button onClick={ run } disabled={ ! canRun } >RUN</button>
      <button onClick={ stepOver } disabled={ ! canStepOver }>STEP OVER</button>
      <button onClick={ stepIn } disabled={ ! canStepIn}>STEP IN</button>
      <button onClick={ stepBack } disabled={ !canGoBack }>GO BACK</button>
    </div>
  )
}