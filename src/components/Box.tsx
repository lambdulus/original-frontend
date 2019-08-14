import React from 'react'

import Evaluator, { EvaluationState } from './Evaluator'
import MacroDefinition, { MacroDefinitionState } from './MacroDefinition'
import Note, { NoteState } from './Note'
import { EvaluationStrategy } from '../App'


// TODO: rename EXPRESSION, MACRO, NOTE
export enum BoxType {
  expression,
  macro,
  note
}

export type BoxState = EvaluationState | MacroDefinitionState | NoteState

interface BoxProperties {
  state : BoxState
  globalStrategy : EvaluationStrategy
  isActive : boolean

  setBoxState (state : BoxState) : void
  makeActive () : void
  // removeExpression () : void // not yet
}

export default function Box (props : BoxProperties) : JSX.Element {
  const { state, isActive, setBoxState, makeActive } : BoxProperties = props
  const { type } = state

  if (type === BoxType.expression) {
    return (
      <div className=''>
        <Evaluator
          state={ state as EvaluationState }
          globalStrategy={ props.globalStrategy }
          isActive={ isActive }
          
          setBoxState={ setBoxState }
          makeActive={ props.makeActive }
        />
      </div>
    )
  }

  if (type === BoxType.macro) {
    return (
      <div className=''>
        <MacroDefinition state={ state as MacroDefinitionState } />
      </div>
    )
  }

  if (type === BoxType.note) {
    return (
      <div className=''>
        <Note
          state={ state as NoteState }
          isActive={ isActive }

          setBoxState={ setBoxState }
          makeActive={ props.makeActive }
        />
      </div>
    )
  }

  return null as any // never happens
}