import React, { PureComponent } from 'react'
import {
  AST,
  ASTReduction,
  None,
  NormalEvaluator,
  Beta,
  Lambda,
  Variable,
  Expansion,
  ChurchNumeral,
  Macro,
  Token,
  tokenize,
  parse,
  ApplicativeEvaluator,
  OptimizeEvaluator,
} from "lambdulus-core"

// import './EvaluatorStyle.css'

import Controls from './Controls'
import Step from './Step'
import { mapLeftFromTo } from '../misc'
import { BoxType } from './Box'
import { EvaluationStrategy, PromptPlaceholder } from '../App'
import Editor, { ActionType } from './Editor'
import { TreeComparator } from './TreeComparator'


export type _Evaluator = NormalEvaluator | ApplicativeEvaluator | OptimizeEvaluator

export function strategyToEvaluator (strategy : EvaluationStrategy) : _Evaluator {
  switch (strategy) {
    case EvaluationStrategy.NORMAL:
      return NormalEvaluator as any
 
    case EvaluationStrategy.APPLICATIVE:
      return ApplicativeEvaluator as any

    case EvaluationStrategy.OPTIMISATION:
      return OptimizeEvaluator as any
  }
}

export type Breakpoint = {
  type : ASTReduction,
  context : AST,
  broken : Set<AST>,
}

export interface StepRecord {
  ast : AST
  lastReduction : ASTReduction | null
  step : number
  message : string
  isNormalForm : boolean
}

export interface EvaluationState {
  __key : string
  type : BoxType
  expression : string
  ast : AST | null
  history : Array<StepRecord>
  isRunning : boolean
  breakpoints : Array<Breakpoint>
  timeoutID : number | undefined
  timeout : number
  isExercise : boolean
  strategy : EvaluationStrategy
  singleLetterNames : boolean
  editor : {
    placeholder : string
    content : string
    caretPosition : number
    syntaxError : Error | null
  }
}

interface EvaluationProperties {
  state : EvaluationState
  globalStrategy : EvaluationStrategy
  isActive : boolean

  setBoxState (state : EvaluationState) : void
  makeActive () : void
}

export default class Evaluator extends PureComponent<EvaluationProperties> {
  constructor (props : EvaluationProperties) {
    super(props)

    this.addBreakpoint = this.addBreakpoint.bind(this)
    this.onContent = this.onContent.bind(this)
    this.onSubmitExpression = this.onSubmitExpression.bind(this)
    this.parseExpression = this.parseExpression.bind(this)
    this.onEnter = this.onEnter.bind(this)
    this.onExerciseStep = this.onExerciseStep.bind(this)
    this.onStep = this.onStep.bind(this)
    this.onExecute = this.onExecute.bind(this)
    this.onRun = this.onRun.bind(this)
    this.onStop = this.onStop.bind(this)
    this.shouldBreak = this.shouldBreak.bind(this)
  }

