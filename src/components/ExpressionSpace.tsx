import React from 'react'
import Box, { BoxState } from './Box';
import { EvaluationState } from './Evaluator';
import { AST } from 'lambdulus-core';
import { EvaluationStrategy } from '../App';


export interface EvaluatorProperties {
  submittedExpressions : Array<BoxState>
  updateState (state : BoxState, index : number) : void
  removeExpression (index : number) : void
  editExpression (ast : AST, strategy : EvaluationStrategy, singleLetterNames : boolean) : void
  activeBox : number
  makeActive (index : number) : void
  editor : JSX.Element
  addEmptyExp () : void
  addEmptyNote () : void
  globalStrategy : EvaluationStrategy
  onEnter () : void
  onEditNote (index : number) : void
}

export default function EvaluatorSpace (props: EvaluatorProperties) : JSX.Element {
  const { submittedExpressions, updateState, removeExpression, activeBox, makeActive } = props

  if (submittedExpressions.length === 0) {
    return (
      <div className='evaluatorSpace'>
        <div className='bigEmpty'>
          <div className='emptyC'>
            <p className='plusBtn' onClick={ props.addEmptyExp }><i>+ λ</i></p>
            <p className='plusBtn' onClick={ props.addEmptyExp }><i>+ Macro</i></p>
            <p className='plusBtn' onClick={ props.addEmptyNote }><i>+ MD</i></p>          
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='evaluatorSpace'>
      {
        submittedExpressions.length ?
          <ul className='evaluatorList UL'>
            { submittedExpressions.map((state : BoxState, i : number) =>
              <li className='LI' key={ state.__key }>
                <Box
                  state={ state }
                  updateState={ (state : EvaluationState) => updateState(state, i) }
                  removeExpression={ () => removeExpression(i) }
                  editExpression={ props.editExpression }
                  isActive={ i === activeBox }
                  makeActive={ () => makeActive(i) }
                  editor={ props.editor }
                  globalStrategy={ props.globalStrategy }
                  onEnter={ props.onEnter }
                  onEditNote={ () => props.onEditNote(i) }
                />
              </li>
              ) }
              <div className='smallEmpty'>
                <div className='emptyC'>
                  <p className='plusBtn' onClick={ props.addEmptyExp }><i>+ λ</i></p>
                  <p className='plusBtn' onClick={ props.addEmptyExp }><i>+ Macro</i></p>
                  <p className='plusBtn' onClick={ props.addEmptyNote }><i>+ MD</i></p>
                </div>
              </div>
          </ul>
          :
          null
      }
    </div>
  )
}