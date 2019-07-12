import React from 'react'
const ReactMarkdown = require('react-markdown')
// const renderers = require('react-markdown-github-renderers')
import 'github-markdown-css'

import { BoxType, BoxState } from './Box';


export interface NoteState {
  __key : string
  type : BoxType
  note : string
}

export interface NoteProperties {
  state : NoteState
}

export default function Note (props : NoteProperties) : JSX.Element {
  const { state : { note } } : NoteProperties = props

  return (
    <div className='box boxNote markdown-body'>
      <ReactMarkdown source={ note } />
    </div>
  )
}