import React from 'react'
const { Switch, Radio } = require('pretty-checkbox-react')


import './ControlsStyle.css'
import { EvaluationStrategy } from '../App';

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
          (
            <div className='badge'>
              active
            </div>
          )
          :
          (<div
            className='badge makeBadge'
            onClick={ makeActive }
          >
            make active
          </div>)
      }
      {
        isExercise ?
          (
            <div
              className='badge makeBadge'
              onClick={ endExercise }
            >
              end exercise
            </div>
          )
          :
          (<div
            className='badge makeBadge'
            onClick={ makeExercise }
          >
            make exercise
          </div>)
      }
      {
        singleLetterNames ?
          (<div className='badge'>
            single letter names enabled
          </div>)
          :
          null
      }
      <div
        className='badge'
      >
        <div className='strategyName inlineblock'>
          { strategy }
        </div>
        <div className='strategies inlineblock'>
          <Radio name={ "strategy" + __key } checked={ strategy === EvaluationStrategy.NORMAL } onChange={ () => onStrategy(EvaluationStrategy.NORMAL) } >Normal Evaluation</Radio>
          <Radio name={ "strategy" + __key } checked={ strategy === EvaluationStrategy.APPLICATIVE } onChange={ () => onStrategy(EvaluationStrategy.APPLICATIVE) } >Applicative Evaluation</Radio>
          <Radio name={ "strategy" + __key } checked={ strategy === EvaluationStrategy.OPTIMISATION } onChange={ () => onStrategy(EvaluationStrategy.OPTIMISATION) } >Optimisation</Radio>
        </div>
      </div>
      
      
      {/* <i
        className="fas fa-redo-alt fa-2x"
        onClick={ onClear }
       />

      <button className='controlButton' onClick={ onClear } disabled={ isRunning }>CLEAR</button> */}
    </div>
  )
}