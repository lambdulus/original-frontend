import React, { Component, createContext } from 'react'

import { MacroMap } from 'lambdulus-core'

import './App.css'

import { HANDY_MACROS, getSavedMacros } from './misc'
import MenuBar from './components/MenuBar'
import { BoxState, BoxType } from './components/Box'
import MacroSpace from './components/MacroSpace'
import { EvaluationState } from './components/EvaluatorBox'
import { MacroDefinitionState } from './components/MacroDefinition'
import Settings from './components/Settings'
import { EvaluatorSpace } from './components/EvaluatorSpace'


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
  INIT = 'Type λ expression and hit enter',
  EVAL_MODE = 'Hit enter for next step',
  VALIDATE_MODE = 'Write next step and hit enter for validation',
  MACRO = 'Define Macro like: `NAME := [λ expression]` and hit enter',
  NOTE = 'Type note and hit shift enter'
}

export interface AppState {  
  macroTable : MacroMap

  submittedBoxes : Array<BoxState>
  screen : Screen
  activeBoxIndex : number
}

const DEFAULT_STATE : AppState = {
  macroTable : { ...HANDY_MACROS, ...getSavedMacros() },
  submittedBoxes : [],
  screen : Screen.main,
  activeBoxIndex : -1,
}

export const StateContext = createContext(DEFAULT_STATE)
export const StrategyContext = createContext(EvaluationStrategy.NORMAL)
export const AddBoxContext = createContext((boxState : BoxState) => {})
export const SLIContext = createContext(true)
export const AddEmptyBoxContext = createContext((boxState : BoxState) => {})
export const ChangeActiveBoxContext = createContext((activeBoxIndex : number) => {} )
export const SetBoxStateContext = createContext((index : number, boxState : BoxState) => {})
export const DefineMacroContext = createContext((name : string, definition : string) => {})

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
    this.removeMacro = this.removeMacro.bind(this)
    this.updateMacros = this.updateMacros.bind(this)
    this.defineMacro = this.defineMacro.bind(this)
    this.createBoxFromURL = this.createBoxFromURL.bind(this)

    this.state = DEFAULT_STATE

    window.addEventListener('hashchange', this.createBoxFromURL)
  }

  componentDidMount () : void {
    this.createBoxFromURL()
  }

  render () : JSX.Element {
    const {
      macroTable,
      submittedBoxes,
      screen,
      activeBoxIndex,
    } : AppState = this.state

    const getMacroSpace = () =>
    <MacroSpace
      macroTable={ macroTable }

      removeMacro={ this.removeMacro }
    />

    return (
      <div className='app'>
        <MenuBar
          state={ this.state } // to je nutny
          
          onImport={ (state : AppState) => this.setState(state) } // to je docela kratky OK
          
          onScreenChange={(screen : Screen) => // mozna tohle zmenit nejakym patternem
            this.setState({
              ...this.state,
              screen,
            })
          }
         />

        <Settings
          getActiveSingleLetterNames={ this.getActiveSingleLetterNames }
          getActiveStrategy={ this.getActiveStrategy }
          changeActiveSingleLetterNames={ this.changeActiveSingleLetterNames }
          changeActiveStrategy={ this.changeActiveStrategy }
        />

        {
          screen === Screen.main ?
            <StateContext.Provider value={ this.state }>
              <StrategyContext.Provider value={ this.getActiveStrategy() }>
                <SLIContext.Provider value={ this.getActiveSingleLetterNames() }>
                  <AddBoxContext.Provider value={ this.addBox }>
                    <AddEmptyBoxContext.Provider value={ this.addEmptyBox }>
                      <ChangeActiveBoxContext.Provider value={ this.changeActiveBox }>
                        <SetBoxStateContext.Provider value={ this.setBoxState }>
                          <DefineMacroContext.Provider value={ this.defineMacro }>
                            <EvaluatorSpace />
                          </DefineMacroContext.Provider>
                        </SetBoxStateContext.Provider>
                      </ChangeActiveBoxContext.Provider>
                    </AddEmptyBoxContext.Provider>
                  </AddBoxContext.Provider>
                </SLIContext.Provider>
              </StrategyContext.Provider>
            </StateContext.Provider>
            :
            getMacroSpace()
        }

      </div>
    )
  }

  createBoxFromURL () {
    const hash : string = decodeURI(window.location.hash.substring(1))
    const isExercise : boolean = hash.indexOf('exercise') !== -1

    const expression : string = isExercise ? hash.substring(8) : hash

    if (expression === '') {
      return
    }

    const box : BoxState = {
      type : BoxType.EXPRESSION,
      __key : Date.now().toString(),
      expression : '',
      ast : null,
      history : [],
      isRunning : false,
      breakpoints : [],
      timeoutID : undefined,
      timeout : 10,
      isExercise : isExercise,
      strategy : this.getActiveStrategy(),
      singleLetterNames : this.getActiveSingleLetterNames(),
      editor : {
        placeholder : PromptPlaceholder.INIT,
        content : expression,
        caretPosition : expression.length,
        syntaxError : null,
      }
    }

    this.setState({
      ...this.state,
      submittedBoxes : [ box ],
      activeBoxIndex : 0,
    })
  }

  setBoxState (index : number, boxState : BoxState) : void {
    const { submittedBoxes } = this.state
    
    const expression : string = boxState.editor.content || (boxState as EvaluationState).expression // TODO: DIRTY DIRTY BIG TIME
    const expPrefix : string = boxState.type === BoxType.EXPRESSION && (boxState as EvaluationState).isExercise ? 'exercise' : '' 
    
    history.pushState({}, "page title?", "#" + expPrefix + encodeURI(expression))

    // TODO: doresit update URL

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
      return JSON.parse(window.localStorage.getItem('strategy') || JSON.stringify(EvaluationStrategy.NORMAL)) as EvaluationStrategy
    }

    const activeBoxState : BoxState = submittedBoxes[activeBoxIndex]

    if (activeBoxState.type !== BoxType.EXPRESSION) {
      return JSON.parse(window.localStorage.getItem('strategy') || JSON.stringify(EvaluationStrategy.NORMAL)) as EvaluationStrategy
    }

    return (activeBoxState as EvaluationState).strategy
  }

  getActiveSingleLetterNames () : boolean {
    const { submittedBoxes, activeBoxIndex } = this.state

    if (activeBoxIndex === -1) {
      return JSON.parse(window.localStorage.getItem('SLI') || 'true')
    }

    const activeBoxState : BoxState = submittedBoxes[activeBoxIndex]

    if (activeBoxState.type === BoxType.NOTE) {
      return JSON.parse(window.localStorage.getItem('SLI') || 'true')
    }

    if (activeBoxState.type === BoxType.EXPRESSION) {
      return (activeBoxState as EvaluationState).singleLetterNames
    }

    if (activeBoxState.type === BoxType.MACRO) {
      return (activeBoxState as MacroDefinitionState).singleLetterNames
    }

    return JSON.parse(window.localStorage.getItem('SLI') || 'true') // to nikdy nenastane doufam
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

    window.localStorage.setItem('strategy', JSON.stringify(strategy))
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

    window.localStorage.setItem('SLI', JSON.stringify(enabled))
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

  defineMacro (name : string, definition : string) : void {
    const { macroTable } = this.state

    this.setState({
      ...this.state,
      macroTable : { ...macroTable, [name] : definition }
    })

    this.updateMacros({ ...macroTable, [name] : definition })
  }

}