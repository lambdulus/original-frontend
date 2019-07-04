import React, { PureComponent } from 'react'

import { AST, ASTReduction, None, NormalEvaluator, Beta, Lambda, Variable, Expansion, ChurchNumeral, Macro, } from "lambdulus-core";

import './EvaluatorStyle.css'
import Controls from './Controls';
import Step from './Step';
import { mapRightFromTo, mapLeftFromTo } from '../misc'
import { BoxType } from './Box';


export type Breakpoint = {
  type : ASTReduction,
  context : AST,
  broken : Set<AST>,
}

export interface StepRecord {
  ast : AST
  lastReduction : ASTReduction | null
  step : number
}

export interface EvaluationState {
  __key : string
  type : BoxType
  expression : string
  ast : AST
  history : Array<StepRecord>
  steps : number
  isRunning : boolean
  lastReduction : ASTReduction | null
  breakpoints : Array<Breakpoint>
  timeoutID : number | undefined
  timeout : number
  isExercise : boolean
}

export interface EvaluationStatePatch {
  __key? : string
  type? : BoxType
  expression? : string
  ast? : AST
  history? : Array<StepRecord>
  steps? : number
  isRunning? : boolean
  lastReduction? : ASTReduction | null
  breakpoints? : Array<Breakpoint>
  timeoutID? : number | undefined
  timeout? : number
  isExercise? : boolean
}

interface EvaluationProperties {
  state : EvaluationState
  updateState (state : EvaluationStatePatch) : void
  editExpression (ast : AST) : void
  makeActive () : void
  isActive : boolean
}

export default class Evaluator extends PureComponent<EvaluationProperties, EvaluationState> {
  constructor (props : EvaluationProperties) {
    super(props)

    this.onClear = this.onClear.bind(this)
    this.onStep = this.onStep.bind(this)
    this.onRun = this.onRun.bind(this)
    this.__onRun = this.__onRun.bind(this)
    this.onStop = this.onStop.bind(this)
    this.shouldBreak = this.shouldBreak.bind(this)
    this.addBreakpoint = this.addBreakpoint.bind(this)
  }

