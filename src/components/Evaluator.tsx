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

import './EvaluatorStyle.css'
import Controls from './Controls'
import Step from './Step'
import { mapLeftFromTo } from '../misc'
import { BoxType } from './Box'
import { EvaluationStrategy } from '../App'
import { ActionType } from './Editor'


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
    // action : ActionType
  }
}

export interface EvaluationStatePatch {
  __key? : string
  type? : BoxType
  expression? : string
  ast? : AST | null
  history? : Array<StepRecord>
  isRunning? : boolean
  breakpoints? : Array<Breakpoint>
  timeoutID? : number | undefined
  timeout? : number
  isExercise? : boolean
  strategy? : EvaluationStrategy
  singleLetterNames? : boolean
}
// editor patch???

interface EvaluationProperties {
  state : EvaluationState
  updateState (state : EvaluationStatePatch) : void
  editExpression (ast : AST, strategy : EvaluationStrategy, singleLEtterNames : boolean) : void
  makeActive () : void
  isActive : boolean
  editor : JSX.Element
  globalStrategy : EvaluationStrategy
}

export default class Evaluator extends PureComponent<EvaluationProperties> {
  constructor (props : EvaluationProperties) {
    super(props)

    this.addBreakpoint = this.addBreakpoint.bind(this)
  }

  render () : JSX.Element {
    const { state, updateState, isActive, editor } : EvaluationProperties = this.props
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
        // action,
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
                editor
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
                  onClick={ () => this.props.editExpression(history[0].ast, state.strategy, singleLetterNames) }
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
          isRunning={ isRunning }
          isActive={ this.props.isActive }
          makeActive={ this.props.makeActive }
          isExercise={ isExercise }
          makeExercise={ () => this.props.updateState({ isExercise : true }) }
          endExercise={ () => this.props.updateState({ isExercise : false })  }
          strategy={ strategy }
          onStrategy={ (strategy : EvaluationStrategy) => updateState({
            strategy
          })  }
          __key={ __key }
          singleLetterNames={ singleLetterNames }
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
                    onClick={ () => this.props.editExpression(stepRecord.ast, state.strategy, singleLetterNames) }
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
                  onClick={ () => this.props.editExpression(history[history.length - 1].ast, state.strategy, singleLetterNames) }
                />
            </Step>
          </li>
        </ul>

        <Editor
          placeholder={ placeholder } // data
          content={ content } // data
          caretPosition={ caretPosition } // data
          syntaxError={ syntaxError } // data
          isExercise={ isExercise } // data
          // action={ action } // data // tohle pravdepodobne nebude potreba - je znamo co to bude za akci
          isMarkDown={ false } // data

          strategy={ this.state.settings.strategy } // data
          singleLetterNames={ this.state.settings.singleLetterNames } // data

          onContent={ this.onExpression } // fn
          onEnter={ this.onEnter } // fn
          onRun={ this.onRun } // fn
          onReset={ this.onClear } // fn
          onStrategy={ (strategy : EvaluationStrategy) => this.setState({
            ...this.state,
            settings : {
              ...this.state.settings,
              strategy,
            }
          }) }
          onSingleLetterNames={ (enabled : boolean) => this.setState({
            ...this.state,
            settings : {
              ...this.state.settings,
              singleLetterNames : enabled,
            }
          }) }
          onExercise={ (enabled : boolean) => this.setState({
            ...this.state,
            settings : {
              ...this.state.settings,
              isExercise : enabled,
            }
          }) }
          onActionSelect={ (action : ActionType) => this.setState({
            ...this.state,
            editor : {
              ...this.state.editor,
              action,
            }
          }) }
          onActionClick={ () => {
            const { editor : { action } } = this.state

            if (action === ActionType.ENTER_EXPRESSION) {
              this.onEnter()
              return
            }
            if (action === ActionType.NEXT_STEP) {
              this.onStep()
              return
            }
            if (action === ActionType.RUN) {
              // implement
              return
            }
            if (action === ActionType.ENTER_EXERCISE) {
              this.setState({
                ...this.state,
                settings : {
                  ...this.state.settings,
                  isExercise : true,
                }
              }, () => this.onEnter())
            }
            else {
              // implement or delete 
            }
          } }
        />

      </div>
    )
  }

  addBreakpoint (breakpoint : Breakpoint) : void {
    let { state, updateState } : EvaluationProperties = this.props
  
    updateState({
      breakpoints : [ ...state.breakpoints, breakpoint ],
    })
  }
}