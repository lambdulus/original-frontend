import React, { ChangeEvent, useState, SetStateAction, Dispatch, KeyboardEvent } from 'react'
// import { SplitButton, Dropdown } from 'react-bootstrap'


import './EditorStyle.css'
import { EvaluationStrategy } from '../App';


export enum ActionType {
  ENTER_EXPRESSION = 'Enter Expression',
  ENTER_EXERCISE = 'Enter Exercise',
  NEXT_STEP = 'Next Step',
  RUN = 'Run',
  ENTER_MD = 'Enter MarkDown',
}

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
  action : ActionType
  onActionClick () : void
  onActionSelect (action : ActionType) : void
  isMarkDown : boolean
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
    action,
    onActionClick,
    onActionSelect,
    isMarkDown,
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
      if (isMarkDown) {
        return
      }
      event.preventDefault()
      onEnter()
    }

    if (event.shiftKey && event.key === 'Enter' && isMarkDown) {
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
      {/* <p className='badge'>ENTER for STEP</p>
      <p className='badge'>CTRL + ENTER for RUN</p>
      <p className='badge'>CTRL + R for RESET</p> */}

      {
        syntaxError ?
        <p className='editorError'>
          { `${syntaxError}` }
        </p>
        :
        null
      }
      

      <div className="editor">
        <InputField
          placeholder={ placeholder }
          expression={ expression }
          lines={ lines }
          caretPosition={ caretPosition }
          onChange={ onChange }
          onKeyDown={ onKeyDown }
        />
        {/* <SplitButton
          title={ action }
          id='editorSplitDropBtn'
          onClick={ onActionClick }
        >
          <Dropdown.Item onSelect={ onActionSelect } eventKey={ ActionType.ENTER_EXPRESSION }>{ ActionType.ENTER_EXPRESSION }</Dropdown.Item>
          <Dropdown.Item onSelect={ onActionSelect } eventKey={ ActionType.ENTER_EXERCISE }>{ ActionType.ENTER_EXERCISE }</Dropdown.Item>
          <Dropdown.Item onSelect={ onActionSelect } eventKey={ ActionType.NEXT_STEP }>{ ActionType.NEXT_STEP }</Dropdown.Item>
          <Dropdown.Item onSelect={ onActionSelect } eventKey={ ActionType.RUN }>{ ActionType.RUN }</Dropdown.Item>
          <Dropdown.Item onSelect={ onActionSelect } eventKey={ ActionType.ENTER_MD } active>{ ActionType.ENTER_MD }</Dropdown.Item>
        </SplitButton> */}
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