import React, { ChangeEvent } from 'react'

import './TopBarStyle.css'

import { AppState } from '../App'
import { EvaluationState } from './Evaluator';
import { AST, BasicPrinter, tokenize, parse, Token } from 'lambdulus-core';


interface TopBarProperties {
  state : AppState
  onImport (state : AppState) : void
}

export default function TopBar (props : TopBarProperties) : JSX.Element {
  const { state, onImport } : TopBarProperties = props
  const dehydrated : object = dehydrate(state)
  const serialized : string = JSON.stringify(dehydrated)
  const link : string = createURL(serialized)

  return (
    <div id="topbar">
        <i className="icon fas fa-bars fa-2x" />
        <i className="save icon fas fa-save fa-2x"></i>
      <a
        className='export icon'
        href={ link }
        download="notebook_lambdulus.json"
        onClick={ () => setTimeout(() => window.URL.revokeObjectURL(link), 10) }
      >
        <i id='download' className="fas fa-cloud-download-alt fa-2x"></i>
      </a>
      <input type="file" accept="application/json" id="input" onChange={ (e) => onFiles(e, onImport) } />
      <label htmlFor="input">Import notebook</label>
    </div>
  )
}

function dehydrate (state : AppState) : AppState {
  return {
    ...state,
    submittedExpressions : state.submittedExpressions.map((evaluation : EvaluationState) => {
      return {
        ...evaluation,
        ast : null as any,
        history : [],
        isRunning : false,
        lastReduction : null,
        breakpoints : [],
        timeoutID : undefined,
      }
    })
  }
}

function hydrate (dehydrated : AppState) : AppState {
  return {
    ...dehydrated,
    submittedExpressions : dehydrated.submittedExpressions.map((evaluation : EvaluationState) => {
      const ast : AST = parseExpression(evaluation.expression, dehydrated)

      return {
        ...evaluation,
        ast,
        history : [ ast ],

      }
    })
  }
}

function parseExpression (expression : string, state : AppState) : AST {
  const { singleLetterVars, macroTable } : AppState = state
  
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