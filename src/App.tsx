import React, { Component, ChangeEvent } from 'react'
const { Switch, Radio } = require('pretty-checkbox-react')

import {
  AST,
  tokenize,
  parse,
  Token,
  MacroMap,
  None,
  NormalEvaluator,
  Expansion,
  Macro,
  ChurchNumeral,
  Variable,
  Lambda,
  Beta,
  ASTReduction,
  ApplicativeEvaluator,
  OptimizeEvaluator
} from 'lambdulus-core'

import './App.css'
import { HANDY_MACROS, getSavedMacros } from './misc'
import MenuBar from './components/MenuBar'
import BoxSpace from './components/BoxSpace'


export enum EvaluationStrategy {
  NORMAL = 'Normal Evaluation',
  APPLICATIVE = 'Applicative Evaluation',
  OPTIMISATION = 'Optimisation - η Conversion ',
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
  editor : {
    placeholder : string
    content : string
    caretPosition : number
    syntaxError : Error | null
    action : ActionType
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

    this.state = {
      settings : {
        strategy : EvaluationStrategy.NORMAL,
        singleLetterNames : true,
        isExercise : false,
        isMarkDown : false,
      },
      editor : {
        placeholder : PromptPlaceholder.INIT,
        content : '',
        caretPosition : 0,
        syntaxError : null,
        action : ActionType.ENTER_EXPRESSION,
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
      editor : { content, caretPosition, syntaxError, placeholder },
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


    const getEditor = () =>
    <Editor
      placeholder={ placeholder }
      content={ content }
      caretPosition={ caretPosition }
      onContent={ this.onExpression }
      onEnter={ this.onEnter }
      syntaxError={ syntaxError }
      onRun={ this.onRun }
      onReset={ this.onClear }
      strategy={ this.state.settings.strategy }
      onStrategy={ (strategy : EvaluationStrategy) => this.setState({
        ...this.state,
        settings : {
          ...this.state.settings,
          strategy,
        }
      }) }
      singleLetterNames={ this.state.settings.singleLetterNames }
      onSingleLetterNames={ (enabled : boolean) => this.setState({
        ...this.state,
        settings : {
          ...this.state.settings,
          singleLetterNames : enabled,
        }
      }) }
      isExercise={ isExercise }
      onExercise={ (enabled : boolean) => this.setState({
        ...this.state,
        settings : {
          ...this.state.settings,
          isExercise : enabled,
        }
      }) }
      action={ this.state.editor.action }
      onActionSelect={ (action : ActionType) => this.setState({
        ...this.state,
        editor : {
          ...this.state.editor,
          action,
        }
      }) }
      onActionClick={ () => {
        const { editor : { action } } = this.state

        if (action === ActionType.ENTER_EXPRESSION) {
          this.onEnter()
          return
        }
        if (action === ActionType.NEXT_STEP) {
          this.onStep()
          return
        }
        if (action === ActionType.RUN) {
          // implement
          return
        }
        if (action === ActionType.ENTER_EXERCISE) {
          this.setState({
            ...this.state,
            settings : {
              ...this.state.settings,
              isExercise : true,
            }
          }, () => this.onEnter())
        }
        else {
          // implement or delete 
        }
      } }
      isMarkDown={ this.state.settings.isMarkDown }
    />

    const getEvaluatorSpace = () =>
    <BoxSpace
      removeExpression={ this.onRemoveExpression }
      updateState={ this.onUpdateEvaluationState }
      submittedExpressions={ submittedExpressions }
      editExpression={ (ast : AST, strategy : EvaluationStrategy, singleLetterNames : boolean) =>
        this.setState({
          ...this.state,
          settings : {
            strategy,
            singleLetterNames,
            isExercise : false, // TODO: jenom momentalni rozhodnuti - popremyslim
            isMarkDown : this.state.settings.isMarkDown,
          },
          editor : {
            placeholder : PromptPlaceholder.INIT,
            content : ast.toString(),
            caretPosition : ast.toString().length,
            syntaxError : null,
            action : this.state.editor.action,
          }
        })
      }
      activeBoxIndex={ activeBoxIndex }
      makeActive={ (index : number) => this.setState({
        ...this.state,
        activeBoxIndex : index,
      }) }
      editor={ getEditor() }
      addEmptyExp={ this.addEmptyExp }
      addEmptyNote={ this.addEmptyNote }
      globalStrategy={ this.state.settings.strategy }
      onEnter={ this.onEnter }
      onEditNote={ this.onEditNote }
    />

    const getMacroSpace = () =>
    <MacroSpace
      macroTable={ macroTable }
      removeMacro={ this.onRemoveMacro }
    />

    return (
      <div className='app'>

        <MenuBar
          state={this.state}
          onImport={ (state : AppState) => this.setState(state) }
          onScreenChange={ (screen : Screen) => this.setState({
            ...this.state,
            screen,
          }) }
         />

        <div className='editorSettings'>
          <Switch
            checked={ this.state.settings.singleLetterNames }
            onChange={ (e : ChangeEvent<HTMLInputElement>) =>
              this.setState({
                ...this.state,
                settings : {
                  ...this.state.settings,
                  singleLetterNames : e.target.checked,
                }
              })
            }
            disabled={ this.state.settings.isMarkDown }
            shape="fill">
              Single Letter Names
          </Switch>

          <div className='strategies inlineblock'>
            <p className='stratsLabel inlineblock'>Evaluation Strategies:</p>
            <Radio style="fill" name="strategy" checked={ this.state.settings.strategy === EvaluationStrategy.NORMAL } onChange={ () => changeStrategy(EvaluationStrategy.NORMAL) } >Normal</Radio>
            <Radio style="fill" name="strategy" checked={ this.state.settings.strategy === EvaluationStrategy.APPLICATIVE } onChange={ () => changeStrategy(EvaluationStrategy.APPLICATIVE) } >Applicative</Radio>
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

  
}