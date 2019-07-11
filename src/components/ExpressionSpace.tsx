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
}

export default function EvaluatorSpace (props: EvaluatorProperties) : JSX.Element {
  const { submittedExpressions, updateState, removeExpression, activeBox, makeActive } = props

  return (
    <div className='evaluatorSpace'>
      {
        submittedExpressions.length ?
          <ul className='evaluatorList'>
            { submittedExpressions.map((state : BoxState, i : number) =>
              <li key={ state.__key }>
                <Box
                  state={ state }
                  updateState={ (state : EvaluationState) => updateState(state, i) }
                  removeExpression={ () => removeExpression(i) }
                  editExpression={ props.editExpression }
                  isActive={ i === activeBox }
                  makeActive={ () => makeActive(i) }
                  editor={ props.editor }
                />
              </li>
              ) }
          </ul>
          :
          null
      }
    </div>
  )
}