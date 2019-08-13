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
  Token,
  tokenize,
  parse,
} from "lambdulus-core"

// import './EvaluatorStyle.css'

import Controls from './Controls'
import Step from './Step'
import { mapLeftFromTo } from '../misc'
import { BoxType } from './Box'
import { EvaluationStrategy, PromptPlaceholder } from '../App'
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
    this.onContent = this.onContent.bind(this)
    this.onSubmitExpression = this.onSubmitExpression.bind(this)
    this.parseExpression = this.parseExpression.bind(this)
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

                  onContent={ this.onContent } // fn
                  onEnter={ this.onSubmitExpression } // fn // tohle asi bude potreba
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

          onContent={ this.onContent } // fn
          onEnter={ this.onSubmitExpression } // fn // tohle asi bude potreba
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

  onContent (content : string, caretPosition : number) : void {
    const { state, setBoxState } = this.props

    setBoxState({
      ...state,
      editor : {
        ...state.editor,
        content,
        caretPosition,
        syntaxError : null,
      }
    } )
    // this.updateURL(expression) // tohle musim nejak vyresit - mozna ta metoda setBoxState v APP bude checkovat propisovat do URL
  }

  onSubmitExpression () : void {
    const { state, setBoxState } = this.props
    // TODO: maybe cancel and clear URL only after succsessful parsing
    // this.cancelUpdate() // deal with it later
    
    const {
      editor : { content },
    } = state

    // window.location.hash = encodeURI(expression)
    // history.pushState({}, "", "#" + encodeURI(expression)) // TODO: deal with later

    try {
      const ast : AST = this.parseExpression(content)
      // history.pushState({}, "", "#" + encodeURI('')) // // TODO: later

      setBoxState({
        ...state,
        ast,
        expression : content,
        history : [ {
          ast : ast.clone(),
          lastReduction : None,
          step : 0,
          message : '',
          isNormalForm : false
        } ],
        editor : {
          content : '',
          caretPosition : 0,
          placeholder : PromptPlaceholder.EVAL_MODE,
          syntaxError : null,
        }
      })

    } catch (exception) {
      // this.updateURL(expression) // TODO: later

      setBoxState({
        ...state,
        editor : {
          ...state.editor,
          syntaxError : null,
        }
      })
    }
  }

  // THROWS Exceptions
  parseExpression (expression : string) : AST {
    // const { macroTable } : AppState = this.state
    const { singleLetterNames : singleLetterVars } = this.props.state

    const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ'], singleLetterVars })
    const ast : AST = parse(tokens, {}) // TODO: fix macros - Context API

    return ast
  }
}