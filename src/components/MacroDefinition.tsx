import React, { useContext } from 'react'

import { trimStr } from '../misc'
import Editor from './Editor'
import { tokenize, parse, AST, Token, Variable, builtinMacros } from '@lambdulus/core'
import { DefineMacroContext } from './MethodInjector'
import { MacroDefinitionState, BoxState } from '../AppTypes'
import { DeleteBox } from './BoxSpace'


export interface MacroDefinitionProperties {
  state : MacroDefinitionState
  setBoxState (boxState : BoxState) : void
  // addBox (boxState : BoxState) : void
}

export default function MacroDefinition (props : MacroDefinitionProperties) : JSX.Element {
  const { state, setBoxState } = props
  const { macroName, macroExpression, singleLetterNames } = state
  const { editor : { content, caretPosition, placeholder, syntaxError } } = state

  const deleteBox = useContext(DeleteBox)

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

  const defineMacro = useContext(DefineMacroContext)

  const onSubmit = () => {
    const [ macroName, macroExpression ] : Array<string> = content.split(':=').map(trimStr)

    // TODO: refactor later - this is just dirty little quick fix
    if ( ! isMacroUnambigous(macroName)) {
      setBoxState({
        ...state,
        editor : {
          ...state.editor,
          syntaxError : new Error(`Macro name is not valid. It redefines built-in Macro.`),
        }
      })

      return
    }

    if ( ! isValidName(macroName, singleLetterNames)) {
      setBoxState({
        ...state,
        editor : {
          ...state.editor,
          syntaxError :
          // TODO: please fix this - only dirty quick impl
            new Error(`Macro name is not valid.
            ${singleLetterNames && macroName.length !== 1 ? 'Name should be single letter.' : '' }`),
        }
      })

      return
    }

    if ( ! isValidExpression(macroExpression, singleLetterNames)) {
      setBoxState({
        ...state,
        editor : {
          ...state.editor,
          syntaxError : new Error(`Macro expression is not valid.`)
        }
      })

      return
    }

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
          <p className='emptyStep'>Empty macro box.</p>
          <i className='removeBox far fa-trash-alt' onClick={ deleteBox } title='Remove this Box' />
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
      <i className='removeBox far fa-trash-alt' onClick={ deleteBox } title='Remove this Box' />
    </div>
  )
}

// TODO: in the future there should be more then boolean to indicate validity
function isValidName (name : string, singleLetterNames : boolean) : boolean {
  try {
    const root : AST = parseExpression(name, singleLetterNames)

    return root instanceof Variable
  }
  catch (exception) {
    return false
  }
}

// THROWS Exceptions
function parseExpression (expression : string, singleLetterNames : boolean) : AST {
  const macroTable = {}
  const singleLetterVars : boolean = singleLetterNames

  const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ'], singleLetterVars })
  const ast : AST = parse(tokens, macroTable)

  return ast
}

function isMacroUnambigous (name : string) : boolean {
  return ! (name in builtinMacros)
}

function isValidExpression (expression : string, singleLetterNames : boolean) : boolean {
  try {
    parseExpression(expression, singleLetterNames)

    return true
  }
  catch (exception) {
    return false
  }
}