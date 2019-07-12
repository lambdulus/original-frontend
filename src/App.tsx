import React, { Component, ChangeEvent } from 'react';
const { Switch, Radio } = require('pretty-checkbox-react')
import 'pretty-checkbox'

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
import Editor, { ActionType } from './components/Editor'
import { debounce, trimStr, HANDY_MACROS, getExpressionFromURL, isMacroDefinition, getSavedMacros } from './misc';
import { EvaluationState, Breakpoint, StepRecord } from './components/Evaluator';
import TopBar from './components/MenuBar';
import { BoxState, BoxType } from './components/Box';
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
  EVAL_MODE = 'hit enter for next step',
  VALIDATE_MODE = 'write next step and hit enter for validation',
}

export enum EvaluationStrategy {
  NORMAL = 'Normal Evaluation',
  APPLICATIVE = 'Applicative Evaluation',
  OPTIMISATION = 'Optimisation - η Conversion ',
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

export interface AppState {
  editorState : {
    placeholder : string
    expression : string
    caretPosition : number
    syntaxError : Error | null
    strategy : EvaluationStrategy
    singleLetterNames : boolean
    isExercise : boolean
    action : ActionType
    isMarkDown : boolean
  }
  
  macroTable : MacroMap

  submittedExpressions : Array<BoxState>
  screen : Screen
  activeBox : number
}

export default class App extends Component<{}, AppState> {
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
    this.onRun = this.onRun.bind(this)
    this._onRun = this._onRun.bind(this)
    this.__onRun = this.__onRun.bind(this)
    this.onStop = this.onStop.bind(this)
    this.onClear = this.onClear.bind(this)
    this.shouldBreak = this.shouldBreak.bind(this)
    this.isNote = this.isNote.bind(this)
    this.addEmptyExp = this.addEmptyExp.bind(this)
    this.addEmptyNote = this.addEmptyNote.bind(this)
    this.onEditNote = this.onEditNote.bind(this)

    this.onRun = this.onRun.bind(this)

    window.addEventListener('hashchange', this.updateFromURL)

    const expression : string = getExpressionFromURL()

    this.state = {
      editorState : {
        placeholder : PromptPlaceholder.INIT,
        expression,
        caretPosition : expression.length,
        syntaxError : null,
        strategy : EvaluationStrategy.NORMAL,
        singleLetterNames : false,
        isExercise : false,
        action : ActionType.ENTER_EXPRESSION,
        isMarkDown : false,
      },
      // singleLetterVars : false,
      macroTable : { ...HANDY_MACROS, ...getSavedMacros() },
      submittedExpressions : [],
      screen : Screen.main,
      activeBox : -1,
    }
  }

