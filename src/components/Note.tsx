import React from 'react'
const ReactMarkdown = require('react-markdown')
// const renderers = require('react-markdown-github-renderers')
import 'github-markdown-css'

import { BoxType, BoxState } from './Box';


export interface NoteState {
  __key : string
  type : BoxType
  note : string
  isEditing : boolean
}

export interface NoteProperties {
  state : NoteState
  editor : JSX.Element
  isActive : boolean
  onEnter () : void
  onEditNote () : void
}

export default function Note (props : NoteProperties) : JSX.Element {
  const { state : { note } } : NoteProperties = props

  if (props.state.isEditing) {
    return (
      <div className='box boxNoteEditor'>
        { props.editor }
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