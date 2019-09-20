// TODOs
// hydratace a dehydratace kompletniho statu
//
//

import React, { ChangeEvent } from 'react'
import { AST, tokenize, parse, Token, MacroMap, None } from 'lambdulus-core'

import { AppState, Screen, BoxState, BoxType, EvaluationState } from '../AppTypes'

import '../styles/MenuBar.css'

interface MenuBarProperties {
  state : AppState
  onImport (state : AppState) : void
  onScreenChange (screen : Screen) : void
}

export default function MenuBar (props : MenuBarProperties) : JSX.Element {
  const { state, onImport, onScreenChange } : MenuBarProperties = props
  const { screen } = state

  const dehydrated : object = dehydrate(state)

  const serialized : string = JSON.stringify(dehydrated)
  const link : string = createURL(serialized)

  return (
    <div id="topbar">
      {/* <div>
        <i id='notebooks' className="icon fas fa-book-open fa-2x" />
        <p className='iconLabel'>Notebooks</p>
      </div> */}

      <div>
        {
          screen === Screen.main ?
            <i className="icon fas fa-list-ul fa-2x" onClick={ () => onScreenChange(Screen.macrolist) } />
            :
            <i className="icon far fa-window-close fa-2x" onClick={ () => onScreenChange(Screen.main) } />
        }
        <p className='iconLabel'>Macros</p>
      </div>        
        
      <div>
        <a
          className='export'
          href={ link }
          download="notebook_lambdulus.json"
          onClick={ () => setTimeout(() => window.URL.revokeObjectURL(link), 10) }
        >
          <i id='download' className="icon fas fa-cloud-download-alt fa-2x" />
        </a>
        <p className='iconLabel'>Export</p>
      </div>
      
      <div>
        <input type="file" accept="application/json" id="input" onChange={ (e) => onFiles(e, onImport) } />
        <label htmlFor="input"><i className="icon fas fa-cloud-upload-alt fa-2x"></i></label>
        <p className='iconLabel'>Import</p>
      </div>      
    </div>
  )
}

function dehydrateBox (box : BoxState) : BoxState {
  const { type } : BoxState = box

  if (type === BoxType.EXPRESSION) {

    return {
      ...box,
      ast : null as any, // TODO: don't
      history : [], // TODO: don't
      isRunning : false,
      breakpoints : [], // TODO: solve how to don't
      timeoutID : undefined,
    }
  }

  return box
}

function dehydrate (state : AppState) : AppState {
  return {
    ...state,
    submittedBoxes : state.submittedBoxes.map(dehydrateBox)
  }
}

function hydrateBox (box : BoxState, macroTable : MacroMap) : BoxState {
  const { type } : BoxState = box
  
  if (type === BoxType.EXPRESSION) {
    const { singleLetterNames } = box as EvaluationState
    const ast : AST = parseExpression((box as EvaluationState).expression, { macroTable, singleLetterNames })

    return {
      ...box,
      ast,
      history : [ { ast, lastReduction : None, step : 0, message : '', isNormalForm : false } ],
    }
  }

  return box
}

function hydrate (dehydrated : AppState) : AppState {
  const { macroTable } = dehydrated
  const config = { macroTable }

  return {
    ...dehydrated,
    submittedBoxes : dehydrated.submittedBoxes.map((box) => hydrateBox(box, macroTable))
  }
}

interface Config {
  singleLetterNames : boolean
  macroTable : MacroMap
}

function parseExpression (expression : string, config : Config) : AST {
  const { singleLetterNames : singleLetterVars, macroTable } : Config = config
  
  const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ'], singleLetterVars })
  const ast : AST = parse(tokens, macroTable)

  return ast
}

function onFiles (event : ChangeEvent<HTMLInputElement>, onImport : (state : AppState) => void) : void {
  const { target : { files } } = event
  if (files === null) {
    return
  }

  const file : File = files[0]
  const reader : FileReader = new FileReader
  reader.onload = (event : Event) => {
    const state : AppState = JSON.parse(reader.result as string)

    onImport(hydrate(state))
  }

  reader.readAsText(file) 
}

function createURL (content : string) : string {
  const data = new Blob([ content ], {
    type: 'application/json'
  })

  return window.URL.createObjectURL(data);
}