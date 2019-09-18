import React from 'react'
import { AST, Beta, Expansion, NormalEvaluator, ASTReduction, Alpha } from 'lambdulus-core'

import '../styles/Step.css'

import { Breakpoint, StepRecord, _Evaluator, strategyToEvaluator } from './Evaluator'
import ReactPrinter from './ReactPrinter'
import ReductionMessage from './ReductionMessage'
import { EvaluationStrategy, } from '../App';


interface StepProperties {
  stepRecord : StepRecord
  breakpoints : Array<Breakpoint>
  addBreakpoint (breakpoint : Breakpoint) : void
  children : JSX.Element
  strategy : EvaluationStrategy
}

export default function Step (props : StepProperties) : JSX.Element | null {
  const { stepRecord, addBreakpoint, breakpoints, children, strategy } = props
  const { ast : tree, lastReduction, step, message } = stepRecord

  if (tree === null) {
    return null
  }

  // TODO: tohle se musi fixnout
  // validni redex se musi dostat ze statu a ne si ho tedka vymyslet sam

  // let redex : AST | null  = null
  const evaluator : _Evaluator = new (strategyToEvaluator(strategy) as any)(tree)
  const reduction : ASTReduction = evaluator.nextReduction
  // if (normal.nextReduction instanceof Beta) {
  //   redex = normal.nextReduction.redex
  // }
  
  // if (normal.nextReduction instanceof Expansion) {
  //   redex = normal.nextReduction.target
  // }

  // if (normal.nextReduction instanceof Alpha) {
    
  // }

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