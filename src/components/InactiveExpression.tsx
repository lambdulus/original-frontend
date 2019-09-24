import React, { PureComponent } from 'react'

import Step from './Step'
import { AddBoxContext } from './MethodInjector'
import { Breakpoint, StepRecord, EvaluationState, BoxState } from '../AppTypes'

interface InactiveExpressionProps {
  className : string
  breakpoints : Array<Breakpoint>
  history : Array<StepRecord>

  makeActive () : void
  createBoxFrom (stepRecord : StepRecord) : EvaluationState
}


export default class InactiveExpression extends PureComponent<InactiveExpressionProps> {
  render () : JSX.Element {
    const { className } = this.props

    return (
      <div className={ className + ' inactiveBox' } onDoubleClick={ this.props.makeActive } >
          <ul className='UL'>
            <li key={ 0 } className='activeStep LI'>
              <Step
                breakpoints={ this.props.breakpoints }
                addBreakpoint={ () => {} } // blank function - NOOP
                stepRecord={ this.props.history[0] }
                lastStep={ false }
              >
                
                <AddBoxContext.Consumer>
                  {
                    (addBox : (boxState : BoxState) => void) => <i
                      className="hiddenIcon fas fa-pencil-alt"
                      onClick={ () => addBox(this.props.createBoxFrom(this.props.history[0])) }
                    />
                  }
                </AddBoxContext.Consumer>
                
              </Step>
            </li>
          </ul>
          <p className='inactiveMessage'>
            Collapsing { this.props.history.length - 1 } { this.props.history.length === 2 ? 'step' : 'steps' }. Double click to activate this box.
          </p>
        </div>
    )
  }
}