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

interface EvaluatorProperties {
  ast : AST
  // macroTable : MacroMap
  // singleLetterVars : boolean
}

interface State {
  history : Array<AST>
  steps : number
  isStepping : boolean
  isRunning : boolean
  lastReduction : ASTReduction | null
  breakpoints : Array<Breakpoint>
}

export default class Evaluator extends Component<EvaluatorProperties, State> {
  constructor (props : EvaluatorProperties) {
    super(props)

    this.__onRun = this.__onRun.bind(this)
    this.onRun = this.onRun.bind(this)
    this.onStop = this.onStop.bind(this)
    this.onStep = this.onStep.bind(this)
    this.onClear = this.onClear.bind(this)
    this.shouldBreak = this.shouldBreak.bind(this)
    this.addBreakpoint = this.addBreakpoint.bind(this)

    const { ast } = props

    this.state = {
      history : [ ast ],
      steps : 0,
      isStepping : false,
      isRunning : false,
      lastReduction : null,
      breakpoints : []
    }
  }

  render () : JSX.Element {
    const { history, steps, isStepping, isRunning, lastReduction, breakpoints } : State = this.state


    return (
      <div className='evaluator'>
        <Controls
          onRun={ this.onRun }
          onStop={ this.onStop }
          onStep={ this.onStep }
          onClear={ this.onClear }
          isRunning={ isRunning }
        />

        <ul>
          <li key={history.length - 1} className='activeStep'>
            <Step addBreakpoint={ this.addBreakpoint } tree={ history[history.length - 1] } />
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

  __onRun () {
    let { history, steps, lastReduction, isRunning, breakpoints } = this.state
    
    if ( ! isRunning) {
      return
    }
    
    if (lastReduction instanceof None) {
      this.setState({
        ...this.state,
        isRunning : false
      })

      return
    }

    let ast : AST = history[history.length - 1].clone()
    const normal : NormalEvaluator = new NormalEvaluator(ast)
  
    lastReduction = normal.nextReduction
    
    if (normal.nextReduction instanceof None) {
      history = [ ast ]

      this.setState({
        ...this.state,
        history,
        steps,
        lastReduction,
        isStepping : false,
        isRunning : false,
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
      breakpoints.splice(index, 1)

      this.setState({
        ...this.state,
        isRunning : false,
        isStepping : false,
        breakpoints,
      })

      return
    }
    //
  
    ast = normal.perform()
    steps++

    this.setState({
      ...this.state,
      history : [ ast ],
      steps,
      lastReduction,
    })

    window.setTimeout(this.__onRun, 10)  
  }

  onRun () : void {
    const { lastReduction } : State = this.state

    if (lastReduction instanceof None) {
      return
    }

    this.setState({
      ...this.state,
      isRunning : true,
      isStepping : true,
    },
    () => window.setTimeout(this.__onRun, 5))
  }

  onStop () : void {
    this.setState({
      ...this.state,
      isStepping : true,
      isRunning : false,
    })
  }

  onStep () : void {
    let { history, steps, lastReduction } = this.state
    
    if (lastReduction instanceof None) {
      return
    }

    let ast = history[history.length - 1].clone()

    const normal : NormalEvaluator = new NormalEvaluator(ast)

    lastReduction = normal.nextReduction

    if (normal.nextReduction instanceof None) {
      this.setState({ ...this.state, isStepping : false, lastReduction })
      return
    }
  
    ast = normal.perform()
    steps++

    this.setState({
      ...this.state,
      history : [ ...history, ast ],
      steps,
      isStepping : true,
      lastReduction,
    })
  }

  onClear () : void {
    this.setState({
      history : [ this.props.ast ],
      steps : 0,
      isStepping : false,
      isRunning : false,
      lastReduction : null,
      breakpoints : [],
    })
  }

  addBreakpoint (breakpoint : Breakpoint) : void {
    this.setState({
      ...this.state,
      breakpoints : [ ...this.state.breakpoints, breakpoint ],
    })
  }
}