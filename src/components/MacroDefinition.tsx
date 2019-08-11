import React from 'react'

import { BoxType, BoxState } from './Box'


export interface MacroDefinitionState {
  __key : string
  type : BoxType
  macroName : string
  macroExpression : string
}

export interface MacroDefinitionProperties {
  state : MacroDefinitionState
}

export default function MacroDefinition (props : MacroDefinitionProperties) : JSX.Element {
  const { state : { macroName, macroExpression } } : MacroDefinitionProperties = props

  return (
    <div className='box boxMacro'>
      { macroName } := { macroExpression }
    </div>
  )
}