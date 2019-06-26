import React, { Component } from 'react'

import { AST, MacroMap, ASTReduction, Token, parse, tokenize, None, NormalEvaluator, Beta, Lambda, Variable, Expansion, ChurchNumber, Macro } from "lambdulus-core";

import './EvaluatorStyle.css'
import Controls from './Controls';
import Step from './Step';
import { mapRightFromTo } from '../misc'


export type Breakpoint = {
  type : ASTReduction,
  context : AST,
}

export interface EvaluationState {
  key : string
  ast : AST
  history : Array<AST>
  steps : number
  isStepping : boolean
  isRunning : boolean
  lastReduction : ASTReduction | null
  breakpoints : Array<Breakpoint>
  timeout : number | undefined
}

interface EvaluationProperties {
  key : string
  ast : AST
  history : Array<AST>
  steps : number
  isStepping : boolean
  isRunning : boolean
  lastReduction : ASTReduction | null
  breakpoints : Array<Breakpoint>
  timeout : number | undefined
  updateState (state : EvaluationState) : void
}

function equalProps (oldProps : EvaluationProperties, newProps : EvaluationProperties) : boolean {
  return (
    oldProps.isRunning === newProps.isRunning
      &&
    oldProps.steps === newProps.steps
  )
} 

export default React.memo(Evaluator, equalProps)

function Evaluator (props : EvaluationProperties) : JSX.Element {
  const {
    history,
    steps,
    isStepping,
    isRunning,
    lastReduction,
    breakpoints,
    timeout,
    updateState,
  } : EvaluationProperties = props

  return (
    <div className='evaluator'>
      <Controls
        onRun={ () => onRun(props) }
        onStop={ () => onStop(props) }
        onStep={ () => onStep(props) }
        onClear={ () => onClear(props) }
        isRunning={ isRunning }
      />

      <ul>
        <li key={history.length - 1} className='activeStep'>
          <Step
            addBreakpoint={ (breakpoint : Breakpoint) => addBreakpoint(props, breakpoint) }
            tree={ history[history.length - 1] }
          />
        </li>
        {
          mapRightFromTo(0, history.length - 2, history, (ast, i) =>
            <li key={ i } className='inactiveStep' >
              <Step addBreakpoint={ () => {} } tree={ ast } />
            </li>)
        }
      </ul>
    </div>
  )
} 

function onRun (props : EvaluationProperties) : void {
  const { lastReduction, updateState } : EvaluationProperties = props

  if (lastReduction instanceof None) {
    return
  }

  updateState({
    ...props,
    isRunning : true,
    isStepping : true,
    timeout : window.setTimeout(() => __onRun({
      ...props,
      isRunning : true,
      isStepping : true,
    }), 10),
  })
}

function onStop (props : EvaluationProperties) : void {
  const { updateState, timeout } : EvaluationProperties = props

  window.clearTimeout(timeout)

  updateState({
    ...props,
    isStepping : false,
    isRunning : false,
    timeout : undefined
  })
}

function onStep (props : EvaluationProperties) : void {
  let { history, steps, lastReduction, updateState } : EvaluationProperties = props
  
  if (lastReduction instanceof None) {
    return
  }

  let ast = history[history.length - 1].clone()

  const normal : NormalEvaluator = new NormalEvaluator(ast)

  lastReduction = normal.nextReduction

  if (normal.nextReduction instanceof None) {
    updateState({
      ...props,
      isStepping : false,
      lastReduction
    })
    
    return
  }

  ast = normal.perform()
  steps++

  updateState({
    ...props,
    history : [ ...history, ast ],
    steps,
    isStepping : true,
    lastReduction,
  })
}

function onClear (props : EvaluationProperties) : void {
  let { updateState } : EvaluationProperties = props

  updateState({
    ...props,
    history : [ props.ast ],
    steps : 0,
    isStepping : false,
    isRunning : false,
    lastReduction : null,
    breakpoints : [],
  })
}

function addBreakpoint (props: EvaluationProperties, breakpoint : Breakpoint) : void {
  let { updateState } : EvaluationProperties = props

  updateState({
    ...props,
    breakpoints : [ ...props.breakpoints, breakpoint ],
  })
}

function shouldBreak (breakpoint : Breakpoint, reduction : ASTReduction) : boolean {
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
  ) {
    return true
  }
  if (reduction instanceof (breakpoint.type as any)
      && reduction instanceof Expansion && breakpoint.context instanceof ChurchNumber
      && reduction.target.identifier === breakpoint.context.identifier
  ) {
    return true
  }
  if (reduction instanceof (breakpoint.type as any)
      && reduction instanceof Expansion && breakpoint.context instanceof Macro
      && reduction.target.identifier === breakpoint.context.identifier
  ) {
    return true
  }

  return false
}

function __onRun (props : EvaluationProperties) {
  let { history, steps, lastReduction, isRunning, breakpoints, updateState } = props
  
  if ( ! isRunning) {
    return
  }
  
  if (lastReduction instanceof None) {
    updateState({
      ...props,
      isRunning : false,
      timeout : undefined,
    })

    return
  }

  let ast : AST = history[history.length - 1].clone()
  const normal : NormalEvaluator = new NormalEvaluator(ast)

  lastReduction = normal.nextReduction
  
  if (normal.nextReduction instanceof None) {
    history = [ ast ]

    updateState({
      ...props,
      history,
      steps,
      lastReduction,
      isStepping : false,
      isRunning : false,
      timeout : undefined,
    })

    return
  }

  // TODO: maybe refactor a little
  let index : number = 0
  const breakpoint : Breakpoint | undefined = breakpoints.find(
    (breakpoint : Breakpoint, id) =>
      (index = id,
      shouldBreak(breakpoint, normal.nextReduction))
  )

  if (breakpoint !== undefined) {
    breakpoints.splice(index, 1)

    updateState({
      ...props,
      isRunning : false,
      isStepping : false,
      breakpoints,
      timeout : undefined,
    })

    return
  }
  //

  ast = normal.perform()
  steps++

  updateState({
    ...props,
    history : [ ast ],
    steps,
    lastReduction,
    timeout : window.setTimeout(() => __onRun({
      ...props,
      history : [ ast ],
      steps,
      lastReduction,
    }), 10),
  })
}