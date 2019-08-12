import React from 'react'
const ReactMarkdown = require('react-markdown')
import 'github-markdown-css'

import { BoxType, BoxState } from './Box'
import Editor from './Editor'


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
    // action : ActionType
  }
}

export interface NoteProperties {
  state : NoteState
  editor : JSX.Element
  isActive : boolean
  onEnter () : void
  onEditNote () : void
}

export default function Note (props : NoteProperties) : JSX.Element {
  const { state : { note, editor : { placeholder, content, caretPosition, syntaxError } } } : NoteProperties = props

  if (props.state.isEditing) {
    return (
      <div className='box boxNoteEditor'>
        
        <Editor
          placeholder={ placeholder } // data
          content={ content } // data
          caretPosition={ caretPosition } // data
          syntaxError={ syntaxError } // data
          
          strategy={ this.state.settings.strategy } // data
          singleLetterNames={ this.state.settings.singleLetterNames } // data
          isExercise={ isExercise } // data
          action={ this.state.editor.action } // data
          isMarkDown={ this.state.settings.isMarkDown } // data

          onContent={ this.onExpression } // fn
          onEnter={ this.onEnter } // fn
          onRun={ this.onRun } // fn
          onReset={ this.onClear } // fn
          onStrategy={ (strategy : EvaluationStrategy) => this.setState({
            ...this.state,
            settings : {
              ...this.state.settings,
              strategy,
            }
          }) }
          onSingleLetterNames={ (enabled : boolean) => this.setState({
            ...this.state,
            settings : {
              ...this.state.settings,
              singleLetterNames : enabled,
            }
          }) }
          onExercise={ (enabled : boolean) => this.setState({
            ...this.state,
            settings : {
              ...this.state.settings,
              isExercise : enabled,
            }
          }) }
          onActionSelect={ (action : ActionType) => this.setState({
            ...this.state,
            editor : {
              ...this.state.editor,
              action,
            }
          }) }
          onActionClick={ () => {
            const { editor : { action } } = this.state

            if (action === ActionType.ENTER_EXPRESSION) {
              this.onEnter()
              return
            }
            if (action === ActionType.NEXT_STEP) {
              this.onStep()
              return
            }
            if (action === ActionType.RUN) {
              // implement
              return
            }
            if (action === ActionType.ENTER_EXERCISE) {
              this.setState({
                ...this.state,
                settings : {
                  ...this.state.settings,
                  isExercise : true,
                }
              }, () => this.onEnter())
            }
            else {
              // implement or delete 
            }
          } }
        />


        <div id="controls">
          <button onClick={ props.onEnter }>
            Save
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className='box boxNote markdown-body'>
      <ReactMarkdown source={ note } />
      <div id="controls">
          <button onClick={ props.onEditNote }>
            Edit
          </button>
        </div>
    </div>
  )
}