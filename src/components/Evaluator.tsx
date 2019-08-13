import React, { PureComponent } from 'react'
import {
  AST,
  ASTReduction,
  None,
  NormalEvaluator,
  Beta,
  Lambda,
  Variable,
  Expansion,
  ChurchNumeral,
  Macro,
} from "lambdulus-core"

// import './EvaluatorStyle.css'

import Controls from './Controls'
import Step from './Step'
import { mapLeftFromTo } from '../misc'
import { BoxType } from './Box'
import { EvaluationStrategy } from '../App'
import Editor, { ActionType } from './Editor'


export type Breakpoint = {
  type : ASTReduction,
  context : AST,
  broken : Set<AST>,
}

export interface StepRecord {
  ast : AST
  lastReduction : ASTReduction | null
  step : number
  message : string
  isNormalForm : boolean
}

export interface EvaluationState {
  __key : string
  type : BoxType
  expression : string
  ast : AST | null
  history : Array<StepRecord>
  isRunning : boolean
  breakpoints : Array<Breakpoint>
  timeoutID : number | undefined
  timeout : number
  isExercise : boolean
  strategy : EvaluationStrategy
  singleLetterNames : boolean
  editor : {
    placeholder : string
    content : string
    caretPosition : number
    syntaxError : Error | null
  }
}

interface EvaluationProperties {
  state : EvaluationState
  globalStrategy : EvaluationStrategy
  isActive : boolean

  setBoxState (state : EvaluationState) : void
  makeActive () : void
}

export default class Evaluator extends PureComponent<EvaluationProperties> {
  constructor (props : EvaluationProperties) {
    super(props)

    this.addBreakpoint = this.addBreakpoint.bind(this)
  }

  render () : JSX.Element {
    const { state, isActive, setBoxState } : EvaluationProperties = this.props
    const {
      __key,
      history,
      isRunning,
      breakpoints,
      isExercise,
      strategy,
      singleLetterNames,
      expression,
      editor : {
        caretPosition,
        content,
        placeholder,
        syntaxError,
      },
    } : EvaluationState = state

    let className : string = 'box boxEval'

    if (expression === '') {
      return (
        <div className={ className + ' inactiveBox' } onDoubleClick={ this.props.makeActive } >
          <p className='emptyStep'>Empty expression box. Write λ expression and hit enter.</p>
          {
            isActive ?
              (
                <Editor
                  placeholder={ placeholder } // data
                  content={ content } // data
                  caretPosition={ caretPosition } // data
                  syntaxError={ syntaxError } // data
                  isMarkDown={ false } // data

                  onContent={ () => {} } // fn
                  onEnter={ () => {} } // fn // tohle asi bude potreba
                  onExecute={ () => {} } // fn // tohle asi bude potreba
                />
              )
              :
              (
                <p className='inactiveMessage'>
                  Collapsing { history.length - 1 } steps. Double click to activate this box.
                </p>
              )
          }
        </div>
      )
    }

    const stepRecord : StepRecord = history[history.length - 1]

    if (isExercise) {
      className += ' boxExercise'
    }

    if ( ! isActive) {
      return (
        <div className={ className + ' inactiveBox' } onDoubleClick={ this.props.makeActive } >
          <ul className='UL'>
            <li key={ 0 } className='activeStep LI'>
              <Step
                breakpoints={ breakpoints }
                addBreakpoint={ () => {} } // blank function - NOOP
                stepRecord={ history[0] }
                strategy={ this.props.globalStrategy }
              >
                <i
                  className="hiddenIcon fas fa-pencil-alt"
                  onClick={ () => {}
                    // TODO: na tohle chci pridat zpet handler - copyExpToNewBox nebo tak neco
                    // this.props.editExpression(history[0].ast, state.strategy, singleLetterNames)
                  }
                />
              </Step>
            </li>
          </ul>
          <p className='inactiveMessage'>
            Collapsing { history.length - 1 } steps. Double click to activate this box.
          </p>
        </div>
      )
    }

    return (
      <div className={ className }>
        <Controls
          isExercise={ isExercise }
          makeExercise={ () =>
            this.props.setBoxState({
              ...state,
              isExercise : true
            })
          }
          endExercise={ () =>
            this.props.setBoxState({
              ...state,
              isExercise : false
            })
          }
        />
        <ul className='UL'>
          {
            mapLeftFromTo(0, history.length - 2, history, (stepRecord : StepRecord, i : Number) =>
              <li key={ i.toString() } className='inactiveStep LI' >
                <Step
                  breakpoints={ breakpoints }
                  addBreakpoint={ () => {} }
                  stepRecord={ stepRecord }
                  strategy={ this.props.globalStrategy }
                >
                  <i
                    className="hiddenIcon fas fa-pencil-alt"
                    onClick={ () => {}
                      // TODO: na tohle chci pridat zpet handler - copyExpToNewBox nebo tak neco
                      // this.props.editExpression(stepRecord.ast, state.strategy, singleLetterNames)
                    }
                  />
                </Step>
              </li>)
          }
          <li key={history.length - 1} className='activeStep LI'>
            <Step
              breakpoints={ breakpoints }
              addBreakpoint={ this.addBreakpoint }
              stepRecord={ history[history.length - 1] }
              strategy={ this.props.globalStrategy }
            >
                <i
                  className="hiddenIcon fas fa-pencil-alt"
                  onClick={ () => {}
                    // TODO: na tohle chci pridat zpet handler - copyExpToNewBox nebo tak neco                    
                    // this.props.editExpression(history[history.length - 1].ast, state.strategy, singleLetterNames)
                  }
                />
            </Step>
          </li>
        </ul>

        <Editor
          placeholder={ placeholder } // data
          content={ content } // data
          caretPosition={ caretPosition } // data
          syntaxError={ syntaxError } // data
          isMarkDown={ false } // data

          onContent={ () => {} } // fn
          onEnter={ () => {} } // fn // tohle asi bude potreba
          onExecute={ () => {} } // fn // tohle asi bude potreba
        />

      </div>
    )
  }

  addBreakpoint (breakpoint : Breakpoint) : void {
    let { state, setBoxState } : EvaluationProperties = this.props
  
    setBoxState({
      ...state,
      breakpoints : [ ...state.breakpoints, breakpoint ],
    })
  }
}