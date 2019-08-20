import React from 'react'

import { BoxType, BoxState } from './Box'
import { trimStr } from '../misc'


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

export interface MacroDefinitionProperties {
  state : MacroDefinitionState
  setBoxState (boxState : BoxState) : void
  addBox (boxState : BoxState) : void
}

export default function MacroDefinition (props : MacroDefinitionProperties) : JSX.Element {
  const { state, setBoxState } = props
  const { macroName, macroExpression } = state

  const onContent = (content : string, caretPosition : number) => {
    setBoxState({
      ...props.state,
      editor : {
        ...props.state.editor,
        content,
        caretPosition,
        syntaxError : null,
      }
    })
  }

  const onSubmit = () => {
    const { editor : { content, caretPosition } } = state
    
    const [ macroName, macroExpression ] : Array<string> = content.split(':=').map(trimStr)
    // TODO: parse name part and expression part !!!

    setBoxState({
      ...state,
      macroName,
      macroExpression,
    })
  
    // const newMacroTable : MacroMap = {
    //   ...macroTable,
    //   [macroName] : macroExpression
    // }
    // this.updateMacros(newMacroTable)
  }

  // TODO: implement same as Evaluator - editor and stuff

  return (
    <div className='box boxMacro'>
      <p>This is not working properly yet</p>
      { macroName } := { macroExpression }
    </div>
  )
}