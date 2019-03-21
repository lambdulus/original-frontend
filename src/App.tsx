import React, { Component, ChangeEvent } from 'react';
import { AST, tokenize, parse, ASTReduction, Token, NormalEvaluator, None } from 'lambdulus-core'

import InputField from './components/InputField'
import Controls, { ControlProps } from './components/Controls'
import Result from './components/Result'
import { debounce } from './helpers';


interface state {
  expression : string,
  lines : number,
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
    
    this.run = this.run.bind(this)
    this.stepOver = this.stepOver.bind(this)
    this.stepIn = this.stepIn.bind(this)
    this.stepBack = this.stepBack.bind(this)
    this.parseExpression = this.parseExpression.bind(this)
    this.onExpressionChange = this.onExpressionChange.bind(this)
    this.autoSave = debounce(this.autoSave.bind(this), 500)
    this.getExpressionFromURL = this.getExpressionFromURL.bind(this)
    this.updateFromURL = this.updateFromURL.bind(this)

    const expression : string = this.getExpressionFromURL()
    const lines : number = expression.split('\n').length
    const ast : AST | null = this.parseExpression(expression)

    window.addEventListener('hashchange', this.updateFromURL)

    this.state = {
      expression,
      lines,
      ast,
      steps : 0,
      previousReduction : null
    }

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

    const { ast, steps, expression, lines } = this.state

    return (
      <div className="App">
        <div style={ inputStyle }>
        <InputField content={ expression } lines={ lines } onChange={ this.onExpressionChange } />
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
    let { ast, steps, previousReduction } = this.state
    if (ast === null || previousReduction instanceof None) {
      return
    }

    while (true) {
      const normal : NormalEvaluator = new NormalEvaluator(ast)
    
      previousReduction = normal.nextReduction
      if (normal.nextReduction instanceof None) {
        break
      }
    
      ast = normal.perform() // perform next reduction
      steps++
    }


    this.setState({ ast, steps, previousReduction })
  }

  stepOver () {
    let { ast, steps, previousReduction } = this.state
    if (ast === null || previousReduction instanceof None) {
      return
    }

    const normal : NormalEvaluator = new NormalEvaluator(ast)

    previousReduction = normal.nextReduction  
    if (normal.nextReduction instanceof None) {
      return
    }
  
    ast = normal.perform() // perform next reduction
    steps++


    this.setState({ ast, steps, previousReduction })
  }

  stepIn () {

  }

  stepBack () {

  }

  onExpressionChange (event : ChangeEvent<HTMLTextAreaElement>) : void  {
    let { target : { value : expression } } : { target : { value : string } } = event
    const lines : number = expression.split('\n').length
    expression = expression.replace(/\\/g, 'λ')
    const ast : AST | null = this.parseExpression(expression)

    this.autoSave(expression)
    this.setState({ expression, lines, ast, steps : 0 , previousReduction : null })
  }

  autoSave (expression : string) : void {
    const encoded : string = encodeURI(expression)

    window.location.hash = encoded
  }

  parseExpression (expression : string) : AST | null {
    try {
      const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ', '~'], singleLetterVars : false })
      const ast : AST = parse(tokens)

      console.log('successfuly parsed')

      return ast
    }
    catch (exception) {
      console.log('Something went wrong')
      console.log(exception)
      return null
    }
  }

  getExpressionFromURL () : string {
    const expression : string = decodeURI(window.location.hash.substring(1))
    return expression
  }

  updateFromURL () : void {
    const { expression : currentExpr } : state = this.state
    const expression : string = this.getExpressionFromURL()
    const lines : number = expression.split('\n').length

    if (currentExpr === expression) {
      // breaking cyclic update
      console.log('ALREADY SYNCED')
      return
    }

    const ast : AST | null = this.parseExpression(expression)

    this.setState({ expression, lines, ast, steps : 0, previousReduction : null })
  }
}

export default App;
