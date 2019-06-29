import React from 'react'
import Evaluator, { EvaluationState } from './Evaluator';
import MacroDefinition, { MacroDefinitionState } from './MacroDefinition';
import Note, { NoteState } from './Note';


export enum BoxType {
  expression,
  macro,
  note
}

export type BoxState = EvaluationState | MacroDefinitionState | NoteState

interface BoxProperties {
  state : BoxState
  // children : JSX.Element
  updateState (state : BoxState) : void
  removeExpression() : void
}

export default function Box (props : BoxProperties) : JSX.Element {
  const { state, updateState } : BoxProperties = props
  const { type } = state

  if (type === BoxType.expression) {
    return (
      <div>
        <div className='evaluationHeader'>
          <i className="icon far fa-trash-alt" onClick={ props.removeExpression } />
          <i className="icon fas fa-pencil-alt" />
          <i>Expression added</i>
        </div>

        <Evaluator
          state={ state as EvaluationState }
          updateState={ updateState }
        />
      </div>
    )
  }

  if (type === BoxType.macro) {
    return (
      <div>
        <div className='macroHeader'>
          <i className="icon far fa-trash-alt" onClick={ props.removeExpression } />
          <i className="icon fas fa-pencil-alt" />
          <i>Macro defined</i>
        </div>
        <MacroDefinition state={ state as MacroDefinitionState } />
      </div>
    )
  }

  if (type === BoxType.note) {
    return (
      <div>
        <div className='noteHeader'>
          <i className="icon far fa-trash-alt" onClick={ props.removeExpression } />
          <i className="icon fas fa-pencil-alt" />
          <i>Note added</i>
        </div>
        <Note state={ state as NoteState } />
      </div>
    )
  }

  return (
    <div>
      I do not know what to do with this yet.
    </div>
  )
}