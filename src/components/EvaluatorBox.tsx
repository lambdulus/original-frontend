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
  MacroMap,
} from "lambdulus-core"

import '../styles/EvaluatorBox.css'

import { BoxType, BoxState } from './Box'
import { EvaluationStrategy, PromptPlaceholder, ChangeActiveBoxContext } from '../App'
import { TreeComparator } from './TreeComparator'
import EmptyEvaluator from './EmptyEvaluator'
import InactiveEvaluator from './InactiveEvaluator'
import Evaluator from './Evaluator'
import { MakeActiveContext } from './BoxSpace';


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

export interface EvaluationProperties {
  state : EvaluationState
  isActive : boolean
  macroTable : MacroMap

  setBoxState (state : EvaluationState) : void
}

export default class EvaluatorBox extends PureComponent<EvaluationProperties> {
  constructor (props : EvaluationProperties) {
    super(props)

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
    this.createBoxFrom = this.createBoxFrom.bind(this)
  }

  render () : JSX.Element {
    const { state, isActive } : EvaluationProperties = this.props
    const {
      history,
      breakpoints,
      isExercise,
      strategy,
      expression,
      editor,
    } : EvaluationState = state

    let className : string = 'box boxEval'
    const { isNormalForm } = history.length ? history[history.length - 1] : { isNormalForm : false }

    if (expression === '') {
      return (
        <EmptyEvaluator
          className={ className }
          isActive={ this.props.isActive }
          editor={ editor }
          history={ history }

          onContent={ this.onContent }
          onEnter={ this.onEnter }
          onExecute={ this.onExecute }
        />
      )
    }

    if (isExercise) {
      className += ' boxExercise'
    }

    if ( ! isActive) {
      return (
        <MakeActiveContext.Consumer>
          {
            (makeActive : () => void) =>
              <InactiveEvaluator
                className={ className }
                breakpoints={ breakpoints }
                history={ history }
                
                makeActive={ makeActive }
                createBoxFrom={ this.createBoxFrom }
              />
          }
        </MakeActiveContext.Consumer>
      )
    }

    return (
      <Evaluator
        className={ className }
        isExercise={ isExercise }
        state={ state }
        breakpoints={ breakpoints }
        history={ history }
        editor={ editor }
        isNormalForm={ isNormalForm }

        createBoxFrom={ this.createBoxFrom }
        setBoxState={ this.props.setBoxState }
        onContent={ this.onContent }
        onEnter={ this.onEnter }
        onExecute={ this.onExecute }
      />
    )
  }

  createBoxFrom (stepRecord : StepRecord) : EvaluationState {
    const { state } : EvaluationProperties = this.props
    const {
      strategy,
      singleLetterNames,
    } : EvaluationState = state
    const { ast } = stepRecord

    return {
      type : BoxType.EXPRESSION,
      __key : Date.now().toString(),
      expression : ast.toString(),
      ast : ast.clone(),
      history : [ {
        ast : ast.clone(),
        lastReduction : null,
        step : 0,
        message : '',
        isNormalForm : false,
      } ],
      isRunning : false,
      breakpoints : [],
      timeoutID : undefined,
      timeout : 10,
      isExercise : false,
      strategy,
      singleLetterNames,
      editor : {
        placeholder : PromptPlaceholder.EVAL_MODE,
        content : '',
        caretPosition : 0,
        syntaxError : null,
      }
    }
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
    })
  }

  onEnter () : void {
    const { expression, isExercise, editor : { content } } = this.props.state

    if (expression === '') {
      this.onSubmitExpression()
    }
    else if (content !== '' && isExercise) {
      this.onExerciseStep()
    }
    else if (content === '' && (! isExercise)) {
      this.onStep()
    }
    else {
      console.log('Error: Something unexpected just happened. A')
    }
  }

  onSubmitExpression () : void {
    const { state, setBoxState } = this.props
    const {
      editor : { content },
    } = state

    try {
      const ast : AST = this.parseExpression(content)

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
      setBoxState({
        ...state,
        editor : {
          ...state.editor,
          syntaxError : exception.toString(),
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
    const { macroTable } = this.props

    const { singleLetterNames : singleLetterVars } = this.props.state

    const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ'], singleLetterVars })
    const ast : AST = parse(tokens, macroTable)

    return ast
  }
}