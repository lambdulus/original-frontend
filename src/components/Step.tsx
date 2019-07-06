import React from 'react'

import { AST, Beta, Expansion, NormalEvaluator, ASTReduction } from 'lambdulus-core';

import './StepStyle.css'
import { Breakpoint, StepRecord } from './Evaluator'
import ReactPrinter from './ReactPrinter';
import ReductionMessage from './ReductionMessage';


interface StepProperties {
  stepRecord : StepRecord
  breakpoints : Array<Breakpoint>
  addBreakpoint (breakpoint : Breakpoint) : void
  children : JSX.Element
}

export default function Step (props : StepProperties) : JSX.Element | null {
  const { stepRecord, addBreakpoint, breakpoints, children } = props
  const { ast : tree, lastReduction, step, message } = stepRecord

  if (tree === null) {
    return null
  }

  // TODO: tohle se musi fixnout
  // validni redex se musi dostat ze statu a ne si ho tedka vymyslet sam

  let redex : AST | null  = null
  const normal : NormalEvaluator = new NormalEvaluator(tree)
  
  if (normal.nextReduction instanceof Beta) {
    redex = normal.nextReduction.redex
  }
  
  if (normal.nextReduction instanceof Expansion) {
    redex = normal.nextReduction.target
  }

  const printer : ReactPrinter = new ReactPrinter(tree, addBreakpoint, redex, breakpoints)

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