  render () : JSX.Element {
    const { state, isActive, setBoxState } : EvaluationProperties = this.props
    const {
      __key,
      history,
      isRunning,
      breakpoints,
      isExercise,
      strategy,
      singleLetterNames,
      expression,
      editor : {
        caretPosition,
        content,
        placeholder,
        syntaxError,
      },
    } : EvaluationState = state

    let className : string = 'box boxEval'

    if (expression === '') {
      return (
        <div className={ className + ' inactiveBox' } onDoubleClick={ this.props.makeActive } >
          <p className='emptyStep'>Empty expression box. Write λ expression and hit enter.</p>
          {
            isActive ?
              (
                <Editor
                  placeholder={ placeholder } // data
                  content={ content } // data
                  caretPosition={ caretPosition } // data
                  syntaxError={ syntaxError } // data
                  isMarkDown={ false } // data

                  onContent={ this.onContent } // fn
                  onEnter={ this.onEnter } // fn // tohle asi bude potreba
                  onExecute={ this.onExecute } // fn // tohle asi bude potreba
                />
              )
              :
              (
                <p className='inactiveMessage'>
                  Collapsing { history.length - 1 } steps. Double click to activate this box.
                </p>
              )
          }
        </div>
      )
    }

    const stepRecord : StepRecord = history[history.length - 1]

    if (isExercise) {
      className += ' boxExercise'
    }

    if ( ! isActive) {
      return (
        <div className={ className + ' inactiveBox' } onDoubleClick={ this.props.makeActive } >
          <ul className='UL'>
            <li key={ 0 } className='activeStep LI'>
              <Step
                breakpoints={ breakpoints }
                addBreakpoint={ () => {} } // blank function - NOOP
                stepRecord={ history[0] }
                strategy={ this.props.globalStrategy }
              >
                <i
                  className="hiddenIcon fas fa-pencil-alt"
                  onClick={ () => {}
                    // TODO: na tohle chci pridat zpet handler - copyExpToNewBox nebo tak neco
                    // this.props.editExpression(history[0].ast, state.strategy, singleLetterNames)
                  }
                />
              </Step>
            </li>
          </ul>
          <p className='inactiveMessage'>
            Collapsing { history.length - 1 } steps. Double click to activate this box.
          </p>
        </div>
      )
    }

    return (
      <div className={ className }>
        <Controls
          isExercise={ isExercise }
          makeExercise={ () =>
            this.props.setBoxState({
              ...state,
              isExercise : true
            })
          }
          endExercise={ () =>
            this.props.setBoxState({
              ...state,
              isExercise : false
            })
          }
        />
        <ul className='UL'>
          {
            mapLeftFromTo(0, history.length - 2, history, (stepRecord : StepRecord, i : Number) =>
              <li key={ i.toString() } className='inactiveStep LI' >
                <Step
                  breakpoints={ breakpoints }
                  addBreakpoint={ () => {} }
                  stepRecord={ stepRecord }
                  strategy={ this.props.globalStrategy }
                >
                  <i
                    className="hiddenIcon fas fa-pencil-alt"
                    onClick={ () => {}
                      // TODO: na tohle chci pridat zpet handler - copyExpToNewBox nebo tak neco
                      // this.props.editExpression(stepRecord.ast, state.strategy, singleLetterNames)
                    }
                  />
                </Step>
              </li>)
          }
          <li key={history.length - 1} className='activeStep LI'>
            <Step
              breakpoints={ breakpoints }
              addBreakpoint={ this.addBreakpoint }
              stepRecord={ history[history.length - 1] }
              strategy={ this.props.globalStrategy }
            >
                <i
                  className="hiddenIcon fas fa-pencil-alt"
                  onClick={ () => {}
                    // TODO: na tohle chci pridat zpet handler - copyExpToNewBox nebo tak neco                    
                    // this.props.editExpression(history[history.length - 1].ast, state.strategy, singleLetterNames)
                  }
                />
            </Step>
          </li>
        </ul>

        <Editor
          placeholder={ placeholder } // data
          content={ content } // data
          caretPosition={ caretPosition } // data
          syntaxError={ syntaxError } // data
          isMarkDown={ false } // data

          onContent={ this.onContent } // fn
          onEnter={ this.onEnter } // fn // tohle asi bude potreba
          onExecute={ this.onExecute } // fn // tohle asi bude potreba
        />

      </div>
    )
  }

  addBreakpoint (breakpoint : Breakpoint) : void {
    let { state, setBoxState } : EvaluationProperties = this.props
  
    setBoxState({
      ...state,
      breakpoints : [ ...state.breakpoints, breakpoint ],
    })
  }

  onContent (content : string, caretPosition : number) : void {
    const { state, setBoxState } = this.props

    setBoxState({
      ...state,
      editor : {
        ...state.editor,
        content,
        caretPosition,
        syntaxError : null,
      }
    } )
    // this.updateURL(expression) // tohle musim nejak vyresit - mozna ta metoda setBoxState v APP bude checkovat propisovat do URL
  }

  onEnter () : void {
    const { expression, isExercise, editor : { content } } = this.props.state

    if (expression === '') {
      this.onSubmitExpression()
    }
    else if (content === '') {
      if (isExercise) {
        this.onExerciseStep()
      }
      else {
        this.onStep()
      }
    }
    else {
      console.log('TODO: deje se neco co si neosetril')
    }
  }

  onSubmitExpression () : void {
    const { state, setBoxState } = this.props
    // TODO: maybe cancel and clear URL only after succsessful parsing
    // this.cancelUpdate() // deal with it later
    
    const {
      editor : { content },
    } = state

    // window.location.hash = encodeURI(expression)
    // history.pushState({}, "", "#" + encodeURI(expression)) // TODO: deal with later

    try {
      const ast : AST = this.parseExpression(content)
      // history.pushState({}, "", "#" + encodeURI('')) // // TODO: later

      setBoxState({
        ...state,
        ast,
        expression : content,
        history : [ {
          ast : ast.clone(),
          lastReduction : None,
          step : 0,
          message : '',
          isNormalForm : false
        } ],
        editor : {
          content : '',
          caretPosition : 0,
          placeholder : PromptPlaceholder.EVAL_MODE,
          syntaxError : null,
        }
      })

    } catch (exception) {
      // this.updateURL(expression) // TODO: later

      setBoxState({
        ...state,
        editor : {
          ...state.editor,
          syntaxError : null,
        }
      })
    }
  }

