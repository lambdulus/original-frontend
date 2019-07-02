import React from 'react'
import Box, { BoxState } from './Box';
import { EvaluationState } from './Evaluator';
import { AST } from 'lambdulus-core';


export interface EvaluatorProperties {
  submittedExpressions : Array<BoxState>
  updateState (state : BoxState, index : number) : void
  removeExpression (index : number) : void
  editExpression (ast : AST) : void
}

export default function EvaluatorSpace (props: EvaluatorProperties) : JSX.Element {
  const { submittedExpressions, updateState, removeExpression } = props

  return (
    <div className='evaluatorSpace'>
      {
        submittedExpressions.length ?
          <ul>
            { submittedExpressions.map((state : BoxState, i : number) =>
              <li key={ state.__key }>
                <Box
                  state={ state }
                  updateState={ (state : EvaluationState) => updateState(state, i) }
                  removeExpression={ () => removeExpression(i) }
                  editExpression={ props.editExpression }
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