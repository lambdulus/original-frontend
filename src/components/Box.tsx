import React from 'react'

import { MacroMap } from '@lambdulus/core'

import Evaluator from './ExpressionBox'
import MacroDefinition from './MacroDefinition'
import Note from './Note'
import { MacroTableContext } from './EvaluatorSpace'
import { SetBoxContext } from './BoxSpace'
import { BoxState, BoxType, EvaluationState, MacroDefinitionState, NoteState } from '../AppTypes'


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