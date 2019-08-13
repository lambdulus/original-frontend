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
  isActive : boolean
  setBoxState (state : BoxState) : void
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
          isMarkDown={ true } // data
          
          onContent={ () => {} } // fn
          onEnter={ () => {} } // fn
          onExecute={ () => {} } // fn
          // onReset={ this.onClear } // fn not yet
        />


        {/* fix onClick */}
        <div id="controls">
          <button onClick={ () => {} }>
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
        {/* fix onClick */}
          <button onClick={ () => {} }>
            Edit
          </button>
        </div>
    </div>
  )
}