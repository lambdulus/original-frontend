import React, { PureComponent } from 'react'

import { AST, ASTReduction, None, NormalEvaluator, Beta, Lambda, Variable, Expansion, ChurchNumeral, Macro, } from "lambdulus-core";

import './EvaluatorStyle.css'
import Controls from './Controls';
import Step from './Step';
import { mapRightFromTo, mapLeftFromTo } from '../misc'
import { BoxType } from './Box';
import { EvaluationStrategy } from '../App';


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
  ast : AST
  history : Array<StepRecord>
  // steps : number
  isRunning : boolean
  // lastReduction : ASTReduction | null
  breakpoints : Array<Breakpoint>
  timeoutID : number | undefined
  timeout : number
  isExercise : boolean
  strategy : EvaluationStrategy
  singleLetterNames : boolean
}

export interface EvaluationStatePatch {
  __key? : string
  type? : BoxType
  expression? : string
  ast? : AST
  history? : Array<StepRecord>
  // steps? : number
  isRunning? : boolean
  // lastReduction? : ASTReduction | null
  breakpoints? : Array<Breakpoint>
  timeoutID? : number | undefined
  timeout? : number
  isExercise? : boolean
  strategy? : EvaluationStrategy
  singleLetterNames? : boolean
}

interface EvaluationProperties {
  state : EvaluationState
  updateState (state : EvaluationStatePatch) : void
  editExpression (ast : AST, strategy : EvaluationStrategy, singleLEtterNames : boolean) : void
  makeActive () : void
  isActive : boolean
}

export default class Evaluator extends PureComponent<EvaluationProperties, EvaluationState> {
  constructor (props : EvaluationProperties) {
    super(props)

    this.addBreakpoint = this.addBreakpoint.bind(this)
  }

  render () : JSX.Element {
    const { state, updateState } : EvaluationProperties = this.props
    const {
      __key,
      history,
      isRunning,
      breakpoints,
      isExercise,
      strategy,
      singleLetterNames,
    } : EvaluationState = state

    const stepRecord : StepRecord = history[history.length - 1]

    return (
      <div className='box boxEval'>
        <ul>
          {
            mapLeftFromTo(0, history.length - 2, history, (stepRecord, i) =>
              <li key={ i } className='inactiveStep' >
                <Step
                  breakpoints={ breakpoints }
                  addBreakpoint={ () => {} }
                  stepRecord={ stepRecord }
                  strategy={ strategy }
                >
                  <i
                    className="hiddenIcon fas fa-pencil-alt"
                    onClick={ () => this.props.editExpression(stepRecord.ast, state.strategy, singleLetterNames) }
                  />
                </Step>
              </li>)
          }
          <li key={history.length - 1} className='activeStep'>
            <Step
              breakpoints={ breakpoints }
              addBreakpoint={ this.addBreakpoint }
              stepRecord={ history[history.length - 1] }
              strategy={ strategy }
            >
                <i
                  className="hiddenIcon fas fa-pencil-alt"
                  onClick={ () => this.props.editExpression(history[history.length - 1].ast, state.strategy, singleLetterNames) }
                />
            </Step>
          </li>
        </ul>
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