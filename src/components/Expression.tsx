import React, { PureComponent } from 'react'

import Controls from './Controls'
import Step from './Step'
import { PromptPlaceholder, EvaluationState, Breakpoint, StepRecord, BoxState } from '../AppTypes'
import { mapLeftFromTo } from '../misc'
import Editor from './Editor'
import { AddBoxContext } from './MethodInjector'
import { DeleteBox } from './BoxSpace'


interface EvaluatorProps {
  className : string
  isExercise : boolean
  state : EvaluationState
  breakpoints : Array<Breakpoint>
  history : Array<StepRecord>
  editor : {
    placeholder : string
    content : string
    caretPosition : number
    syntaxError : Error | null
  }
  isNormalForm : boolean

  createBoxFrom (stepRecord : StepRecord) : EvaluationState
  setBoxState (state : EvaluationState) : void
  onContent (content : string, caretPosition : number) : void
  onEnter () : void
  onExecute () : void
}

export default class Expression extends PureComponent<EvaluatorProps> {
  constructor (props : EvaluatorProps) {
    super(props)

    this.addBreakpoint = this.addBreakpoint.bind(this)
  }

  render () : JSX.Element {
    const { className, isExercise, state, editor } = this.props

    const {
      placeholder,
      content,
      caretPosition,
      syntaxError,
    } = editor

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
        <DeleteBox.Consumer>
          {
           (deleteBox : () => void) =>
            <i className='removeBox far fa-trash-alt' onClick={ deleteBox } title='Remove this Box' />
          }
        </DeleteBox.Consumer>

        <AddBoxContext.Consumer>
          {
            (addBox : (boxState : BoxState) => void) =>
            <ul className='UL'>
              {
                mapLeftFromTo(0, this.props.history.length - 2, this.props.history, (stepRecord : StepRecord, i : Number) =>
                  <li key={ i.toString() } className='inactiveStep LI' >
                    <Step
                      breakpoints={ this.props.breakpoints }
                      addBreakpoint={ () => {} }
                      stepRecord={ stepRecord }
                      lastStep={ false }
                    >
                      <i
                        className="hiddenIcon fas fa-pencil-alt"
                        title='Copy this to new box'
                        onClick={ () => addBox(this.props.createBoxFrom(stepRecord)) }
                      />
                    </Step>
                  </li>)
              }
              <li key={this.props.history.length - 1} className='activeStep LI'>
                <Step
                  breakpoints={ this.props.breakpoints }
                  addBreakpoint={ this.addBreakpoint }
                  stepRecord={ this.props.history[this.props.history.length - 1] }
                  lastStep={ true }
                >
                    <i
                      className="hiddenIcon fas fa-pencil-alt"
                      title='Copy this to new box'
                      onClick={ () => addBox(this.props.createBoxFrom(this.props.history[this.props.history.length - 1])) }
                    />
                </Step>
              </li>
            </ul>
          }
        </AddBoxContext.Consumer>

        {
          this.props.isNormalForm ?
          null
            :
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