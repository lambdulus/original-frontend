import React from 'react'
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
    <div className='box'>
      { note }
    </div>
  )
}