import React, { Component } from 'react';
import { AST, Lexer, Parser, Token } from 'lambdulus-core'


import InputField, { } from './components/InputField'
import Controls, { ControlProps } from './components/Controls'
import Result from './components/Result'

// import logo from './logo.svg';
// import './App.css';

class App extends Component<any, { ast : AST | null }> {
  constructor (props : object) {
    super(props)

    this.state = {
      ast : null
    }

    this.run = this.run.bind(this)
    this.stepOver = this.stepOver.bind(this)
    this.stepIn = this.stepIn.bind(this)
    this.stepBack = this.stepBack.bind(this)
    this.onEntry = this.onEntry.bind(this)
  }

  render() {
    const controlProps : ControlProps = {
      run : this.run,
      stepOver : this.stepOver,
      stepIn : this.stepIn,
      stepBack : this.stepBack,
      canRun : true,
      canStepOver : true,
      canStepIn : true,
      canGoBack : true,
    }


    return (
      <div className="App">
        <InputField onEntry={ this.onEntry } />
        <br />
        <Controls { ...controlProps } />
        <Result result={ this.state.ast ? this.state.ast.print() : '' } />
      </div>
    );
  }

  run () {
    // (Y (λ f n . (<= n 1) 1 (* n (f (- n 1))) ) 3)
    // console.log('RUN UNTIL BREAKPOINT OR NORMAL FORM')
    if (this.state.ast) {
      const { tree } = this.state.ast.reduceNormal()
      this.setState({ ast : tree })
    }
  }

  stepOver () {

  }

  stepIn () {

  }

  stepBack () {

  }

  onEntry (expression : string) {
    const tokens : Array<Token> = Lexer.tokenize(expression, { lambdaLetters : ['λ'], singleLetterVars : false })
    const ast : AST = Parser.parse(tokens)

    this.setState({ ast })

  }
}

export default App;
