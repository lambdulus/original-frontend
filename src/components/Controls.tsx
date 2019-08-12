import React, { ChangeEvent } from 'react'
const { Switch, Radio } = require('pretty-checkbox-react')


import './ControlsStyle.css'
import { EvaluationStrategy } from '../App';

export interface ControlsProps {
  // __key : string
  // isRunning : boolean
  // isActive : boolean
  // makeActive () : void
  isExercise : boolean
  makeExercise () : void
  endExercise () : void
  // strategy : EvaluationStrategy
  // onStrategy (strategy : EvaluationStrategy) : void
  // singleLetterNames : boolean
}

export default function Controls (props : ControlsProps) : JSX.Element {
  const {
    isExercise,
    makeExercise,
    endExercise,
  } : ControlsProps = props

  return (
    <div id="controls">
      {
        <div>
          {
            <Switch
              className='exerciseSwitch'
              checked={ isExercise }
              onChange={ (e : ChangeEvent<HTMLInputElement>) =>
                e.target.checked ? makeExercise() : endExercise()
              }
              shape="fill"
            >
              Exercise
            </Switch>
          }
        </div>
      }
    </div>
  )
}