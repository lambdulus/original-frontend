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
  }
}

export interface NoteProperties {
  state : NoteState
  isActive : boolean

  setBoxState (state : BoxState) : void
  makeActive () : void
  addBox (boxState : BoxState) : void
}

export default function Note (props : NoteProperties) : JSX.Element {
  const {
    state : {
      note,
      editor : { placeholder, content, caretPosition, syntaxError },
      isEditing,
    },
    isActive,
    setBoxState,
    makeActive,
  } = props

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
    // this.updateURL(expression) // tohle musim nejak vyresit - mozna ta metoda setBoxState v APP bude checkovat propisovat do URL
  }

  const onSubmitNote = () => {
    setBoxState({
      ...props.state,
      note : content,
      isEditing : false,
    })
  }


  if (isEditing && isActive) {
    return (
      <div className='box boxNoteEditor'>
        {/* <p className='emptyStep'>Empty note box.</p>         */}
        <Editor
          placeholder={ placeholder } // data
          content={ content } // data
          caretPosition={ caretPosition } // data
          syntaxError={ syntaxError } // data
          isMarkDown={ true } // data
          
          onContent={ onContent } // fn
          onEnter={ onSubmitNote } // fn
          onExecute={ () => {} } // fn
          // onReset={ this.onClear } // fn not yet
        />


        <div id="controls">
          <button onClick={ () => onSubmitNote() }>
            Save
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className='box boxNote markdown-body'>
      {/* {
        note === '' ? 
          <p className='emptyStep'>Empty note box.</p>
        :
          null
      } */}
      <ReactMarkdown source={ note } />
      <div id="controls">
          <button onClick={ () => {
            setBoxState({
              ...props.state,
              isEditing : true,
            })
            makeActive()            
          }
          }
            
          >
            Edit
          </button>
        </div>
    </div>
  )
}