import React from 'react'
import { ASTReduction, Beta, Alpha, Expansion } from '@lambdulus/core';
import { Eta } from '@lambdulus/core/dist/reductions/eta';


interface ReductionMessageProperties {
  lastReduction : ASTReduction | null
}

export default function ReductionMessage (props : ReductionMessageProperties) : JSX.Element {
  const { lastReduction } = props

  if (lastReduction === null) {
    return null as any
  }

  if (lastReduction instanceof Beta) {
    return (
      <p className='lastReduction'>
        β reduction
      </p>
    )
  }

  if (lastReduction instanceof Alpha) {
    return (
      <p className='lastReduction'>
        α conversion
      </p>
    )
  }

  if (lastReduction instanceof Expansion) {
    return (
      <p className='lastReduction'>
        Macro expansion
      </p>
    )
  }

  if (lastReduction instanceof Eta) {
    return (
      <p className='lastReduction'>
        η conversion
      </p>
    )
  }

  else {
    return null as any
  }
  
}