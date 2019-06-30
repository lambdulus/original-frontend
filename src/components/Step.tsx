import React from 'react'

import { AST, Beta, Expansion, NormalEvaluator } from 'lambdulus-core';

import './StepStyle.css'
import { Breakpoint } from './Evaluator'
import ReactPrinter from './ReactPrinter';


interface StepProperties {
  tree : AST | null
  breakpoints : Array<Breakpoint>
  addBreakpoint (breakpoint : Breakpoint) : void
}

export default function Step (props : StepProperties) : JSX.Element | null {
  const { tree, addBreakpoint, breakpoints } = props

  if (tree === null) {
    return null
  }

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
      { printer.print() }
    </span>
  )
}