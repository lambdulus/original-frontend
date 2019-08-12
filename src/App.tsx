import React, { Component, ChangeEvent } from 'react'
const { Switch, Radio } = require('pretty-checkbox-react')

import {
  AST,
  MacroMap,
  NormalEvaluator,
  ApplicativeEvaluator,
  OptimizeEvaluator
} from 'lambdulus-core'

import './App.css'
import { HANDY_MACROS, getSavedMacros } from './misc'
import MenuBar from './components/MenuBar'
import BoxSpace from './components/BoxSpace'
import Editor, { ActionType } from './components/Editor'
import { BoxState } from './components/Box'


export enum EvaluationStrategy {
  NORMAL = 'Normal Evaluation',
  APPLICATIVE = 'Applicative Evaluation',
  OPTIMISATION = 'Optimisation - η Conversion',
}

export enum Screen {
  main,
  macrolist,
  // notebooks,
}

export enum PromptPlaceholder {
  INIT = 'Type λ expression',
  EVAL_MODE = 'Hit enter for next step',
  VALIDATE_MODE = 'Write next step and hit enter for validation',
}

// zvazit jestli nechci vytvorit record type pro ruzne stavy settings
// v pripade ze je to markdown tak nedava smysl mit strategy a podobne
// na druhou stranu, melo by si to pamatovat po prepnuti z MD znova do expr strategy a podobne
export interface AppState {
  settings : {
    strategy : EvaluationStrategy
    singleLetterNames : boolean
    isExercise : boolean
    isMarkDown : boolean 
  }
  
  macroTable : MacroMap

  submittedBoxes : Array<BoxState>
  screen : Screen
  activeBoxIndex : number
}

export type Evaluator = NormalEvaluator | ApplicativeEvaluator | OptimizeEvaluator

export function strategyToEvaluator (strategy : EvaluationStrategy) : Evaluator {
  switch (strategy) {
    case EvaluationStrategy.NORMAL:
      return NormalEvaluator as any
 
    case EvaluationStrategy.APPLICATIVE:
      return ApplicativeEvaluator as any

    case EvaluationStrategy.OPTIMISATION:
      return OptimizeEvaluator as any
  }
}

export default class App extends Component<{}, AppState> {
  constructor (props : object) {
    super(props)

    this.updateBoxState = this.updateBoxState.bind(this)
    this.addEmptyBox = this.addEmptyBox.bind(this)
    this.changeActiveBox = this.changeActiveBox.bind(this)

    this.state = {
      settings : {
        strategy : EvaluationStrategy.NORMAL,
        singleLetterNames : true,
        isExercise : false,
        isMarkDown : false,
      },
      macroTable : { ...HANDY_MACROS, ...getSavedMacros() },
      submittedBoxes : [],
      screen : Screen.main,
      activeBoxIndex : -1,
    }
  }

  render () : JSX.Element {
    const {
      settings : { isExercise },
      macroTable,
      submittedBoxes,
      screen,
      activeBoxIndex,
    } : AppState = this.state

    const changeStrategy = (strategy : EvaluationStrategy) =>
      this.setState({
        ...this.state,
        settings : {
          ...this.state.settings,
          strategy,
        }
      })

    const getEvaluatorSpace = () =>
    <BoxSpace
      submittedBoxes={ submittedBoxes }
      activeBoxIndex={ activeBoxIndex }
      globalStrategy={ this.state.settings.strategy }

      makeActive={ this.changeActiveBox }
      updateBoxState={ this.updateBoxState }
      addEmptyBox={ this.addEmptyBox }
      // removeExpression={ this.onRemoveExpression } // to bude asi potreba az zbytek bude hotovej 
      
      
      // onEnter={ this.onEnter } // ten se presune dolu do Boxu
      // onEditNote={ this.onEditNote } // zmeni se na onChangeActiveBox a isEditing se udela v Boxu

    />

    const getMacroSpace = () =>
    <MacroSpace
      macroTable={ macroTable }

      // removeMacro={ this.onRemoveMacro } // zatim neumim removnout macro takze nepotrebuju
    />

    return (
      <div className='app'>

        <MenuBar
          state={this.state} // to je nutny
          
          onImport={ (state : AppState) => this.setState(state) } // to je docela kratky OK
          
          onScreenChange={(screen : Screen) => // mozna tohle zmenit nejakym patternem
            this.setState({
              ...this.state,
              screen,
            })
          }
         />

        {/* celou tuhle componentu bych klidne mohl wrapnout v nejaky custom comp */}
        <div className='editorSettings'>
          <Switch
            checked={ this.state.settings.singleLetterNames }
            disabled={ this.state.settings.isMarkDown }
            shape="fill"
            
            onChange={ (e : ChangeEvent<HTMLInputElement>) => // taky nejakej pattern
              this.setState({
                ...this.state,
                settings : {
                  ...this.state.settings,
                  singleLetterNames : e.target.checked,
                }
              })
            }
          >
            Single Letter Names
          </Switch>

          <div className='strategies inlineblock'>
            <p className='stratsLabel inlineblock'>Evaluation Strategies:</p>
            <Radio
              name="strategy"
              style="fill"
              checked={ this.state.settings.strategy === EvaluationStrategy.NORMAL }
              
              onChange={ () => changeStrategy(EvaluationStrategy.NORMAL) }
            >
              Normal
            </Radio>
            <Radio
              style="fill"
              name="strategy"
              checked={ this.state.settings.strategy === EvaluationStrategy.APPLICATIVE }
              
              onChange={ () => changeStrategy(EvaluationStrategy.APPLICATIVE) }
            >
              Applicative
            </Radio>
          </div>
          
        </div>

        {
          screen === Screen.main ? getEvaluatorSpace()
            :
          getMacroSpace()
        }

      </div>
    )
  }

  updateBoxState (index : number, boxState : BoxState) : void {
    const { submittedBoxes } = this.state

    // TODO: consider immutability
    submittedBoxes[index] = boxState

    this.setState({
      ...this.state,
      submittedBoxes,
    })
  }

  addEmptyBox (boxState : BoxState) : void {
    const { submittedBoxes, activeBoxIndex } = this.state

    this.setState({
      ...this.state,
      submittedBoxes : [ ...submittedBoxes, boxState ],
      activeBoxIndex : activeBoxIndex + 1,
    })
  }

  changeActiveBox (activeBoxIndex : number) : void {
    this.setState({
      ...this.state,
      activeBoxIndex,
    })
  } 
  
}