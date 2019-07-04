import React, { Component } from 'react';

import {
  AST,
  tokenize,
  parse,
  Token,
  MacroMap,
  None,
  NormalEvaluator
} from 'lambdulus-core'

import './App.css'
import Editor from './components/Editor'
import { debounce, trimStr, HANDY_MACROS, getExpressionFromURL, isNote, isMacroDefinition, getSavedMacros } from './misc';
import { EvaluationState } from './components/Evaluator';
import TopBar from './components/MenuBar';
import Box, { BoxState, BoxType } from './components/Box';
import { MacroDefinitionState } from './components/MacroDefinition';
import { NoteState } from './components/Note';
import EvaluatorSpace from './components/ExpressionSpace';
import MacroSpace from './components/MacroSpace';
import { TreeComparator } from './components/TreeComparator';


export enum Screen {
  main,
  macrolist,
  notebooks,
}

export enum PromptPlaceholder {
  INIT = 'type λ expression',
  EVAL_MODE = 'HIT ENTER AGAIN FOR NEXT STEP',
  VALIDATE_MODE = 'HIT ENTER TO VALIDATE YOUR SKILL',
}

export interface AppState {
  editorState : {
    placeholder : string
    expression : string
    caretPosition : number
    syntaxError : Error | null
  }
  
  singleLetterVars : boolean
  macroTable : MacroMap

  submittedExpressions : Array<BoxState>
  screen : Screen
  activeBox : number
}

export default class App extends Component<any, AppState> {
  constructor (props : object) {
    super(props)

    this.parseExpression = this.parseExpression.bind(this)
    this.updateFromURL = this.updateFromURL.bind(this)
    const [update, cancel] = debounce(this.updateURL.bind(this), 500)
    this.updateURL = update
    this.cancelUpdate = cancel
    this.onExpression = this.onExpression.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onRemoveExpression = this.onRemoveExpression.bind(this)
    this.updateMacros = this.updateMacros.bind(this)
    this.onUpdateEvaluationState = this.onUpdateEvaluationState.bind(this)
    this.onRemoveMacro = this.onRemoveMacro.bind(this)
    this.onEnter = this.onEnter.bind(this)
    this.onStep = this.onStep.bind(this)
    this.onRemoveLastStep = this.onRemoveLastStep.bind(this)
    this.onExerciseStep = this.onExerciseStep.bind(this)

    window.addEventListener('hashchange', this.updateFromURL)

    const expression : string = getExpressionFromURL()

    this.state = {
      editorState : {
        placeholder : PromptPlaceholder.INIT,
        expression,
        caretPosition : expression.length,
        syntaxError : null,
      },
      singleLetterVars : false,
      macroTable : { ...HANDY_MACROS, ...getSavedMacros() },
      submittedExpressions : [],
      screen : Screen.main,
      activeBox : -1,
    }
  }

  render () {
    const {
      editorState : { expression, caretPosition, syntaxError, placeholder },
      singleLetterVars,
      macroTable,
      submittedExpressions,
      screen,
      activeBox,
    } : AppState = this.state

    const getEvaluatorSpace = () =>
    <EvaluatorSpace
      removeExpression={ this.onRemoveExpression }
      updateState={ this.onUpdateEvaluationState }
      submittedExpressions={ submittedExpressions }
      editExpression={ (ast : AST) => this.setState({
        ...this.state,
        editorState : {
          placeholder : PromptPlaceholder.INIT,
          expression : ast.toString(),
          caretPosition : ast.toString().length,
          syntaxError : null
        }
      }) }
      activeBox={ activeBox }
      makeActive={ (index : number) => this.setState({
        ...this.state,
        activeBox : index,
      }) }
    />

    const getMacroSpace = () =>
    <MacroSpace
      macroTable={ macroTable }
      removeMacro={ this.onRemoveMacro }
    />

    const notebooks : JSX.Element = (
      <div>
        Notebooks are not implemented yet.
      </div>
    )

    // const onKeyDown = (event : KeyboardEvent) => {
    //   if (! event.shiftKey && event.key === 'Enter') {
    //     event.preventDefault()
    //     this.onEnter()
    //   }
    // }

    // document.onkeydown = onKeyDown
  

    return (
      <div className='app'>

        <TopBar
          state={this.state}
          onImport={ (state : AppState) => this.setState(state) }
          onScreenChange={ (screen : Screen) => this.setState({
            ...this.state,
            screen,
          }) }
         />

        {
          screen === Screen.main ?
            getEvaluatorSpace()
            :
            screen === Screen.macrolist ?
              getMacroSpace()
              :
              notebooks
        }

        <Editor
          placeholder={ placeholder }
          expression={ expression }
          caretPosition={ caretPosition }
          onExpression={ this.onExpression }
          onEnter={ this.onEnter }
          syntaxError={ syntaxError }
          // onDelete={ this.onRemoveExpression }
          // onStepBack={ this.onRemoveLastStep }
        />

        {/* <div id="anchor"></div> */}

      </div>
    )
  }

