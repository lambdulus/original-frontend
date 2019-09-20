import { MacroMap, AST, ASTReduction, NormalEvaluator, ApplicativeEvaluator, OptimizeEvaluator } from "lambdulus-core"

import { HANDY_MACROS, getSavedMacros } from "./misc"


//////////////////////////////////

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

export const DEFAULT_STATE : AppState = {
  macroTable : { ...HANDY_MACROS, ...getSavedMacros() },
  submittedBoxes : [],
  screen : Screen.main,
  activeBoxIndex : -1,
}

//////////////////////////////////

export type _Evaluator = NormalEvaluator | ApplicativeEvaluator | OptimizeEvaluator

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

//////////////////////////////////

export enum BoxType {
  EXPRESSION,
  MACRO,
  NOTE
}

export type BoxState = EvaluationState | MacroDefinitionState | NoteState

//////////////////////////////////

export interface MacroDefinitionState {
  __key : string
  type : BoxType
  macroName : string
  macroExpression : string
  singleLetterNames : boolean
  editor : {
    placeholder : string
    content : string
    caretPosition : number
    syntaxError : Error | null
  }
}

//////////////////////////////////

export interface NoteState {
  __key : string
  type : BoxType
  note : string
  isEditing : boolean
  editor : {
    placeholder : string
    content : string
    caretPosition : number
    syntaxError : Error | null
  }
}

//////////////////////////////////