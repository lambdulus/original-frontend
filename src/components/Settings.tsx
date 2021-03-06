import React, { ChangeEvent } from 'react'
const { Switch, Radio } = require('pretty-checkbox-react')

import { EvaluationStrategy } from '../AppTypes'


interface SettingsProperties {
  getActiveSingleLetterNames () : boolean
  changeActiveSingleLetterNames (enabled : boolean) : void
  getActiveStrategy () : EvaluationStrategy
  changeActiveStrategy (strategy : EvaluationStrategy) : void
  getActiveStandalones () : boolean
  changeActiveStandalones (enabled : boolean) : void
}

export default function Settings (props : SettingsProperties) {
  return (
    <div className='editorSettings'>
      <span title='Enable names without spaces'>
        <Switch
          checked={ props.getActiveSingleLetterNames() }
          disabled={ false } // TODO: tohle bude rozhodne chtit prepsat
          shape="fill"
          
          onChange={ (e : ChangeEvent<HTMLInputElement>) => // taky nejakej pattern
            props.changeActiveSingleLetterNames(e.target.checked)
          }
        >
          Single Letter Names
        </Switch>
      </span>

      <span title='Expand stand-alones'>
        <Switch
          checked={ props.getActiveStandalones() }
          disabled={ false } // TODO: tohle bude rozhodne chtit prepsat
          shape="fill"
          
          onChange={ (e : ChangeEvent<HTMLInputElement>) => // taky nejakej pattern
            props.changeActiveStandalones(e.target.checked)
          }
        >
          Expand stand-alones
        </Switch>
      </span>

      <div className='strategies inlineblock'>
        <p className='stratsLabel inlineblock'>Evaluation Strategies:</p>
        <Radio
          name="strategy"
          style="fill"
          checked={ props.getActiveStrategy() === EvaluationStrategy.ABSTRACTION }
          
          onChange={ () => props.changeActiveStrategy(EvaluationStrategy.ABSTRACTION) }
        >
          Simplified
        </Radio>
        <Radio
          name="strategy"
          style="fill"
          checked={ props.getActiveStrategy() === EvaluationStrategy.NORMAL }
          
          onChange={ () => props.changeActiveStrategy(EvaluationStrategy.NORMAL) }
        >
          Normal
        </Radio>
        <Radio
          name="strategy"
          style="fill"
          checked={ props.getActiveStrategy() === EvaluationStrategy.APPLICATIVE }
          
          onChange={ () => props.changeActiveStrategy(EvaluationStrategy.APPLICATIVE) }
        >
          Applicative
        </Radio>
      </div>
    </div>
  )
}