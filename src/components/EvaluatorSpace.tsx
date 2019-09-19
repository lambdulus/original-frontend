import React, { createContext, useContext } from 'react'

import BoxSpace from './BoxSpace'
import { HANDY_MACROS, getSavedMacros } from '../misc'
import { StateContext, AppState } from '../App'


export const MacroTableContext = createContext({ ...HANDY_MACROS, ...getSavedMacros() })

export function EvaluatorSpace (props : {}) : JSX.Element {
  const state : AppState = useContext(StateContext)
  const {
    macroTable,
    submittedBoxes,
    activeBoxIndex,
  } : AppState = state


  return (
    <MacroTableContext.Provider value={ macroTable }>
      <BoxSpace
        submittedBoxes={ submittedBoxes } // 1 LEVEL
        activeBoxIndex={ activeBoxIndex } // 1 LEVEL

        // removeExpression={ this.onRemoveExpression } // to bude asi potreba az zbytek bude hotovej 
        // onEnter={ this.onEnter } // ten se presune dolu do Boxu
        // onEditNote={ this.onEditNote } // zmeni se na onChangeActiveBox a isEditing se udela v Boxu
      />
    </MacroTableContext.Provider>
  )
}