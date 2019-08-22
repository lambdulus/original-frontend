import React from 'react'

import Evaluator, { EvaluationState } from './Evaluator'
import MacroDefinition, { MacroDefinitionState } from './MacroDefinition'
import Note, { NoteState } from './Note'
import { EvaluationStrategy } from '../App'
import { MacroMap } from 'lambdulus-core'


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
  macroTable : MacroMap

  setBoxState (state : BoxState) : void
  makeActive () : void
  addBox (boxState : BoxState) : void
  defineMacro (name : string, definition : string) : void
  // removeExpression () : void // not yet
}

export default function Box (props : BoxProperties) : JSX.Element {
  const { state, isActive, macroTable, setBoxState, makeActive, addBox, defineMacro } : BoxProperties = props
  const { type } = state

  if (type === BoxType.expression) {
    return (
      <div className=''>
        <Evaluator
          state={ state as EvaluationState }
          globalStrategy={ props.globalStrategy }
          isActive={ isActive }
          macroTable={ macroTable }
          
          setBoxState={ setBoxState }
          makeActive={ props.makeActive }
          addBox={ addBox }
        />
      </div>
    )
  }

  if (type === BoxType.macro) {
    return (
      <div className=''>
        <MacroDefinition
          state={ state as MacroDefinitionState }
          setBoxState={ setBoxState }

          addBox={ addBox }
          defineMacro={ defineMacro }
        />
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
          addBox={ addBox }
        />
      </div>
    )
  }

  return null as any // never happens
}