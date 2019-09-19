import React from 'react'

import Evaluator, { EvaluationState } from './EvaluatorBox'
import MacroDefinition, { MacroDefinitionState } from './MacroDefinition'
import Note, { NoteState } from './Note'
import { MacroTableContext } from './EvaluatorSpace'
import { MacroMap } from 'lambdulus-core'
import { SetBoxContext } from './BoxSpace';


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

  // removeExpression () : void // not yet
}

export default function Box (props : BoxProperties) : JSX.Element {
  const { state, isActive } : BoxProperties = props
  const { type } = state

  if (type === BoxType.EXPRESSION) {
    return (
      <div className=''>
        <MacroTableContext.Consumer>
          {
            (macroTable : MacroMap) =>
              <SetBoxContext.Consumer>
                {
                  (setBoxState : (boxState : BoxState) => void) =>
                    <Evaluator
                      state={ state as EvaluationState }
                      isActive={ isActive }
                      macroTable={ macroTable }
                      
                      setBoxState={ setBoxState }
                    />
                }
              </SetBoxContext.Consumer>
          }
        </MacroTableContext.Consumer>
      </div>
    )
  }

  if (type === BoxType.MACRO) {
    return (
      <div className=''>
        <SetBoxContext.Consumer>
          {
            (setBoxState : (boxState : BoxState) => void) =>
              <MacroDefinition
                state={ state as MacroDefinitionState }
                setBoxState={ setBoxState }
      
                // addBox={ addBox }
              />
          }
        </SetBoxContext.Consumer>
      </div>
    )
  }

  if (type === BoxType.NOTE) {
    return (
      <div className=''>
        <Note
          state={ state as NoteState }
          isActive={ isActive }

          // addBox={ addBox }
        />
      </div>
    )
  }

  return null as any // never happens
}