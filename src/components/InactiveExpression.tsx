import React, { useContext } from 'react'

import Step from './Step'
import { AddBoxContext } from './MethodInjector'
import { Breakpoint, StepRecord, EvaluationState, BoxState } from '../AppTypes'
import { DeleteBox, MakeActiveContext } from './BoxSpace'

interface InactiveExpressionProps {
  className : string
  breakpoints : Array<Breakpoint>
  history : Array<StepRecord>

  createBoxFrom (stepRecord : StepRecord) : EvaluationState
}


export default function InactiveExpression (props : InactiveExpressionProps) : JSX.Element {
  const { className } = props
  const deleteBox = useContext(DeleteBox)
  const makeActive = useContext(MakeActiveContext)

  return (
    <div className={ className + ' inactiveBox' } onDoubleClick={ makeActive } >
      <i className='removeBox far fa-trash-alt' onClick={ deleteBox } />
      <ul className='UL'>
        <li key={ 0 } className='activeStep LI'>
          <Step
            breakpoints={ props.breakpoints }
            addBreakpoint={ () => {} } // blank function - NOOP
            stepRecord={ props.history[0] }
            lastStep={ false }
          >
            
            <AddBoxContext.Consumer>
              {
                (addBox : (boxState : BoxState) => void) => <i
                  className="hiddenIcon fas fa-pencil-alt"
                  onClick={ () => addBox(props.createBoxFrom(props.history[0])) }
                />
              }
            </AddBoxContext.Consumer>
            
          </Step>
        </li>
      </ul>
      <p className='inactiveMessage'>
        Collapsing { props.history.length - 1 } { props.history.length === 2 ? 'step' : 'steps' }. Double click to activate this box.
      </p>
    </div>
  )
}