  render () {
    const {
      editorState : { expression, caretPosition, syntaxError, placeholder, isExercise },
      // singleLetterVars,
      macroTable,
      submittedExpressions,
      screen,
      activeBox,
    } : AppState = this.state

    let shouldRenderEditor : boolean = true

    if (submittedExpressions[activeBox] !== undefined &&
        submittedExpressions[activeBox].type === BoxType.expression &&
        (submittedExpressions[activeBox] as EvaluationState).isExercise
      ) {
        shouldRenderEditor = false
      }

      const changeStrategy = (strategy : EvaluationStrategy) =>
        this.setState({
          ...this.state,
          editorState : {
            ...this.state.editorState,
            strategy,
          }
        })

      const getEditor = () =>
      <Editor
        placeholder={ placeholder }
        expression={ expression }
        caretPosition={ caretPosition }
        onExpression={ this.onExpression }
        onEnter={ this.onEnter }
        syntaxError={ syntaxError }
        onRun={ this.onRun }
        onReset={ this.onClear }
        strategy={ this.state.editorState.strategy }
        onStrategy={ (strategy : EvaluationStrategy) => this.setState({
          ...this.state,
          editorState : {
            ...this.state.editorState,
            strategy,
          }
        }) }
        singleLetterNames={ this.state.editorState.singleLetterNames }
        onSingleLetterNames={ (enable : boolean) => this.setState({
          ...this.state,
          editorState : {
            ...this.state.editorState,
            singleLetterNames : enable,
          }
        }) }
        isExercise={ isExercise }
        onExercise={ (enable : boolean) => this.setState({
          ...this.state,
          editorState : {
            ...this.state.editorState,
            isExercise : enable,
          }
        }) }
        // onDelete={ this.onRemoveExpression }
        // onStepBack={ this.onRemoveLastStep }
        action={ this.state.editorState.action }
        onActionSelect={ (action : ActionType) => this.setState({
          ...this.state,
          editorState : {
            ...this.state.editorState,
            action,
          }
        }) }
        onActionClick={ () => {
          const { editorState : { action } } = this.state

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
              editorState : {
                ...this.state.editorState,
                isExercise : true,
              }
            }, () => this.onEnter())
          }
          else {
            // implement or delete 
          }
        } }
        isMarkDown={ this.state.editorState.isMarkDown }
      />

    const getEvaluatorSpace = () =>
    <EvaluatorSpace
      removeExpression={ this.onRemoveExpression }
      updateState={ this.onUpdateEvaluationState }
      submittedExpressions={ submittedExpressions }
      editExpression={ (ast : AST, strategy : EvaluationStrategy, singleLetterNames : boolean) =>
        this.setState({
          ...this.state,
          editorState : {
            placeholder : PromptPlaceholder.INIT,
            expression : ast.toString(),
            caretPosition : ast.toString().length,
            syntaxError : null,
            strategy,
            singleLetterNames,
            isExercise : false, // TODO: jenom momentalni rozhodnuti - popremyslim
            action : this.state.editorState.action,
            isMarkDown : this.state.editorState.isMarkDown,
          }
        })
      }
      activeBox={ activeBox }
      makeActive={ (index : number) => this.setState({
        ...this.state,
        activeBox : index,
      }) }
      editor={ getEditor() }
      addEmptyExp={ this.addEmptyExp }
      addEmptyNote={ this.addEmptyNote }
      globalStrategy={ this.state.editorState.strategy }
      onEnter={ this.onEnter }
      onEditNote={ this.onEditNote }
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


        <div className='editorSettings'>
          
          <Switch
            checked={ this.state.editorState.singleLetterNames }
            onChange={ (e : ChangeEvent<HTMLInputElement>) =>
              this.setState({
                ...this.state,
                editorState : {
                  ...this.state.editorState,
                  singleLetterNames : e.target.checked,
                }
              })
            }
            disabled={ this.state.editorState.isMarkDown }
            shape="fill"
          >
              Single Letter Names
          </Switch>

          <div className='strategies inlineblock'>
            <p className='stratsLabel inlineblock'>Evaluation Strategies:</p>
            <Radio style="fill" name="strategy" checked={ this.state.editorState.strategy === EvaluationStrategy.NORMAL } onChange={ () => changeStrategy(EvaluationStrategy.NORMAL) } >Normal</Radio>
            <Radio style="fill" name="strategy" checked={ this.state.editorState.strategy === EvaluationStrategy.APPLICATIVE } onChange={ () => changeStrategy(EvaluationStrategy.APPLICATIVE) } >Applicative</Radio>
            {/* <Radio style="fill" name="strategy" checked={ this.state.editorState.strategy === EvaluationStrategy.OPTIMISATION } onChange={ () => changeStrategy(EvaluationStrategy.OPTIMISATION) } >Optimisation</Radio> */}
          </div>
          

          {/* <div className='inlineblock'>
            <Switch
              checked={ isExercise }
              onChange={ (e : ChangeEvent<HTMLInputElement>) =>
                this.setState({
                  ...this.state,
                  editorState : {
                    ...this.state.editorState,
                    isExercise : e.target.checked,
                  }
                })
              }
              disabled={ this.state.editorState.isMarkDown }
              shape="fill"
            >
              Exercise Mode
            </Switch>

            <Switch
              checked={ this.state.editorState.isMarkDown }
              onChange={ (e : ChangeEvent<HTMLInputElement>) =>
                this.setState({
                  ...this.state,
                  editorState : {
                    ...this.state.editorState,
                    isMarkDown : e.target.checked,
                  }
                })
              }
              shape="fill"
            >
              MarkDown Mode
            </Switch>
          </div> */}
        </div>

        {
          screen === Screen.main ?
            getEvaluatorSpace()
            :
            screen === Screen.macrolist ?
              getMacroSpace()
              :
              notebooks
        }

        {/* { getEditor() } */}

        {/* {
          shouldRenderEditor ?
            (
              getEditor()
            )
            :
            null
        } */}

        {/* <div id="anchor"></div> */}

      </div>
    )
  }

  onEditNote (index : number) {
    (this.state.submittedExpressions[index] as NoteState).isEditing = true


    this.setState({
      ...this.state,
      activeBox : index,
      editorState : {
        ...this.state.editorState,
        isMarkDown : true,
        expression : (this.state.submittedExpressions[index] as NoteState).note
      },
    })
  }

  addEmptyNote () : void {
    this.setState({
      ...this.state,
      editorState : {
        ...this.state.editorState,
        isMarkDown : true,
      },
      submittedExpressions : [ ...this.state.submittedExpressions, {
        type : BoxType.note,
        __key : Date.now().toString(),
        note : '',
        isEditing : true,
      } ],
      activeBox : this.state.activeBox + 1,
    })
  }

  addEmptyExp () : void {
    this.setState({
      ...this.state,
      editorState : {
        ...this.state.editorState,
        isMarkDown : false,
      },
      submittedExpressions : [ ...this.state.submittedExpressions, {
          type : BoxType.expression,
          __key : Date.now().toString(),
          expression : '',
          ast : null,
          history : [ ],
          isRunning : false,
          breakpoints : [],
          timeoutID : undefined,
          timeout : 10,
          isExercise : false,
          strategy : this.state.editorState.strategy,
          singleLetterNames : this.state.editorState.singleLetterNames,
      } ],
      activeBox : this.state.activeBox + 1,
    })
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
    this.setState({
      ...this.state,
      editorState : {
        ...this.state.editorState,
        placeholder : this.state.editorState.placeholder,
        expression,
        caretPosition,
        syntaxError : null,
      }
    } )
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

  //
  // TODO: refactor heavily PLS
  onRun () : void {
    const { submittedExpressions, activeBox } = this.state
    const activeExpression = submittedExpressions[activeBox]

    if (activeExpression === undefined) {
      return // maybe in future it will submit first expression and immidiately run it idk
    }

    if (activeExpression.type === BoxType.expression) {
      const activeExp = activeExpression as EvaluationState

      if (activeExp.isRunning === false) {
        this._onRun()
      }
      else {
        this.onStop()
      }
    }
    else {
      return
    }
  }

  onUpdateBoxState (state : BoxState) : void {
    const { submittedExpressions, activeBox } = this.state

    submittedExpressions[activeBox] = state

    this.setState({
      ...this.state,
      submittedExpressions,
    })
  }

  _onRun () : void {
    const { submittedExpressions, activeBox } = this.state
    const evalState = submittedExpressions[activeBox] as EvaluationState

    const { timeout, history } = evalState
    const stepRecord = history[history.length - 1]
  
    if (stepRecord.isNormalForm) {
      return
    }
    
    const { ast, step, lastReduction, isNormalForm, message } = stepRecord
    history.push(history[history.length - 1])
    // history[history.length - 1].message = 'Skipping some steps...'
    history[history.length - 2] = { ast : ast.clone(), step, lastReduction, message : 'Skipping some steps...', isNormalForm }

    this.onUpdateBoxState({
      ...evalState,
      history,
      isRunning : true,
      timeoutID : window.setTimeout(this.__onRun, timeout),
    })
  }

  __onRun () {
    const { submittedExpressions, activeBox, editorState : { strategy } } = this.state
    const evalState = submittedExpressions[activeBox] as EvaluationState
    
    let { history, isRunning, breakpoints, timeoutID, timeout } = evalState
    const stepRecord : StepRecord = history[history.length - 1]
    const { isNormalForm, step } = stepRecord
    let { lastReduction } = stepRecord

    if ( ! isRunning) {
      return
    }
    
    if (isNormalForm) {
      this.onUpdateBoxState({
        ...evalState,
        isRunning : false,
        timeoutID : undefined,
      })
  
      return
    }
  
    let ast : AST = history[history.length - 1].ast
    const normal : Evaluator = new (strategyToEvaluator(strategy) as any)(ast)
    lastReduction = normal.nextReduction
    
    if (normal.nextReduction instanceof None) {
      history.pop()
      history.push({
        ast,
        lastReduction : stepRecord.lastReduction,
        step,
        message : 'Expression is in normal form.',
        isNormalForm : true
      })
  
      this.onUpdateBoxState({
        ...evalState,
        history,
        // steps,
        isRunning : false,
        timeoutID : undefined,
      })
  
      return
    }
  
    // TODO: maybe refactor a little
    const breakpoint : Breakpoint | undefined = breakpoints.find(
      (breakpoint : Breakpoint) =>
        this.shouldBreak(breakpoint, normal.nextReduction)
    )

    // if (breakpoint !== undefined
    //     && history[history.length - 2].step === history[history.length - 1].step) {
    //   if (normal.nextReduction instanceof Expansion) {
    //     breakpoint.broken.add(normal.nextReduction.target)
    //   }
    //   if (normal.nextReduction instanceof Beta && normal.nextReduction.redex.left instanceof Lambda) {
    //     breakpoint.broken.add(normal.nextReduction.redex.left.argument)
    //   }
    // }
    // else
    if (breakpoint !== undefined) {
      if (normal.nextReduction instanceof Expansion) {
        breakpoint.broken.add(normal.nextReduction.target)
      }
      if (normal.nextReduction instanceof Beta && normal.nextReduction.redex.left instanceof Lambda) {
        breakpoint.broken.add(normal.nextReduction.redex.left.argument)
      }

      window.clearTimeout(timeoutID)
      
      this.onUpdateBoxState({
        ...evalState,
        isRunning : false,
        breakpoints,
        timeoutID : undefined,
      })

      return
    }
  
    ast = normal.perform()
    // steps++

    history[history.length - 1] = { ast, lastReduction, step : step + 1, message : '', isNormalForm }
  
    this.onUpdateBoxState({
      ...evalState,
      history,
      // steps,
      // lastReduction,
      timeoutID : window.setTimeout(this.__onRun, timeout),
    })
  }

  onStop () : void {
    const { submittedExpressions, activeBox } = this.state
    const evalState = submittedExpressions[activeBox] as EvaluationState
    const { timeoutID } = evalState
  
    window.clearTimeout(timeoutID)
  
    this.onUpdateBoxState({
      ...evalState,
      isRunning : false,
      timeoutID : undefined
    })
  }

  shouldBreak (breakpoint : Breakpoint, reduction : ASTReduction) : boolean {
    // if (reduction instanceof (breakpoint.type as any)
    //     && reduction instanceof Beta && breakpoint.context instanceof Lambda
    //     && reduction.target.identifier === breakpoint.context.body.identifier
    //   ) {
    //     return true
    // }
    if (reduction instanceof (breakpoint.type as any)
        && reduction instanceof Beta && breakpoint.context instanceof Variable
        && reduction.redex.left instanceof Lambda
        && reduction.redex.left.argument.identifier === breakpoint.context.identifier
        && ! breakpoint.broken.has(reduction.redex.left.argument)
    ) {
      return true
    }

    if (reduction instanceof (breakpoint.type as any)
        && reduction instanceof Expansion && breakpoint.context instanceof ChurchNumeral
        && reduction.target.identifier === breakpoint.context.identifier
        && ! breakpoint.broken.has(reduction.target)
    ) {
      return true
    }
    if (reduction instanceof (breakpoint.type as any)
        && reduction instanceof Expansion && breakpoint.context instanceof Macro
        && reduction.target.identifier === breakpoint.context.identifier
        && ! breakpoint.broken.has(reduction.target)
    ) {
      return true
    }
  
    return false
  }

  onClear () : void {
    const { submittedExpressions, activeBox } = this.state
    
    if (submittedExpressions[activeBox] === undefined) {
      return
    }

    if (submittedExpressions[activeBox].type !== BoxType.expression) {
      return
    }

    const evalState = submittedExpressions[activeBox] as EvaluationState

    this.onUpdateBoxState({
      ...evalState,
      history : [ {
        ast : (evalState.ast as AST).clone(),
        lastReduction : None,
        step : 0,
        message : '',
        isNormalForm : false
      } ],
      // steps : 0,
      isRunning : false,
      // lastReduction : null,
      breakpoints : [],
    })
  }

  // TODO: hope you refactored ^^ heavily
  //

  onEnter () : void {
    const { editorState : { expression }, submittedExpressions, activeBox } = this.state
    const activeExpression : BoxState = submittedExpressions[activeBox]

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
    const { editorState : { expression, strategy } } = this.state
    try {
      const userAst : AST = this.parseExpression(expression)

      const { submittedExpressions, activeBox } = this.state
      const evalState : EvaluationState = submittedExpressions[activeBox] as EvaluationState
      let { history } = evalState
      const stepRecord : StepRecord = history[history.length - 1]
      const { isNormalForm, step } = stepRecord
      let { ast, lastReduction } = stepRecord
      ast = ast.clone()

      if (isNormalForm) {
        // TODO: do something about it
        // say user - there are no more steps and it is in normal form
        stepRecord.message = 'No more steps available. Expression is in normal form.'

        this.setState({
          ...this.state,
          submittedExpressions,
        })

        return
      }
    
      // TODO: take evaluation strategy from evalState
      const normal : Evaluator = new (strategyToEvaluator(strategy) as any)(ast)
      lastReduction = normal.nextReduction
    
      if (normal.nextReduction instanceof None) {
        // TODO: refactor PLS - update history
        // TODO: say user it is in normal form and they are mistaken
        stepRecord.isNormalForm = true
        stepRecord.message = 'Expression is already in normal form.'
        submittedExpressions[activeBox] = {
          ...evalState,
          history,
        }

        this.setState({
          ...this.state,
          submittedExpressions,
        })
        
        return
      }
    
      ast = normal.perform()
    
      let message : string = ''
      const comparator : TreeComparator = new TreeComparator([ userAst, ast ])
      if (comparator.equals) {
        ast = userAst
        message = 'Correct.'
      }
      else {
        // TODO: say user it was incorrect
        // TODO: na to se pouzije uvnitr EvaluatorState prop messages nebo tak neco
        console.log('Incorrect step')
        message = `Incorrect step. ${expression}`
      }

      submittedExpressions[activeBox] = {
        ...evalState,
        history : [ ...history, { ast, lastReduction, step : step + 1, message, isNormalForm : false } ],
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
  }

  onStep () : void {
    const { submittedExpressions, activeBox, editorState : { strategy } } = this.state
    const evalState : EvaluationState = submittedExpressions[activeBox] as EvaluationState
    let { history } = evalState
    const stepRecord = history[history.length - 1]
    const { isNormalForm, step } = stepRecord
    let { ast, lastReduction } = stepRecord
    ast = ast.clone()
  
    if (isNormalForm) {
      return
    }

    const normal : Evaluator = new (strategyToEvaluator(strategy) as any)(ast)
    lastReduction = normal.nextReduction
  
    if (normal.nextReduction instanceof None) {
      stepRecord.isNormalForm = true
      stepRecord.message = 'Expression is in normal form.'
      submittedExpressions[activeBox] = {
        ...evalState,
        history,
      }

      this.setState({
        ...this.state,
        submittedExpressions,
      })
      
      return
    }
  
    ast = normal.perform()
  
    submittedExpressions[activeBox] = {
      ...evalState,
      history : [ ...history, { ast, lastReduction, step : step + 1, message : '', isNormalForm : false } ],
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
          strategy : this.state.editorState.strategy,
          singleLetterNames : this.state.editorState.singleLetterNames,
          isExercise : this.state.editorState.isExercise,
          action : this.state.editorState.action,
          isMarkDown : this.state.editorState.isMarkDown,
        },
        submittedExpressions : [ ...submittedExpressions, macroState ],
        macroTable : newMacroTable,
        activeBox : submittedExpressions.length - 1,
      })

      this.updateMacros(newMacroTable)
    }

    else if (this.isNote(expression)) {
      history.pushState({}, "", "#" + encodeURI(''))

      const noteState : NoteState = {
        type : BoxType.note,
        __key : Date.now().toString(),
        note : expression,
        isEditing : false,
      }

      submittedExpressions[submittedExpressions.length - 1] = noteState

      this.setState({
        ...this.state,
        editorState : {
          placeholder : this.state.editorState.placeholder,
          expression : '',
          caretPosition : 0,
          syntaxError : null,
          strategy : this.state.editorState.strategy,
          singleLetterNames : this.state.editorState.singleLetterNames,
          isExercise : this.state.editorState.isExercise,
          action : this.state.editorState.action,
          isMarkDown : false,
        },
        submittedExpressions,
        activeBox : submittedExpressions.length - 1,
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
          history : [ { ast : ast.clone(), lastReduction : None, step : 0, message : '', isNormalForm : false } ],
          // isStepping : false,
          isRunning : false,
          breakpoints : [],
          timeoutID : undefined,
          timeout : 10,
          isExercise : this.state.editorState.isExercise,
          strategy : this.state.editorState.strategy,
          singleLetterNames : this.state.editorState.singleLetterNames,
        }

        submittedExpressions[submittedExpressions.length - 1] = evaluationState
  
        this.setState({
          ...this.state,
          editorState : {
            placeholder : PromptPlaceholder.EVAL_MODE,
            expression : '',
            caretPosition : 0,
            syntaxError : null,
            strategy : this.state.editorState.strategy,
            singleLetterNames : this.state.editorState.singleLetterNames,
            isExercise : this.state.editorState.isExercise,
            action : this.state.editorState.action,
            isMarkDown : this.state.editorState.isMarkDown,
          },
          submittedExpressions,
          activeBox : submittedExpressions.length - 1,
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
            strategy : this.state.editorState.strategy,
            singleLetterNames : this.state.editorState.singleLetterNames,
            isExercise : this.state.editorState.isExercise,
            action : this.state.editorState.action,
            isMarkDown : this.state.editorState.isMarkDown,
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
        syntaxError : null,
        strategy : this.state.editorState.strategy,
        singleLetterNames : this.state.editorState.singleLetterNames,
        isExercise : this.state.editorState.isExercise,
        action : this.state.editorState.action,
        isMarkDown : this.state.editorState.isMarkDown,
      }
    })
  }

  // THROWS Exceptions
  parseExpression (expression : string) : AST {
    const { macroTable } : AppState = this.state
    const { singleLetterNames : singleLetterVars } = this.state.editorState

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

  isNote (expression : string) : boolean {
    return this.state.editorState.isMarkDown
  }
}