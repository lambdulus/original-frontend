import React from 'react'
import Evaluator, { EvaluationState } from './Evaluator';
import MacroDefinition, { MacroDefinitionState } from './MacroDefinition';
import Note, { NoteState } from './Note';
import { AST } from 'lambdulus-core';


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
  removeExpression () : void
  editExpression (ast : AST) : void
  isActive : boolean
  makeActive () : void

}

export default function Box (props : BoxProperties) : JSX.Element {
  const { state, updateState, isActive } : BoxProperties = props
  const { type } = state

  if (type === BoxType.expression) {
    return (
      <div className=''>
        {/* <div className='evaluationHeader'>
          <i className="icon far fa-trash-alt" onClick={ props.removeExpression } />
          <i className="icon fas fa-pencil-alt" />
          <i className='headerTitle'>Expression added</i>
        </div> */}

        <Evaluator
          state={ state as EvaluationState }
          updateState={ updateState }
          editExpression={ props.editExpression }
          isActive={ isActive }
          makeActive={ props.makeActive }
        />
        {/* <div
          ref={ (el) => {
            if (el && isActive) {
              el.scrollIntoView() // { behavior: "smooth" }
            }

           }}
        /> */}
      </div>
    )
  }

  if (type === BoxType.macro) {
    return (
      <div className=''>
        {/* <div className='macroHeader'>
          <i className="icon far fa-trash-alt" onClick={ props.removeExpression } />
          <i className="icon fas fa-pencil-alt" />
          <i className='headerTitle'>Macro defined</i>
        </div> */}
        <MacroDefinition state={ state as MacroDefinitionState } />
      </div>
    )
  }

  if (type === BoxType.note) {
    return (
      <div className=''>
        {/* <div className='noteHeader'>
          <i className="icon far fa-trash-alt" onClick={ props.removeExpression } />
          <i className="icon fas fa-pencil-alt" />
          <i className='headerTitle'>Note added</i>
        </div> */}
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