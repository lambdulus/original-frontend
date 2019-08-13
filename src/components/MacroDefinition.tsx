import React from 'react'

import { BoxType, BoxState } from './Box'


export interface MacroDefinitionState {
  __key : string
  type : BoxType
  macroName : string
  macroExpression : string
  editor : {
    placeholder : string
    content : string
    caretPosition : number
    syntaxError : Error | null
    // action : ActionType
  }
}

export interface MacroDefinitionProperties {
  state : MacroDefinitionState
}

export default function MacroDefinition (props : MacroDefinitionProperties) : JSX.Element {
  const { state : { macroName, macroExpression } } : MacroDefinitionProperties = props

  // TODO: implement same as Evaluator - editor and stuff

  return (
    <div className='box boxMacro'>
      <p>This is not working properly yet</p>
      { macroName } := { macroExpression }
    </div>
  )
}