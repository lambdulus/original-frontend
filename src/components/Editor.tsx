import React, { ChangeEvent, useState, SetStateAction, Dispatch, KeyboardEvent } from 'react'
const { Switch, Radio, Checkbox } = require('pretty-checkbox-react')
import 'pretty-checkbox'

import './EditorStyle.css'
import { EvaluationStrategy } from '../App';


interface EditorProperties {
  placeholder: string
  expression : string
  caretPosition : number
  onExpression (newExpression : string, caretPosition : number) : void
  onEnter () : void
  onRun () : void
  onReset () : void
  onStrategy (strategy : EvaluationStrategy) : void
  // onDelete () : void
  // onStepBack () : void
  syntaxError : Error | null
  strategy : EvaluationStrategy
  singleLetterNames : boolean
  onSingleLetterNames (enable : boolean) : void
  isExercise : boolean,
  onExercise (enable : boolean) : void
}

export default function Editor (props : EditorProperties) : JSX.Element {
  const {
    placeholder,
    expression,
    caretPosition,
    onExpression,
    onEnter,
    onRun,
    onReset,
    syntaxError,
    strategy,
    onStrategy,
    singleLetterNames,
    onSingleLetterNames,
    isExercise,
    onExercise,
    // onDelete,
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
    if (! event.shiftKey && ! event.ctrlKey && event.key === 'Enter') {
      event.preventDefault()
      onEnter()
    }
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault()
      onRun()
    }

    if (event.ctrlKey && event.key === 'r') {
      event.preventDefault()
      onReset()
    }

  }

  return (
    <div className='editorContainer'>
      <p className='badge'>ENTER for STEP</p>
      <p className='badge'>CTRL + ENTER for RUN</p>
      <p className='badge'>CTRL + R for RESET</p>

      <div className='editorSettings'>

        <Switch
          checked={ singleLetterNames }
          onChange={ (e : ChangeEvent<HTMLInputElement>) => onSingleLetterNames(e.target.checked) }
          shape="fill"
        >
          single letter names
        </Switch>

        <Switch
          checked={ isExercise }
          onChange={ (e : ChangeEvent<HTMLInputElement>) => onExercise(e.target.checked) }
          shape="fill"
        >
          exercise
        </Switch>

        <div className='strategies inlineblock'>
          <Radio style="fill" name="strategy" checked={ strategy === EvaluationStrategy.NORMAL } onChange={ () => onStrategy(EvaluationStrategy.NORMAL) } >Normal Evaluation</Radio>
          <Radio style="fill" name="strategy" checked={ strategy === EvaluationStrategy.APPLICATIVE } onChange={ () => onStrategy(EvaluationStrategy.APPLICATIVE) } >Applicative Evaluation</Radio>
          <Radio style="fill" name="strategy" checked={ strategy === EvaluationStrategy.OPTIMISATION } onChange={ () => onStrategy(EvaluationStrategy.OPTIMISATION) } >Optimisation</Radio>
        </div>
      </div>
      <p>
        { syntaxError ? `${syntaxError}` : null }
      </p>

      <div className="editor">
        <InputField
          placeholder={ placeholder }
          expression={ expression }
          lines={ lines }
          caretPosition={ caretPosition }
          onChange={ onChange }
          onKeyDown={ onKeyDown }
        />
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