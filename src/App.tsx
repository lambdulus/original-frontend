import React, { Component, ChangeEvent } from 'react';

import {
  AST,
  tokenize,
  parse,
  Token,
  MacroMap,
  None,
  NormalEvaluator,
  Expansion,
  Macro,
  ChurchNumeral,
  Variable,
  Lambda,
  Beta,
  ASTReduction,
  ApplicativeEvaluator,
  OptimizeEvaluator
} from 'lambdulus-core'

import './App.css'


export default class App extends Component<{}, {}> {
  constructor (props : object) {
    super(props)

    
  }

  render () : JSX.Element {
    return null as any
  }

  
}