  onExerciseStep () {
    const { state, setBoxState } = this.props
    const { strategy, history, editor : { content } } = state
    try {
      const userAst : AST = this.parseExpression(content)
      const stepRecord : StepRecord = history[history.length - 1]
      const { isNormalForm, step } = stepRecord
      let { ast, lastReduction } = stepRecord
      ast = ast.clone()

      if (isNormalForm) {
        // TODO: do something about it
        // say user - there are no more steps and it is in normal form        
        // TODO: consider immutability
        stepRecord.message = 'No more steps available. Expression is in normal form.'

        setBoxState({
          ...state,
        })

        return
      }
    
      const normal : _Evaluator = new (strategyToEvaluator(strategy) as any)(ast)
      lastReduction = normal.nextReduction
    
      if (normal.nextReduction instanceof None) {
        // TODO: refactor PLS - update history
        // TODO: say user it is in normal form and they are mistaken
        stepRecord.isNormalForm = true
        stepRecord.message = 'Expression is already in normal form.'
        
        setBoxState({
          ...state,
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
        message = `Incorrect step. ${content}`
      }

      setBoxState({
        ...state,
        history : [ ...history, { ast, lastReduction, step : step + 1, message, isNormalForm : false } ],
        editor : {
          ...state.editor,
          content : '',
          caretPosition : 0,
          placeholder : PromptPlaceholder.VALIDATE_MODE,
          syntaxError : null,
        }
      })
    } catch (exception) {
      // TODO: print syntax error
      // TODO: do it localy - no missuse of onSubmit

      // TODO: print syntax error
    }
  }

  onStep () : void {
    const { state, setBoxState } = this.props
    const { strategy, history, editor : { content } } = state
    const stepRecord = history[history.length - 1]
    const { isNormalForm, step } = stepRecord
    let { ast, lastReduction } = stepRecord
    ast = ast.clone()
  
    if (isNormalForm) {
      return
    }

    const normal : _Evaluator = new (strategyToEvaluator(strategy) as any)(ast)
    lastReduction = normal.nextReduction
  
    if (normal.nextReduction instanceof None) {
      stepRecord.isNormalForm = true
      stepRecord.message = 'Expression is in normal form.'
      
      setBoxState({
        ...state,
      })
      
      return
    }
  
    ast = normal.perform()
  
    setBoxState({
      ...state,
      history : [ ...history, { ast, lastReduction, step : step + 1, message : '', isNormalForm : false } ],

    })
  }

  onExecute () : void {
    const { state, setBoxState } = this.props
    const { isRunning, isExercise } = state

    if (isExercise) {
      // TODO: exercises can not be run - some message to user???
      return
    }

    if (isRunning) {
      this.onStop()
    }
    else {
      const { timeout, history } = state
      const stepRecord = history[history.length - 1]
  
      if (stepRecord.isNormalForm) {
        return
      }
      
      const { ast, step, lastReduction, isNormalForm, message } = stepRecord
      history.push(history[history.length - 1])
      history[history.length - 2] = { ast : ast.clone(), step, lastReduction, message : 'Skipping some steps...', isNormalForm }

      setBoxState({
        ...state,
        isRunning : true,
        timeoutID : window.setTimeout(this.onRun, timeout),
      })
    }
  }

  onRun () : void {
    const { state, setBoxState } = this.props
    const { strategy } = state
    let { history, isRunning, breakpoints, timeoutID, timeout } = state
    const stepRecord : StepRecord = history[history.length - 1]
    const { isNormalForm, step } = stepRecord
    let { lastReduction } = stepRecord

    if ( ! isRunning) {
      return
    }
    
    if (isNormalForm) {
      setBoxState({
        ...state,
        isRunning : false,
        timeoutID : undefined,
      })
  
      return
    }
  
    let { ast } = stepRecord
    const normal : _Evaluator = new (strategyToEvaluator(strategy) as any)(ast)
    lastReduction = normal.nextReduction
    
    if (normal.nextReduction instanceof None) {
      // TODO: consider immutability
      history.pop()
      history.push({
        ast,
        lastReduction : stepRecord.lastReduction,
        step,
        message : 'Expression is in normal form.',
        isNormalForm : true
      })
  
      setBoxState({
        ...state,
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

    if (breakpoint !== undefined) {
      // TODO: consider immutability
      if (normal.nextReduction instanceof Expansion) {
        breakpoint.broken.add(normal.nextReduction.target)
      }
      if (normal.nextReduction instanceof Beta && normal.nextReduction.redex.left instanceof Lambda) {
        breakpoint.broken.add(normal.nextReduction.redex.left.argument)
      }

      window.clearTimeout(timeoutID)

      setBoxState({
        ...state,
        isRunning : false,
        timeoutID,
      })

      return
    }
  
    ast = normal.perform()
    // steps++

    history[history.length - 1] = { ast, lastReduction, step : step + 1, message : '', isNormalForm }
    
    setBoxState({
      ...state,
      timeoutID : window.setTimeout(this.onRun, timeout)
    })
  }

  onStop () : void {
    const { state, setBoxState } = this.props
    const { timeoutID } = state
  
    window.clearTimeout(timeoutID)
  
    setBoxState({
      ...state,
      isRunning : false,
      timeoutID : undefined
    })
  }

  // TODO: breakpointy se pak jeste musi predelat
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

  // THROWS Exceptions
  parseExpression (expression : string) : AST {
    // const { macroTable } : AppState = this.state
    const { singleLetterNames : singleLetterVars } = this.props.state

    const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ'], singleLetterVars })
    const ast : AST = parse(tokens, {}) // TODO: fix macros - Context API

    return ast
  }
}