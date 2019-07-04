import React, { ChangeEvent, useState, SetStateAction, Dispatch, KeyboardEvent } from 'react'

import './EditorStyle.css'


interface EditorProperties {
  placeholder: string
  expression : string
  caretPosition : number
  onExpression (newExpression : string, caretPosition : number) : void
  onEnter () : void
  // onDelete () : void
  // onStepBack () : void
  syntaxError : Error | null
}

export default function Editor (props : EditorProperties) : JSX.Element {
  const {
    placeholder,
    expression,
    caretPosition,
    onExpression,
    onEnter,
    // onDelete,
    syntaxError,
    // onStepBack,
  } : EditorProperties = props
  const lines : number = expression.split('\n').length
  

  const onChange = (event : ChangeEvent<HTMLTextAreaElement>) => {
    let { target : { value : expression } } : { target : { value : string } } = event
    const caretPosition : number = event.target.selectionEnd

    expression = expression.replace(/\\/g, 'λ')

    onExpression(expression, caretPosition)
  }

  const onKeyDown = (event : KeyboardEvent<HTMLTextAreaElement>) => {
    if (! event.shiftKey && event.key === 'Enter') {
      event.preventDefault()
      onEnter()
    }
  }

  return (
    <div className='editorContainer'>
      { syntaxError ? `${syntaxError}` : null }

      <div className="editor">
        <InputField
          placeholder={ placeholder }
          expression={ expression }
          lines={ lines }
          caretPosition={ caretPosition }
          onChange={ onChange }
          onKeyDown={ onKeyDown }
        />
        {/* <i id='editorEnter' className="fas fa-plus" onClick={ onEnter } /> */}
        </div>

    </div>
  )
}

interface InputProps {
  placeholder : string
  expression : string
  lines : number
  caretPosition : number
  onChange (event : ChangeEvent<HTMLTextAreaElement>) : void
  onKeyDown (event : KeyboardEvent<HTMLTextAreaElement>) : void
}

function InputField (props : InputProps) : JSX.Element {
  const { placeholder, expression, lines, onChange, onKeyDown, caretPosition } : InputProps = props

  return (
    <textarea
      className='prompt'
      onKeyDown={ onKeyDown }
      onChange={ onChange }
      value={ expression }
      placeholder={ placeholder }
      wrap='hard'
      autoFocus
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={ false }
      rows={ Math.max(lines, 1) } 
      ref={ (element : HTMLTextAreaElement) => {
        if (element !== null) {
          element.selectionStart = caretPosition
          element.selectionEnd = caretPosition
          element.focus()
        }
      } }
    />
  )
}