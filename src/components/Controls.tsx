import React from 'react'
const { Switch, Radio } = require('pretty-checkbox-react')

// import { Button } from '@material/react-button'
// import '@material/react-button/dist/button.css'

// import { ChipSet, Chip } from '@material/react-chips'
// import "@material/react-chips/dist/chips.css"

import './ControlsStyle.css'
import { EvaluationStrategy } from '../App';

// import '@material/react-tab-bar/dist/tab-bar.css'
// import '@material/react-tab-scroller/dist/tab-scroller.css'
// import '@material/react-tab/dist/tab.css'
// import '@material/react-tab-indicator/dist/tab-indicator.css'
// import Tab from '@material/react-tab'
// import TabBar from '@material/react-tab-bar'

export interface ControlsProps {
  __key : string
  isRunning : boolean
  isActive : boolean
  makeActive () : void
  isExercise : boolean
  makeExercise () : void
  endExercise () : void
  strategy : EvaluationStrategy
  onStrategy (strategy : EvaluationStrategy) : void
  singleLetterNames : boolean
}

export default function Controls (props : ControlsProps) : JSX.Element {
  const {
    __key,
    isActive,
    makeActive,
    isExercise,
    makeExercise,
    endExercise,
    strategy,
    onStrategy,
    singleLetterNames,
  } : ControlsProps = props

  return (
    <div id="controls">
      
      {
        isActive ?
          <div>
            <div className='badge inlineblock'>
              active
            </div>
            {
              singleLetterNames ?
              <div className='badge inlineblock'>
                single letter names
              </div>
                :
                null
            }
            {
              isExercise ?
                <button
                  className='controlBtn'
                  onClick={ endExercise }
                >
                  end exercise
                </button>
                :
                <button
                  className='controlBtn'
                  onClick={ makeExercise }
                >
                  make exercise
                </button>
            }
            <div className='badge'>
              <div className='strategyName inlineblock'>
                { strategy }
              </div>
              <div className='strategies inlineblock'>
                <Radio style="fill" name={ "strategy" + __key } checked={ strategy === EvaluationStrategy.NORMAL } onChange={ () => onStrategy(EvaluationStrategy.NORMAL) } >Normal Evaluation</Radio>
                <Radio style="fill" name={ "strategy" + __key } checked={ strategy === EvaluationStrategy.APPLICATIVE } onChange={ () => onStrategy(EvaluationStrategy.APPLICATIVE) } >Applicative Evaluation</Radio>
                <Radio style="fill" name={ "strategy" + __key } checked={ strategy === EvaluationStrategy.OPTIMISATION } onChange={ () => onStrategy(EvaluationStrategy.OPTIMISATION) } >Optimisation</Radio>
              </div>
            </div>
          </div>




            :




        <button
          className='controlBtn'
          color="primary"
          onClick={ makeActive }
        >
          make active
        </button>
      }
      
      {/* <i
        className="fas fa-redo-alt fa-2x"
        onClick={ onClear }
       />

      <button className='controlButton' onClick={ onClear } disabled={ isRunning }>CLEAR</button> */}
    </div>
  )
}