  // TODO: does not have to be in this class
  updateURL (expression : string) : void {
    history.pushState({}, "page title?", "#" + encodeURI(expression))
  }

  // TODO: does not have to be in this class
  cancelUpdate () : void {
    // TODO: this is placeholder for cancel-debounced-function DONT REMOVE
  }

  onExpression (expression : string, caretPosition : number) : void {
    this.setState({ ...this.state, editorState : {
      placeholder : this.state.editorState.placeholder,
      expression,
      caretPosition,
      syntaxError : null
     } } )
    this.updateURL(expression)
  }

  // TODO: tohle pujde v podstate pryc
  onUpdateEvaluationState (state : BoxState, index : number) : void {
    const { submittedExpressions } : AppState = this.state

    submittedExpressions[index] = {
      ...submittedExpressions[index],
      ...state,
    }

    this.setState({
      ...this.state,
      submittedExpressions,
    })
  }

  onRemoveExpression () {
    // TODO: implement IMPLEMENT I M P L E M E N T
    // const { submittedExpressions, macroTable,  } : AppState = this.state

    // const removed : BoxState | undefined = submittedExpressions.pop()

    // if (removed !== undefined && removed.type === BoxType.macro) {
    //   const name : string = (removed as MacroDefinitionState).macroName
    //   delete macroTable[name]
    //   this.updateMacros(macroTable)
    // }

    // this.setState({
    //   ...this.state,
    //   macroTable,
    //   submittedExpressions
    // })
  }

  onRemoveLastStep () {
    console.log('CURRENTLY NOT IMPEMENTED')
    // const { submittedExpressions } : AppState = this.state

    // const last : BoxState | undefined = submittedExpressions[submittedExpressions.length - 1]
    

    // if (last === undefined || last.type !== BoxType.expression) {
    //   return
    // }

    // const active : EvaluationState = submittedExpressions[submittedExpressions.length - 1] as EvaluationState
    
    // active.

    // this.setState({
    //   ...this.state,
    //   submittedExpressions
    // })
  }

  onEnter () : void {
    const { editorState : { expression }, submittedExpressions } = this.state
    const activeExpression : BoxState = submittedExpressions[submittedExpressions.length - 1]

    if (activeExpression !== undefined && (activeExpression as EvaluationState).isExercise) {
      this.onExerciseStep()
    }
    else if (expression.length || activeExpression === undefined || activeExpression.type !== BoxType.expression) {
      this.onSubmit()
    }
    else {
      this.onStep()
    }
  }

  onExerciseStep () {
    console.log('VALIDATE MY EXP')
    const { editorState : { expression } } = this.state
    try {
      const userAst : AST = this.parseExpression(expression)

      const { submittedExpressions, activeBox } = this.state
      const activeExpression : EvaluationState = submittedExpressions[activeBox] as EvaluationState
      let { history, steps, lastReduction } = activeExpression
    
      if (lastReduction instanceof None) {
        // TODO: do something about it
        // say user - there are no more steps and it is in normal form
        return
      }
    
      let ast = history[history.length - 1].ast.clone()
      // TODO: take evaluation strategy from activeExpression
      const normal : NormalEvaluator = new NormalEvaluator(ast)
    
      lastReduction = normal.nextReduction
    
      if (normal.nextReduction instanceof None) {
        // TODO: say user it is in normal form and they are mistaken
        submittedExpressions[activeBox] = {
          ...activeExpression,
          lastReduction,
        }

        this.setState({
          ...this.state,
          submittedExpressions,
        })
        
        return
      }
    
      ast = normal.perform()
      steps++
    
      const comparator : TreeComparator = new TreeComparator([ userAst, ast ])
      if (comparator.equals) {
        ast = userAst
      }
      else {
        // TODO: say user it was incorrect
        // TODO: na to se pouzije uvnitr EvaluatorState prop messages nebo tak neco
        console.log('Incorrect step')
      }



      submittedExpressions[activeBox] = {
        ...activeExpression,
        history : [ ...history, { ast, lastReduction, step : steps } ],
        steps,
        lastReduction,
      }

      this.setState({
        ...this.state,
        editorState : {
          ...this.state.editorState,
          expression : '',
          caretPosition : 0,
          placeholder : PromptPlaceholder.VALIDATE_MODE,
          syntaxError : null,
        },
        submittedExpressions,
      })

    } catch (exception) {
      // TODO: print syntax error
      // TODO: do it localy - no missuse of onSubmit

      this.onSubmit()
    }

    // TODO: compare expression ast with nextstep ast


    // this.setState({
    //   ...this.state,
    //   editorState : {
    //     ...this.state.editorState,
    //     expression : '',
    //   }
    // })

    // this.onStep();


  }

