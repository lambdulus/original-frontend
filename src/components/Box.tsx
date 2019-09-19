import React from 'react'

import Evaluator, { EvaluationState } from './EvaluatorBox'
import MacroDefinition, { MacroDefinitionState } from './MacroDefinition'
import Note, { NoteState } from './Note'
import { MacroTableContext } from '../App'
import { MacroMap } from 'lambdulus-core'


// TODO: rename EXPRESSION, MACRO, NOTE
export enum BoxType {
  EXPRESSION,
  MACRO,
  NOTE
}

export type BoxState = EvaluationState | MacroDefinitionState | NoteState

interface BoxProperties {
  state : BoxState
  isActive : boolean

  setBoxState (state : BoxState) : void
  makeActive () : void
  defineMacro (name : string, definition : string) : void
  // removeExpression () : void // not yet
}

export default function Box (props : BoxProperties) : JSX.Element {
  const { state, isActive, setBoxState, defineMacro } : BoxProperties = props
  const { type } = state

  if (type === BoxType.EXPRESSION) {
    return (
      <div className=''>
        <MacroTableContext.Consumer>
          {
            (macroTable : MacroMap) =>
              <Evaluator
                state={ state as EvaluationState }
                isActive={ isActive }
                macroTable={ macroTable }
                
                setBoxState={ setBoxState }
                makeActive={ props.makeActive }
              />
          }
        </MacroTableContext.Consumer>
      </div>
    )
  }

  if (type === BoxType.MACRO) {
    return (
      <div className=''>
        <MacroDefinition
          state={ state as MacroDefinitionState }
          setBoxState={ setBoxState }

          // addBox={ addBox }
          defineMacro={ defineMacro }
        />
      </div>
    )
  }

  if (type === BoxType.NOTE) {
    return (
      <div className=''>
        <Note
          state={ state as NoteState }
          isActive={ isActive }

          setBoxState={ setBoxState }
          makeActive={ props.makeActive }
          // addBox={ addBox }
        />
      </div>
    )
  }

  return null as any // never happens
}