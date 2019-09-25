import React, { ChangeEvent } from 'react'
const { Switch, Radio } = require('pretty-checkbox-react')


import 'pretty-checkbox'
import '../styles/Controls.css'


export interface ControlsProps {
  isExercise : boolean
  makeExercise () : void
  endExercise () : void
}

// TODO: maybe not really needed or rename it accordingly
export default function Controls (props : ControlsProps) : JSX.Element {
  const {
    isExercise,
    makeExercise,
    endExercise,
  } : ControlsProps = props

  return (
    <div id="controls">
      <div title='Write the next step yourself'>
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
      </div>
    </div>
  )
}