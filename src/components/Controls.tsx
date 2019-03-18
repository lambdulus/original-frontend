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

const buttonStyle = {
  fontSize: '1.5em',
  background: 'none',
  borderStyle: 'none',
	borderBottom: '2px solid navy',
  marginLeft: '5px',
  marginRight: '5px',  
  cursor: 'pointer',
  outline: 'none',
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
      <button style={ buttonStyle } onClick={ run } disabled={ ! canRun } >RUN</button>
      <button style={ buttonStyle } onClick={ stepOver } disabled={ ! canStepOver }>STEP OVER</button>
      <button style={ buttonStyle } onClick={ stepIn } disabled={ true }>STEP IN</button>
      <button style={ buttonStyle } onClick={ stepBack } disabled={ true }>GO BACK</button>
    </div>
  )
}