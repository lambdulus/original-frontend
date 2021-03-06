import React, { useContext } from 'react'

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

  const macroTable = useContext(MacroTableContext)
  const setBoxState = useContext(SetBoxContext)


  if (type === BoxType.EXPRESSION) {
    return (
      <div className=''>
        <Evaluator
          state={ state as EvaluationState }
          isActive={ isActive }
          macroTable={ macroTable }
          
          setBoxState={ setBoxState }
        />
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

          // addBox={ addBox }
        />
      </div>
    )
  }

  return null as any // never happens
}