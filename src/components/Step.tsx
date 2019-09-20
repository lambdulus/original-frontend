import React, { memo } from 'react'
import { ASTReduction } from 'lambdulus-core'

import '../styles/Step.css'

import { strategyToEvaluator } from './EvaluatorBox'
import ReactPrinter from './ReactPrinter'
import ReductionMessage from './ReductionMessage'
import { EvaluationStrategy, StepRecord, Breakpoint, _Evaluator } from '../AppTypes'
import { StrategyContext } from './DataInjector'


interface StepWrapperProperties {
  stepRecord : StepRecord
  breakpoints : Array<Breakpoint>
  addBreakpoint (breakpoint : Breakpoint) : void
  children : JSX.Element
  lastStep : boolean
}

interface StepProperties {
  stepRecord : StepRecord
  breakpoints : Array<Breakpoint>
  addBreakpoint (breakpoint : Breakpoint) : void
  children : JSX.Element
  strategy : EvaluationStrategy
  lastStep : boolean
}

// This is done because of highlighting - if Strategy is changed ->
// old steps should not be re-highlighted with changed Strategy - but stay same
const StepMemo = memo(Step, (props : StepProperties) => !props.lastStep)

export default function StepWrapper (props : StepWrapperProperties) : JSX.Element {
  return(
    <StrategyContext.Consumer>
      { 
        (strategy : EvaluationStrategy) => <StepMemo { ...props } strategy={ strategy } />
      }
    </StrategyContext.Consumer>
  )
}

function Step (props : StepProperties) : JSX.Element | null {
  const { stepRecord, addBreakpoint, breakpoints, children, strategy } = props
  const { ast : tree, lastReduction, step, message } = stepRecord

  if (tree === null) {
    return null
  }

  const evaluator : _Evaluator = new (strategyToEvaluator(strategy) as any)(tree)
  const reduction : ASTReduction = evaluator.nextReduction
  const printer : ReactPrinter = new ReactPrinter(tree, addBreakpoint, reduction, breakpoints)

  return (
    <span className='step'>
      <ReductionMessage lastReduction={ lastReduction } />
      <div className='inlineblock' >
        <p className='stepNumber' >
          { step } :
        </p>
        { printer.print() }
        { children }
        {
          stepRecord.message === '' ?
            null
            :
            <p className='stepMessage'>
              { stepRecord.message }
            </p>
        }
      </div>
    </span>
  )
}