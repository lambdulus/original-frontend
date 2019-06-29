import React, { ChangeEvent } from 'react'

import './TopBarStyle.css'

import { AppState, Screen } from '../App'
import { EvaluationState } from './Evaluator';
import { AST, BasicPrinter, tokenize, parse, Token, MacroTable, MacroMap } from 'lambdulus-core';
import { BoxState, BoxType } from './Box';


interface TopBarProperties {
  state : AppState
  onImport (state : AppState) : void
  onScreenChange (screen : Screen) : void
}

export default function TopBar (props : TopBarProperties) : JSX.Element {
  const { state, onImport, onScreenChange } : TopBarProperties = props
  const { screen } = state

  const dehydrated : object = dehydrate(state)

  const serialized : string = JSON.stringify(dehydrated)
  const link : string = createURL(serialized)

  return (
    <div id="topbar">
        {/* <i className="icon fas fa-cog fa-2x" /> */}
        <i className="icon fas fa-book-open fa-2x"></i>
        
        {
          screen === Screen.main ?
            <i className="icon fas fa-bars fa-2x" onClick={ () => onScreenChange(Screen.macrolist) } />
            :
            <i className="icon far fa-window-close fa-2x" onClick={ () => onScreenChange(Screen.main) } />
        }

        <i className="save icon fas fa-save fa-2x" />
      <a
        className='export icon'
        href={ link }
        download="notebook_lambdulus.json"
        onClick={ () => setTimeout(() => window.URL.revokeObjectURL(link), 10) }
      >
        <i id='download' className="fas fa-cloud-download-alt fa-2x" />
      </a>
      <input type="file" accept="application/json" id="input" onChange={ (e) => onFiles(e, onImport) } />
      <label htmlFor="input">Import notebook</label>
    </div>
  )
}

function dehydrateBox (box : BoxState) : BoxState {

  // console.log('dehydrate')
  const { type } : BoxState = box

  if (type === BoxType.expression) {

    // console.log('dehydrate expression')
    return {
      ...box,
      ast : null as any,
      history : [],
      isRunning : false,
      lastReduction : null,
      breakpoints : [],
      timeoutID : undefined,
    }
  }

  // console.log('dehydrate something else')

  return box
}

function dehydrate (state : AppState) : AppState {
  return {
    ...state,
    submittedExpressions : state.submittedExpressions.map(dehydrateBox)
  }
}

function hydrateBox (box : BoxState, config : Config) : BoxState {
  const { type } : BoxState = box
  
  if (type === BoxType.expression) {
    const ast : AST = parseExpression((box as EvaluationState).expression, config)

    return {
      ...box,
      ast,
      history : [ ast ],
    }
  }

  return box
}

function hydrate (dehydrated : AppState) : AppState {
  const { singleLetterVars, macroTable } = dehydrated
  const config = { singleLetterVars, macroTable }

  return {
    ...dehydrated,
    submittedExpressions : dehydrated.submittedExpressions.map((box) => hydrateBox(box, config))
  }
}

interface Config {
  singleLetterVars : boolean
  macroTable : MacroMap
}

function parseExpression (expression : string, config : Config) : AST {
  const { singleLetterVars, macroTable } : Config = config
  
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

  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  // if (textFile !== null) {
  //   window.URL.revokeObjectURL(textFile);
  // }

  return window.URL.createObjectURL(data);
}