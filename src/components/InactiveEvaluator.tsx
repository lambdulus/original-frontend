import React, { PureComponent } from 'react'

import Step from './Step'
import { EvaluationState, StepRecord, Breakpoint } from './EvaluatorBox'
import { BoxState } from './Box'
import { EvaluationStrategy } from '../App'

interface InactiveEvaluatorProps {
  className : string
  breakpoints : Array<Breakpoint>
  history : Array<StepRecord>
  globalStrategy : EvaluationStrategy

  makeActive () : void
  addBox (boxState : BoxState) : void
  createBoxFrom (stepRecord : StepRecord) : EvaluationState
}


export default class InactiveEvaluator extends PureComponent<InactiveEvaluatorProps> {
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
                strategy={ this.props.globalStrategy }
              >
                <i
                  className="hiddenIcon fas fa-pencil-alt"
                  onClick={ () => this.props.addBox(this.props.createBoxFrom(this.props.history[0])) }
                />
              </Step>
            </li>
          </ul>
          <p className='inactiveMessage'>
            Collapsing { history.length - 1 } { history.length === 2 ? 'step' : 'steps' }. Double click to activate this box.
          </p>
        </div>
    )
  }
}