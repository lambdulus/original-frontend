import React, { useContext } from 'react'

import { createEmptyExp, createEmptyMacro, createEmptyNote } from './BoxSpace'
import { EvaluationStrategy } from '../AppTypes'
import { AddEmptyBoxContext } from './MethodInjector'
import { StrategyContext, SLIContext } from './DataInjector'


export function CreateBox () : JSX.Element {
  const strategy : EvaluationStrategy = useContext(StrategyContext)
  const singleLetterNames : boolean = useContext(SLIContext)
  const addEmptyBox = useContext(AddEmptyBoxContext)

  return (
    <div className='emptyC'>
      <p
        className='plusBtn inlineblock'
        title='Create new λ expression'
        onClick={ () => addEmptyBox(createEmptyExp(strategy, singleLetterNames)) }
      >
        <i>+ λ</i>
      </p>
      <p
        className='plusBtn inlineblock'
        title='Define new macro'
        onClick={ () => addEmptyBox(createEmptyMacro(singleLetterNames)) }
      >
        <i>+ Macro
        </i></p>
      <p
        className='plusBtn inlineblock'
        title='Write new Markdown note'
        onClick={ () => addEmptyBox(createEmptyNote()) }
      >
        <i>+ MD</i>
      </p>
    </div>
  )
}