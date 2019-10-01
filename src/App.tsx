import React, { Component } from 'react'

import './App.css'

import MenuBar from './components/MenuBar'
import MacroSpace from './components/MacroSpace'
import Settings from './components/Settings'
import { EvaluatorSpace } from './components/EvaluatorSpace'
import { MethodInjector } from './components/MethodInjector'
import { DataInjector } from './components/DataInjector'
import { DEFAULT_STATE, AppState, Screen, PromptPlaceholder, EvaluationStrategy, BoxState, BoxType, EvaluationState, MacroDefinitionState } from './AppTypes'
import { updateMacros } from './misc'


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
    this.defineMacro = this.defineMacro.bind(this)
    this.createBoxFromURL = this.createBoxFromURL.bind(this)
    this.removeBox = this.removeBox.bind(this)

    this.state = DEFAULT_STATE

    window.addEventListener('hashchange', this.createBoxFromURL)
  }

  componentDidMount () : void {
    this.createBoxFromURL()
  }

  render () : JSX.Element {
    const {
      macroTable,
      screen,
    } : AppState = this.state

    return (
      <div className='app'>
        <MenuBar
          state={ this.state }
          onImport={ (state : AppState) => this.setState(state) }
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
          <DataInjector
            SLI={ this.getActiveSingleLetterNames() }
            strategy={ this.getActiveStrategy() }
            state={ this.state }
          >
            <MethodInjector
              addBox={ this.addBox }
              removeBox={ this.removeBox }
              addEmptyBox={ this.addEmptyBox }
              changeActiveBox={ this.changeActiveBox }
              defineMacro={ this.defineMacro }
              setBoxState={ this.setBoxState }
            >
              <EvaluatorSpace />
            </MethodInjector>
          </DataInjector>
          :
          <MacroSpace macroTable={ macroTable } removeMacro={ this.removeMacro } />
        }
      </div>
    )
  }

  createBoxFromURL () {
    const hash : string = decodeURI(window.location.hash.substring(1))
    const isExercise : boolean = hash.indexOf('exercise:') !== -1

    const expression : string = isExercise ? hash.substring(9) : hash

    if (expression === '') {
      // return
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
    
    const expression : string = boxState.type === BoxType.EXPRESSION ? boxState.editor.content || (boxState as EvaluationState).expression : '' // TODO: DIRTY DIRTY BIG TIME
    const expPrefix : string = boxState.type === BoxType.EXPRESSION && (boxState as EvaluationState).isExercise ? 'exercise:' : '' 
    
    history.pushState({}, "page title?", "#" + expPrefix + encodeURI(expression))

    // TODO: doresit update URL // ted uz to docela dobry je

    // TODO: consider immutability
    submittedBoxes[index] = boxState

    this.setState({
      ...this.state,
      submittedBoxes,
    })

  }

  addEmptyBox (boxState : BoxState) : void {
    const { submittedBoxes } = this.state

    this.setState({
      ...this.state,
      submittedBoxes : [ ...submittedBoxes, boxState ],
      activeBoxIndex : Math.max(0, submittedBoxes.length),
    })
  }

  addBox (boxState : BoxState) : void {
    const { submittedBoxes } = this.state

    this.setState({
      ...this.state,
      submittedBoxes : [ ...submittedBoxes, boxState ],
      activeBoxIndex : submittedBoxes.length
    })
  }

  removeBox (index : number) : void {
    let { submittedBoxes, activeBoxIndex } = this.state

    submittedBoxes.splice(index, 1)

    activeBoxIndex = activeBoxIndex >= index ? activeBoxIndex - 1 : activeBoxIndex

    if (activeBoxIndex === -1) {
      history.pushState({}, "page title?", "#")
    }
    else {
      this.changeActiveBox(activeBoxIndex)      
    }
    
    this.setState({
      ...this.state,
      submittedBoxes,
      activeBoxIndex
    })
  }

  changeActiveBox (activeBoxIndex : number) : void {
    const { submittedBoxes } = this.state
    
    const boxState : BoxState = submittedBoxes[activeBoxIndex]
      
    const expression : string = boxState.editor.content || (boxState as EvaluationState).expression // TODO: DIRTY DIRTY BIG TIME
    const expPrefix : string = boxState.type === BoxType.EXPRESSION && (boxState as EvaluationState).isExercise ? 'exercise:' : '' 
  
    history.pushState({}, "page title?", "#" + expPrefix + encodeURI(expression))

    this.setState({
      ...this.state,
      activeBoxIndex,
    })
  }

  getActiveStrategy () : EvaluationStrategy {
    const { submittedBoxes, activeBoxIndex } = this.state

    if (activeBoxIndex === -1) {
      return JSON.parse(window.localStorage.getItem('strategy') || JSON.stringify(EvaluationStrategy.ABSTRACTION)) as EvaluationStrategy
    }

    const activeBoxState : BoxState = submittedBoxes[activeBoxIndex]

    if (activeBoxState.type !== BoxType.EXPRESSION) {
      return JSON.parse(window.localStorage.getItem('strategy') || JSON.stringify(EvaluationStrategy.ABSTRACTION)) as EvaluationStrategy
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

    updateMacros(newMacroTable)
  }

  defineMacro (name : string, definition : string) : void {
    const { macroTable } = this.state

    this.setState({
      ...this.state,
      macroTable : { ...macroTable, [name] : definition }
    })

    updateMacros({ ...macroTable, [name] : definition })
  }
}