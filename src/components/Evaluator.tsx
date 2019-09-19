import React, { PureComponent } from 'react'

import Controls from './Controls'
import Step from './Step'
import { EvaluationState, StepRecord, Breakpoint } from './EvaluatorBox'
import { PromptPlaceholder, EvaluationStrategy } from '../App'
import { mapLeftFromTo } from '../misc'
import { BoxState } from './Box'
import Editor from './Editor'


interface EvaluatorProps {
  className : string
  isExercise : boolean
  state : EvaluationState
  breakpoints : Array<Breakpoint>
  history : Array<StepRecord>
  globalStrategy : EvaluationStrategy
  editor : {
    placeholder : string
    content : string
    caretPosition : number
    syntaxError : Error | null
  }
  isNormalForm : boolean

  addBox (boxState : BoxState) : void
  createBoxFrom (stepRecord : StepRecord) : EvaluationState
  setBoxState (state : EvaluationState) : void
  // addBreakpoint (breakpoint : Breakpoint) : void
  onContent (content : string, caretPosition : number) : void
  onEnter () : void
  onExecute () : void
}

export default class Evaluator extends PureComponent<EvaluatorProps> {

  render () : JSX.Element {
    const { className, isExercise, state, editor } = this.props

    const {
      placeholder,
      content,
      caretPosition,
      syntaxError,
    } = editor

    // console.log({ history : this.props.history })

    return (
      <div className={ className }>
        <Controls
          isExercise={ isExercise }
          makeExercise={ () =>
            this.props.setBoxState({
              ...state,
              isExercise : true,
              editor: {
                ...state.editor,
                placeholder : PromptPlaceholder.VALIDATE_MODE,
              },
            })
          }
          endExercise={ () =>
            this.props.setBoxState({
              ...state,
              isExercise : false,
              editor: {
                ...state.editor,
                placeholder : PromptPlaceholder.EVAL_MODE,
              },
            })
          }
        />
        <ul className='UL'>
          {
            mapLeftFromTo(0, this.props.history.length - 2, this.props.history, (stepRecord : StepRecord, i : Number) =>
              <li key={ i.toString() } className='inactiveStep LI' >
                <Step
                  breakpoints={ this.props.breakpoints }
                  addBreakpoint={ () => {} }
                  stepRecord={ stepRecord }
                  strategy={ this.props.globalStrategy }
                >
                  <i
                    className="hiddenIcon fas fa-pencil-alt"
                    onClick={ () => this.props.addBox(this.props.createBoxFrom(stepRecord)) }
                  />
                </Step>
              </li>)
          }
          <li key={this.props.history.length - 1} className='activeStep LI'>
            <Step
              breakpoints={ this.props.breakpoints }
              addBreakpoint={ this.addBreakpoint }
              stepRecord={ this.props.history[this.props.history.length - 1] }
              strategy={ this.props.globalStrategy }
            >
                <i
                  className="hiddenIcon fas fa-pencil-alt"
                  onClick={ () => this.props.addBox(this.props.createBoxFrom(this.props.history[this.props.history.length - 1])) }
                />
            </Step>
          </li>
        </ul>

        {
          this.props.isNormalForm ?
            null
            :
            (
              <Editor
                placeholder={ placeholder } // data
                content={ content } // data
                caretPosition={ caretPosition } // data
                syntaxError={ syntaxError } // data
                isMarkDown={ false } // data

                onContent={ this.props.onContent } // fn
                onEnter={ this.props.onEnter } // fn // tohle asi bude potreba
                onExecute={ this.props.onExecute } // fn // tohle asi bude potreba
              />
            )
        }
      </div>
    )
  }

  addBreakpoint (breakpoint : Breakpoint) : void {
    let { state, setBoxState } = this.props
  
    setBoxState({
      ...state,
      breakpoints : [ ...state.breakpoints, breakpoint ],
    })
  }
}