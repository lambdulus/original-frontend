import React, { useContext, createContext } from 'react'

import Box, { BoxState, BoxType } from './Box'
import { EvaluationState } from './EvaluatorBox'

import { CreateBox } from './CreateBox'
import { NoteState } from './Note'
import { PromptPlaceholder, EvaluationStrategy, ChangeActiveBoxContext, SetBoxStateContext } from '../App'
import { MacroDefinitionState } from './MacroDefinition'


export interface BoxSpaceProperties {
  submittedBoxes : Array<BoxState>
  activeBoxIndex : number
  
  // removeExpression (index : number) : void // not yet
}

export const MakeActiveContext = createContext(() => {})
export const SetBoxContext = createContext((boxState : BoxState) => {})

export default function BoxSpace (props: BoxSpaceProperties) : JSX.Element {
  const {
    submittedBoxes,
    activeBoxIndex,
  } = props
  const makeActive = useContext(ChangeActiveBoxContext)
  const setBoxState = useContext(SetBoxStateContext)

  if (submittedBoxes.length === 0) {
    return (
      <div className='evaluatorSpace'>
        <div className='bigEmpty'>
          { <CreateBox /> }
        </div>
      </div>
    )
  }

  return (
    <div className='evaluatorSpace'>
      <ul className='evaluatorList UL'>
        { submittedBoxes.map((boxState : BoxState, i : number) =>
          <li className='LI' key={ boxState.__key }>
            <MakeActiveContext.Provider value={ () => makeActive(i) }>
              <SetBoxContext.Provider value={ (boxState : BoxState) => setBoxState(i, boxState) }>
                <Box
                  state={ boxState }
                  isActive={ i === activeBoxIndex }
                  
                  // removeExpression={ () => removeExpression(i) }
                />
              </SetBoxContext.Provider>
            </MakeActiveContext.Provider>
          </li>
          ) }
          <div className='smallEmpty'>
          { <CreateBox /> }
          </div>
      </ul>
    </div>
  )
}

export function createEmptyExp (strategy : EvaluationStrategy, singleLetterNames : boolean) : EvaluationState {
  return {
    type : BoxType.EXPRESSION,
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
      placeholder : PromptPlaceholder.INIT,
      content : '',
      caretPosition : 0,
      syntaxError : null,
    }
  }
}

export function createEmptyMacro (singleLetterNames : boolean) : MacroDefinitionState {
  return {
    type : BoxType.MACRO,
    __key : Date.now().toString(),
    macroName : '',
    macroExpression : '',
    singleLetterNames,
    editor : {
      placeholder : PromptPlaceholder.MACRO,
      content : '',
      caretPosition : 0,
      syntaxError : null
    }
  }
}

export function createEmptyNote () : NoteState {
  return {
    type : BoxType.NOTE,
    __key : Date.now().toString(),
    note : '',
    isEditing : true,
    editor : {
      placeholder : PromptPlaceholder.NOTE,
      content : '',
      caretPosition : 0,
      syntaxError : null,
    }
  }
}