  onStep () : void {
    const { submittedExpressions, activeBox } = this.state
    const activeExpression : EvaluationState = submittedExpressions[activeBox] as EvaluationState
    let { history, steps, lastReduction } = activeExpression
  
    if (lastReduction instanceof None) {
      return
    }
  
    let ast = history[history.length - 1].ast.clone()
    
    const normal : NormalEvaluator = new NormalEvaluator(ast)
  
    lastReduction = normal.nextReduction
  
    if (normal.nextReduction instanceof None) {
      submittedExpressions[activeBox] = {
        ...activeExpression,
        lastReduction,
      }

      this.setState({
        ...this.state,
        submittedExpressions,
      })
      
      return
    }
  
    ast = normal.perform()
    steps++
  
    submittedExpressions[activeBox] = {
      ...activeExpression,
      history : [ ...history, { ast, lastReduction, step : steps } ],
      steps,
      lastReduction,
    }

    this.setState({
      ...this.state,
      submittedExpressions,
    })
  }

  // TODO: break-down to 3 or so methods
  onSubmit () : void {
    // TODO: maybe cancel and clear URL only after succsessful parsing
    this.cancelUpdate()
    
    const { editorState : { expression, caretPosition, },
    submittedExpressions, macroTable, activeBox } : AppState = this.state
    
    // window.location.hash = encodeURI(expression)
    history.pushState({}, "", "#" + encodeURI(expression))

    //
    // TODO: here decide if it is macro
    // note
    // expression to evaluate
    // macro contains := and name must be valid expression - later i will implement own parsing endpoint in core
    // note starts with # and can contains anything whatever user wants
    // expression is already implemented and working
    //

    if (isMacroDefinition(expression)) {
      history.pushState({}, "", "#" + encodeURI(''))

      const [macroName, macroExpression] : Array<string> = expression.split(':=').map(trimStr)

      const macroState : MacroDefinitionState = {
        type : BoxType.macro,
        __key : Date.now().toString(),
        macroName,
        macroExpression,
      }

      const newMacroTable : MacroMap = {
        ...macroTable,
        [macroName] : macroExpression
      }

      this.setState({
        ...this.state,
        editorState : {
          placeholder : this.state.editorState.placeholder,
          expression : '',
          caretPosition : 0,
          syntaxError : null,
        },
        submittedExpressions : [ ...submittedExpressions, macroState ],
        macroTable : newMacroTable,
        activeBox : activeBox + 1,
      })

      this.updateMacros(newMacroTable)
    }

    else if (isNote(expression)) {
      history.pushState({}, "", "#" + encodeURI(''))

      const noteState : NoteState = {
        type : BoxType.note,
        __key : Date.now().toString(),
        note : expression.substring(1)
      }

      this.setState({
        ...this.state,
        editorState : {
          placeholder : this.state.editorState.placeholder,
          expression : '',
          caretPosition : 0,
          syntaxError : null,
        },
        submittedExpressions : [ ...submittedExpressions, noteState ],
        activeBox : activeBox + 1,
      })
    }

    else {
      try {
        const ast : AST = this.parseExpression(expression)
        // window.location.hash = encodeURI('')
        history.pushState({}, "", "#" + encodeURI(''))
  
        const evaluationState : EvaluationState = {
          type : BoxType.expression,
          __key : Date.now().toString(),
          expression,
          ast,
          history : [ { ast : ast.clone(), lastReduction : None, step : 0 } ],
          steps : 0,
          // isStepping : false,
          isRunning : false,
          lastReduction : null,
          breakpoints : [],
          timeoutID : undefined,
          timeout : 10,
          isExercise : false
        }
  
        this.setState({
          ...this.state,
          editorState : {
            placeholder : PromptPlaceholder.EVAL_MODE,
            expression : '',
            caretPosition : 0,
            syntaxError : null,
          },
          submittedExpressions : [ ...submittedExpressions, evaluationState ],
          activeBox : activeBox + 1,
        })
    
      } catch (exception) {
        this.updateURL(expression)
        console.log(exception)
        
        this.setState({
          ...this.state,
          editorState : {
            placeholder : this.state.editorState.placeholder,
            expression,
            caretPosition,
            syntaxError : exception,
          }
        })
      }
    }
  }

  updateFromURL () : void {
    const { editorState : { expression : currentExpr } } : AppState = this.state
    const expression : string = getExpressionFromURL()

    if (currentExpr === expression) {
      // breaking cyclic update
      console.log('ALREADY SYNCED')
      return
    }

    this.setState({
      ...this.state,
      editorState : {
        placeholder : this.state.editorState.placeholder,
        expression,
        caretPosition : expression.length,
        syntaxError : null
      }
    })
  }

  // THROWS Exceptions
  parseExpression (expression : string) : AST {
    const { singleLetterVars, macroTable } : AppState = this.state
    
    const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ'], singleLetterVars })
    const ast : AST = parse(tokens, macroTable)

    return ast
  }

  onRemoveMacro (name : string) : void {
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