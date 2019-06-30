import React from 'react'
import Box, { BoxState } from './Box';
import { EvaluationState } from './Evaluator';


export interface EvaluatorProperties {
  submittedExpressions : Array<BoxState>
  updateState (state : BoxState, index : number) : void
  removeExpression (index : number) : void
}

export default function EvaluatorSpace (props: EvaluatorProperties) : JSX.Element {
  const { submittedExpressions, updateState, removeExpression } = props

  return (
    <ul className='evaluatorSpace'>
        { submittedExpressions.map((state : BoxState, i : number) =>
          <li key={ state.__key }>
            <Box
              state={ state }
              updateState={ (state : EvaluationState) => updateState(state, i) }
              removeExpression={ () => removeExpression(i) }
            />
          </li>
          ) }
      </ul>
  )
}