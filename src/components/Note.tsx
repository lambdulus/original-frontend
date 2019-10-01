import React, { useContext } from 'react'
const ReactMarkdown = require('react-markdown')
import 'github-markdown-css'

import Editor from './Editor'
import { MakeActiveContext, SetBoxContext, DeleteBox } from './BoxSpace'
import { NoteState } from '../AppTypes'


export interface NoteProperties {
  state : NoteState
  isActive : boolean

  // addBox (boxState : BoxState) : void
}

export default function Note (props : NoteProperties) : JSX.Element {
  const {
    state : {
      note,
      editor : { placeholder, content, caretPosition, syntaxError },
      isEditing,
    },
    isActive,
  } = props
  
  const makeActive = useContext(MakeActiveContext)
  const setBoxState = useContext(SetBoxContext)
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
        {
          note === '' ? 
            <p className='emptyStep'>Empty note box.</p>
          :
            null
        }    
        <div id="controls">
          <button onClick={ () => onSubmitNote() }>
            Save
          </button>
        </div>
        <i className='removeBox far fa-trash-alt' onClick={ deleteBox } />
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
      </div>
    )
  }


  return (
    <div className='box boxNote'>
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
        <i className='removeBox far fa-trash-alt' onClick={ deleteBox } />
      <ReactMarkdown className='markdown-body' source={ note } />
    </div>
  )
}