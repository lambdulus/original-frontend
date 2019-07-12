import React from 'react'
import Evaluator, { EvaluationState } from './Evaluator';
import MacroDefinition, { MacroDefinitionState } from './MacroDefinition';
import Note, { NoteState } from './Note';
import { AST } from 'lambdulus-core';
import { EvaluationStrategy } from '../App';


export enum BoxType {
  expression,
  macro,
  note
}

export type BoxState = EvaluationState | MacroDefinitionState | NoteState

interface BoxProperties {
  state : BoxState
  updateState (state : BoxState) : void
  removeExpression () : void
  editExpression (ast : AST, strategy : EvaluationStrategy, singleLetterNames : boolean) : void
  isActive : boolean
  makeActive () : void
  editor : JSX.Element
  globalStrategy : EvaluationStrategy
  onEnter () : void
  onEditNote () : void
}

export default function Box (props : BoxProperties) : JSX.Element {
  const { state, updateState, isActive } : BoxProperties = props
  const { type } = state

  if (type === BoxType.expression) {
    return (
      <div className=''>
        <Evaluator
          state={ state as EvaluationState }
          updateState={ updateState }
          editExpression={ props.editExpression }
          isActive={ isActive }
          makeActive={ props.makeActive }
          editor={ props.editor }
          globalStrategy={ props.globalStrategy }
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
        <Note state={ state as NoteState } onEditNote={ props.onEditNote } editor={ props.editor } isActive={ isActive } onEnter={ props.onEnter } />
      </div>
    )
  }

  return (
    <div>
      I do not know what to do with this yet.
    </div>
  )
}