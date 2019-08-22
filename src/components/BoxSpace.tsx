import React from 'react'

import Box, { BoxState, BoxType } from './Box'
import { EvaluationState } from './Evaluator'
import { EvaluationStrategy } from '../App'
import { MacroDefinitionState } from './MacroDefinition'
import { NoteState } from './Note'
import { MacroMap } from 'lambdulus-core'


export interface BoxSpaceProperties {
  submittedBoxes : Array<BoxState>
  activeBoxIndex : number
  globalStrategy : EvaluationStrategy
  singleLetterNames : boolean
  macroTable : MacroMap
  
  makeActive (index : number) : void
  setBoxState (index : number, state : BoxState) : void
  addEmptyBox (boxState : BoxState) : void
  addBox (boxState : BoxState) : void
  defineMacro (name : string, definition : string) : void
  // removeExpression (index : number) : void // not yet
}

export default function BoxSpace (props: BoxSpaceProperties) : JSX.Element {
  const {
    globalStrategy : strategy,
    singleLetterNames,
    submittedBoxes,
    activeBoxIndex,
    macroTable,
    setBoxState,
    makeActive,
    addBox,
    defineMacro,
  } = props

  const addBoxControls : JSX.Element = (
    <div className='emptyC'>
      <p
        className='plusBtn inlineblock'
        onClick={ () => props.addEmptyBox(createEmptyExp(strategy, singleLetterNames)) }
      >
        <i>+ λ</i>
      </p>
      <p
        className='plusBtn inlineblock'
        onClick={ () => props.addEmptyBox(createEmptyMacro(singleLetterNames)) }
      >
        <i>+ Macro
        </i></p>
      <p
        className='plusBtn inlineblock'
        onClick={ () => props.addEmptyBox(createEmptyNote()) }
      >
        <i>+ MD</i>
      </p>
    </div>
  )

  if (submittedBoxes.length === 0) {
    return (
      <div className='evaluatorSpace'>
        <div className='bigEmpty'>
          { addBoxControls }
        </div>
      </div>
    )
  }

  return (
    <div className='evaluatorSpace'>
      <ul className='evaluatorList UL'>
        { submittedBoxes.map((boxState : BoxState, i : number) =>
          <li className='LI' key={ boxState.__key }>
            <Box
              state={ boxState }
              globalStrategy={ props.globalStrategy }
              isActive={ i === activeBoxIndex }
              macroTable={ macroTable }
              
              setBoxState={ (state : EvaluationState) => setBoxState(i, state) }
              makeActive={ () => makeActive(i) }
              addBox={ addBox }
              defineMacro={ defineMacro }
              // removeExpression={ () => removeExpression(i) }
            />
          </li>
          ) }
          <div className='smallEmpty'>
          { addBoxControls }
          </div>
      </ul>
    </div>
  )
}

function createEmptyExp (strategy : EvaluationStrategy, singleLetterNames : boolean) : EvaluationState {
  return {
    type : BoxType.expression,
    __key : Date.now().toString(),
    expression : '',
    ast : null,
    history : [],
    isRunning : false,
    breakpoints : [],
    timeoutID : undefined,
    timeout : 10,
    isExercise : false,
    strategy,
    singleLetterNames,
    editor : {
      placeholder : 'Type λ expression and hit enter', // TODO: tohle bude chtit fixnout - je nekde nejakej enum na placeholdery???
      content : '',
      caretPosition : 0,
      syntaxError : null,
    }
  }
}

function createEmptyMacro (singleLetterNames : boolean) : MacroDefinitionState {
  return {
    type : BoxType.macro,
    __key : Date.now().toString(),
    macroName : '',
    macroExpression : '',
    singleLetterNames : true,
    editor : {
      placeholder : 'Type macro definition i.e. NAME := [λ expression] and hit enter',
      content : '',
      caretPosition : 0,
      syntaxError : null
    }
  }
}

function createEmptyNote () : NoteState {
  return {
    type : BoxType.note,
    __key : Date.now().toString(),
    note : '',
    isEditing : true,
    editor : {
      placeholder : 'Type note and hit shift enter',
      content : '',
      caretPosition : 0,
      syntaxError : null,
    }
  }
}