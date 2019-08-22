import React from 'react'

import { BoxType, BoxState } from './Box'
import { trimStr } from '../misc'
import Editor from './Editor';


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
  defineMacro (name : string, definition : string) : void
}

export default function MacroDefinition (props : MacroDefinitionProperties) : JSX.Element {
  const { state, setBoxState, defineMacro } = props
  const { macroName, macroExpression } = state
  const { editor : { content, caretPosition, placeholder, syntaxError } } = state

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
    const [ macroName, macroExpression ] : Array<string> = content.split(':=').map(trimStr)
    // TODO: parse name part and expression part !!!

    setBoxState({
      ...state,
      macroName,
      macroExpression,
    })

    defineMacro(macroName, macroExpression)
  
    // const newMacroTable : MacroMap = {
    //   ...macroTable,
    //   [macroName] : macroExpression
    // }
    // this.updateMacros(newMacroTable)
  }

  // TODO: implement same as Evaluator - editor and stuff
  if (macroName === '' && macroExpression === '') {
    return (
      <div className='box boxMacro inactiveBox'>
          <p className='emptyStep'>Empty macro box. Write [macro name] := and [λ expression] and hit enter.</p>
          <Editor
            placeholder={ placeholder } // data
            content={ content } // data
            caretPosition={ caretPosition } // data
            syntaxError={ syntaxError } // data
            isMarkDown={ false } // data

            onContent={ onContent } // fn
            onEnter={ onSubmit } // fn // tohle asi bude potreba
            onExecute={ () => {} } // fn // TODO: tohle Macro nepotrebuje
          />
          </div>
    )
  }

  return (
    <div className='box boxMacro'>
      { macroName } := { macroExpression }
    </div>
  )
}