  render () : JSX.Element {
    const { state, updateState } : EvaluationProperties = this.props
    const {
      history,
      steps,
      isRunning,
      lastReduction,
      breakpoints,
      timeoutID,
      isExercise,
    } : EvaluationState = state

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
                >
                  <i
                    className="hiddenIcon fas fa-pencil-alt"
                    onClick={ () => this.props.editExpression(stepRecord.ast) }
                  />
                </Step>
              </li>)
          }
          <li key={history.length - 1} className='activeStep'>
            <Step
              breakpoints={ breakpoints }
              addBreakpoint={ this.addBreakpoint }
              stepRecord={ history[history.length - 1] }
            >
              <i
                className="hiddenIcon fas fa-pencil-alt"
                onClick={ () => this.props.editExpression(history[history.length - 1].ast) }
              />
            </Step>
          </li>
        </ul>
        <Controls
          onRun={ this.onRun }
          onStop={ this.onStop }
          onStep={ this.onStep }
          onClear={ this.onClear }
          isRunning={ isRunning }
          isActive={ this.props.isActive }
          makeActive={ this.props.makeActive }
          isExercise={ isExercise }
          makeExercise={ () => this.props.updateState({ isExercise : true }) }
          endExercise={ () => this.props.updateState({ isExercise : false })  }
        />
      </div>
    )
  }

  onRun () : void {
    const { state, updateState, } : EvaluationProperties = this.props
    const { lastReduction, timeout } = state
  
    if (lastReduction instanceof None) {
      return
    }
  
    updateState({
      isRunning : true,
      timeoutID : window.setTimeout(this.__onRun, timeout),
    })
  }

  __onRun () {
    const { state, updateState } = this.props
    let { history, steps, lastReduction, isRunning, breakpoints, timeoutID, timeout } = state
  
    if ( ! isRunning) {
      return
    }
    
    if (lastReduction instanceof None) {
      updateState({
        isRunning : false,
        timeoutID : undefined,
      })
  
      return
    }
  
    // let ast : AST = history[history.length - 1].clone()
    const { step } = history[history.length - 1] 
    let ast : AST = history[history.length - 1].ast

    const normal : NormalEvaluator = new NormalEvaluator(ast)
  
    lastReduction = normal.nextReduction
    
    if (normal.nextReduction instanceof None) {
      history = [ { ast, lastReduction, step } ]
  
      updateState({
        history,
        steps,
        lastReduction,
        isRunning : false,
        timeoutID : undefined,
      })
  
      return
    }
  
    // TODO: maybe refactor a little
    let index : number = 0
    const breakpoint : Breakpoint | undefined = breakpoints.find(
      (breakpoint : Breakpoint, id) =>
        (index = id,
        this.shouldBreak(breakpoint, normal.nextReduction))
    )
  
    if (breakpoint !== undefined) {
      if (normal.nextReduction instanceof Expansion) {

        breakpoint.broken.add(normal.nextReduction.target)
      }

      window.clearTimeout(timeoutID)
      
      // breakpoints.splice(index, 1)
  
      updateState({
        isRunning : false,
        breakpoints,
        timeoutID : undefined,
      })

      console.log('NEMENIM AST')
  
      return
    }
  
    ast = normal.perform()
    steps++
  
    updateState({
      history : [ { ast, lastReduction, step } ],
      steps,
      lastReduction,
      timeoutID : window.setTimeout(this.__onRun, timeout),
    })
  }

  onStop () : void {
    const { updateState, state } : EvaluationProperties = this.props
    const { timeoutID } = state
  
    window.clearTimeout(timeoutID)
  
    updateState({
      isRunning : false,
      timeoutID : undefined
    })
  }

  onStep () : void {
    const { state, updateState } : EvaluationProperties = this.props
    let { history, steps, lastReduction } = state
  
    if (lastReduction instanceof None) {
      return
    }
  
    let ast = history[history.length - 1].ast.clone()
    // let ast = history[history.length - 1]

    
    const normal : NormalEvaluator = new NormalEvaluator(ast)
  
    lastReduction = normal.nextReduction
  
    if (normal.nextReduction instanceof None) {
      updateState({
        lastReduction,
      })
      
      return
    }
  
    ast = normal.perform()
    steps++
  
    updateState({
      history : [ ...history, { ast, lastReduction, step : steps } ],
      steps,
      lastReduction,
    })
  }

  onClear () : void {
    let { state, updateState } : EvaluationProperties = this.props
  
    updateState({
      history : [ { ast : state.ast.clone(), lastReduction : None, step : 0 } ],
      steps : 0,
      isRunning : false,
      lastReduction : null,
      breakpoints : [],
    })
  }

  addBreakpoint (breakpoint : Breakpoint) : void {
    let { state, updateState } : EvaluationProperties = this.props
  
    updateState({
      breakpoints : [ ...state.breakpoints, breakpoint ],
    })
  }

  shouldBreak (breakpoint : Breakpoint, reduction : ASTReduction) : boolean {
    if (reduction instanceof (breakpoint.type as any)
        && reduction instanceof Beta && breakpoint.context instanceof Lambda
        && reduction.target.identifier === breakpoint.context.body.identifier
      ) {
        return true
    }
    if (reduction instanceof (breakpoint.type as any)
        && reduction instanceof Beta && breakpoint.context instanceof Variable
        && reduction.redex.left instanceof Lambda
        && reduction.redex.left.argument.identifier === breakpoint.context.identifier
        // && ! breakpoint.broken.has(reduction.redex.left.argument)
    ) {
      return true
    }
    if (reduction instanceof (breakpoint.type as any)
        && reduction instanceof Expansion && breakpoint.context instanceof ChurchNumeral
        && reduction.target.identifier === breakpoint.context.identifier
        && ! breakpoint.broken.has(reduction.target)
    ) {
      return true
    }
    if (reduction instanceof (breakpoint.type as any)
        && reduction instanceof Expansion && breakpoint.context instanceof Macro
        && reduction.target.identifier === breakpoint.context.identifier
        && ! breakpoint.broken.has(reduction.target)
    ) {
      return true
    }
  
    return false
  }
}