import React, { Component } from 'react';
import { AST, tokenize, parse, ASTReduction, Token, NormalEvaluator, None } from 'lambdulus-core'


import InputField, { } from './components/InputField'
import Controls, { ControlProps } from './components/Controls'
import Result from './components/Result'

// import logo from './logo.svg';
// import './App.css';

interface state {
  ast : AST | null,
  steps : number,
  previousReduction : ASTReduction | null,

}

const inputStyle = {
  margin: 'auto',
  marginTop: '5vh',
  width: '80%',
  borderBottom: '2px solid gray',
  padding: '10px',
}

const resultStyle = {
  margin: 'auto',
  width: '80%',
  marginTop: '2vh'
}

class App extends Component<any, state> {
  constructor (props : object) {
    super(props)

    this.state = {
      ast : null,
      steps : 0,
      previousReduction : null
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

    const { ast, steps } = this.state

    return (
      <div className="App">
        <div style={ inputStyle }>
        <InputField onEntry={ this.onEntry } />
        <br />
        <Controls { ...controlProps } />
        <br />
        Steps: { steps }
        <br />
        <br />
        </div>
        <div style={ resultStyle }>
          <Result tree={ ast } />
        </div>
      </div>
    );
  }

  run () {
    // (Y (λ f n . (<= n 1) 1 (* n (f (- n 1))) ) 3)
    let { ast, steps } = this.state
    if (ast === null) {
      return
    }

    while (true) {
      const normal : NormalEvaluator = new NormalEvaluator(ast)
    
      if (normal.nextReduction instanceof None) {
        break
      }
    
      ast = normal.perform() // perform next reduction
      steps++
    }


    this.setState({ ast, steps })
  }

  stepOver () {

  }

  stepIn () {

  }

  stepBack () {

  }

  onEntry (expression : string) {
    const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ', '~'], singleLetterVars : false })
    const ast : AST = parse(tokens)

    this.setState({ ast, steps : 0, previousReduction : null })
  }
}

export default App;
