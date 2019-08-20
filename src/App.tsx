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
import { BoxState, BoxType } from './components/Box'
import MacroSpace from './components/MacroSpace'
import { EvaluationState } from './components/Evaluator'
import { MacroDefinitionState } from './components/MacroDefinition';


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
  // settings : {
  //   strategy : EvaluationStrategy // podle me to tu nema co delat - je to specific pro aktivni Box
  //   singleLetterNames : boolean // podle me to tu nema co delat - je to specific pro aktivni Box
  //   isExercise : boolean // podle me to tu nema co delat - je to specific pro aktivni Box
  //   isMarkDown : boolean // podle me to tu nema co delat - je to specific pro aktivni Box
  // }
  
  macroTable : MacroMap

  submittedBoxes : Array<BoxState>
  screen : Screen
  activeBoxIndex : number
}

export default class App extends Component<{}, AppState> {
  constructor (props : object) {
    super(props)

    this.setBoxState = this.setBoxState.bind(this)
    this.addEmptyBox = this.addEmptyBox.bind(this)
    this.changeActiveBox = this.changeActiveBox.bind(this)
    this.changeActiveStrategy = this.changeActiveStrategy.bind(this)
    this.changeActiveSingleLetterNames = this.changeActiveSingleLetterNames.bind(this)
    this.getActiveStrategy = this.getActiveStrategy.bind(this)
    this.getActiveSingleLetterNames = this.getActiveSingleLetterNames.bind(this)
    this.addBox = this.addBox.bind(this)

    this.state = {
      // settings : { // TODO: mel bych se tohohle uplne zbavit
      //   strategy : EvaluationStrategy.NORMAL,
      //   singleLetterNames : true,
      //   isExercise : false,
      //   isMarkDown : false,
      // },
      macroTable : { ...HANDY_MACROS, ...getSavedMacros() },
      submittedBoxes : [],
      screen : Screen.main,
      activeBoxIndex : -1,
    }
  }

  render () : JSX.Element {
    const {
      // settings : { strategy, singleLetterNames },
      macroTable,
      submittedBoxes,
      screen,
      activeBoxIndex,
    } : AppState = this.state

    const getEvaluatorSpace = () =>
    <BoxSpace
      submittedBoxes={ submittedBoxes }
      activeBoxIndex={ activeBoxIndex }
      globalStrategy={ this.getActiveStrategy() }
      singleLetterNames={ this.getActiveSingleLetterNames() }
      macroTable={ macroTable }

      makeActive={ this.changeActiveBox }
      setBoxState={ this.setBoxState }
      addEmptyBox={ this.addEmptyBox }
      addBox={ this.addBox }
      // removeExpression={ this.onRemoveExpression } // to bude asi potreba az zbytek bude hotovej 
      
      
      // onEnter={ this.onEnter } // ten se presune dolu do Boxu
      // onEditNote={ this.onEditNote } // zmeni se na onChangeActiveBox a isEditing se udela v Boxu

    />

    const getMacroSpace = () =>
    <MacroSpace
      macroTable={ macroTable }

      removeMacro={ this.removeMacro }
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
        {/* taky je dulezity odkud bude tahle kompontnta brat stav - z aktivniho Boxu */}
        {/* kdyz neni zadnej box - tedy neni zadnej aktivni - tak nejakej default */}
        <div className='editorSettings'>
          <Switch
            checked={ this.getActiveSingleLetterNames() }
            disabled={ false } // TODO: tohle bude rozhodne chtit prepsat
            shape="fill"
            
            onChange={ (e : ChangeEvent<HTMLInputElement>) => // taky nejakej pattern
              this.changeActiveSingleLetterNames(e.target.checked)
            }
          >
            Single Letter Names
          </Switch>

          <div className='strategies inlineblock'>
            <p className='stratsLabel inlineblock'>Evaluation Strategies:</p>
            <Radio
              name="strategy"
              style="fill"
              checked={ this.getActiveStrategy() === EvaluationStrategy.NORMAL }
              
              onChange={ () => this.changeActiveStrategy(EvaluationStrategy.NORMAL) }
            >
              Normal
            </Radio>
            <Radio
              style="fill"
              name="strategy"
              checked={ this.getActiveStrategy() === EvaluationStrategy.APPLICATIVE }
              
              onChange={ () => this.changeActiveStrategy(EvaluationStrategy.APPLICATIVE) }
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

  setBoxState (index : number, boxState : BoxState) : void {
    // TODO: tahle metoda musi osetrit updatovani MacroTable
    // taky bude asi osetrovat update URL
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
      activeBoxIndex : Math.max(0, submittedBoxes.length),
    })
  }

  addBox (boxState : BoxState) : void {
    const { submittedBoxes, activeBoxIndex } = this.state

    this.setState({
      ...this.state,
      submittedBoxes : [ ...submittedBoxes, boxState ],
      activeBoxIndex : submittedBoxes.length
    })
  }

  changeActiveBox (activeBoxIndex : number) : void {
    this.setState({
      ...this.state,
      activeBoxIndex,
    })
  }

  getActiveStrategy () : EvaluationStrategy {
    const { submittedBoxes, activeBoxIndex } = this.state

    if (activeBoxIndex === -1) {
      return EvaluationStrategy.NORMAL
    }

    const activeBoxState : BoxState = submittedBoxes[activeBoxIndex]

    if (activeBoxState.type !== BoxType.expression) {
      return EvaluationStrategy.NORMAL
    }

    return (activeBoxState as EvaluationState).strategy
  }

  getActiveSingleLetterNames () : boolean {
    const { submittedBoxes, activeBoxIndex } = this.state

    if (activeBoxIndex === -1) {
      return true
    }

    const activeBoxState : BoxState = submittedBoxes[activeBoxIndex]

    if (activeBoxState.type === BoxType.note) {
      return true
    }

    if (activeBoxState.type === BoxType.expression) {
      return (activeBoxState as EvaluationState).singleLetterNames
    }

    if (activeBoxState.type === BoxType.macro) {
      return (activeBoxState as MacroDefinitionState).singleLetterNames
    }

    return true // to nikdy nenastane doufam
  }

  changeActiveStrategy (strategy : EvaluationStrategy) : void {
    const { submittedBoxes, activeBoxIndex } = this.state
    // TODO: consider immutability
    submittedBoxes[activeBoxIndex] = {
      ...submittedBoxes[activeBoxIndex],
      strategy,
    }
    
    this.setState({
      ...this.state,
    })
  }

  changeActiveSingleLetterNames (enabled : boolean) : void {
    const { submittedBoxes, activeBoxIndex } = this.state
    // TODO: consider immutability
    submittedBoxes[activeBoxIndex] = {
      ...submittedBoxes[activeBoxIndex],
      singleLetterNames : enabled,
    }

    this.setState({
      ...this.state
    })
  }

  removeMacro (name : string) : void {
    const { macroTable } = this.state
    
    const newMacroTable = { ...macroTable }
    delete newMacroTable[name]

    this.setState({
      ...this.state,
      macroTable : newMacroTable
    })

    this.updateMacros(newMacroTable)
  }

  updateMacros (macroTable : MacroMap) : void {
    window.localStorage.setItem('macrotable', JSON.stringify(macroTable))
  }
  
}