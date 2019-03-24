import React, { Component, ChangeEvent } from 'react';
import { AST, tokenize, parse, ASTReduction, Token, NormalEvaluator, None } from 'lambdulus-core'

import InputField from './components/InputField'
import Controls, { ControlProps } from './components/Controls'
import Result from './components/Result'
import UserMacros from './components/UserMacros';
import { debounce } from './helpers';
import { MacroMap } from 'lambdulus-core/';


interface state {
  expression : string,
  lines : number,
  caretPosition : number,
  ast : AST | null,
  steps : number,
  previousReduction : ASTReduction | null,
  autoCloseParenthesis : boolean,
  macroTable : MacroMap,
  menuOpen: boolean,
  steping : boolean,
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

const sidebarStyle = {
  position: 'fixed' as any,
  top: '0',
  width: '100%',
  height: '80%',
  borderBottom: '2px solid gray',
  backgroundColor: 'white',
}

const configWrapper = {
  margin: '10px'
}

const menuBtnStyle = {
  border: 'none',
  background: 'transparent',
  fontSize: '1.5em',
  cursor: 'pointer',
}

export default class App extends Component<any, state> {
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
    this.addMacro = this.addMacro.bind(this)
    this.removeMacro = this.removeMacro.bind(this)
    this.getMacrosFromLocalStorage = this.getMacrosFromLocalStorage.bind(this)

    window.addEventListener('hashchange', this.updateFromURL)

    const expression : string = this.getExpressionFromURL()
    const lines : number = expression.split('\n').length
    
    this.state = {
      expression,
      lines,
      caretPosition : expression.length,
      ast : null,
      steps : 0,
      previousReduction : null,
      autoCloseParenthesis : false,
      macroTable : this.getMacrosFromLocalStorage(),
      menuOpen: false,
      steping: false,
    }
  }

  componentDidMount () {
    this.setState({ ...this.state, ast : this.parseExpression(this.state.expression) })
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

    const { ast, steps, expression, lines, caretPosition } = this.state

    return (
      <div className="App">
        {
          this.state.menuOpen ?

          <div style={ sidebarStyle }>
            <button title='Close Menu' style={ menuBtnStyle } onClick={() => {
              this.setState({ ...this.state, menuOpen : false })
            }} >)(</button>
            <div style={ configWrapper }>
              <span style={ { fontSize: '1.3em' } } >Autocomplete parethesis</span>
              <input type='checkbox' checked={ this.state.autoCloseParenthesis }
              onChange={ _ => this.setState({ ...this.state, autoCloseParenthesis : !this.state.autoCloseParenthesis}) } />
              <br />
              <br />
              <UserMacros disabled={this.state.steping} macros={ this.state.macroTable } addMacro={ this.addMacro } removeMacro={ this.removeMacro } />
            </div>
          </div>

          :

          <button title='Open Menu' style={ menuBtnStyle } onClick={() => {
            this.setState({ ...this.state, menuOpen : true })
          }} >()</button>
        }
        <div style={ inputStyle }>
        <InputField content={ expression } lines={ lines } caretPosition={ caretPosition }
          onChange={ this.onExpressionChange }  />
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
    let { ast, expression, steps, previousReduction } = this.state
    if (steps === 0) {
      ast = this.parseExpression(expression)
    }
    
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


    this.setState({ ...this.state, ast, steps, previousReduction, steping : false })
  }

  stepOver () {
    let { ast, expression, steps, previousReduction } = this.state
    if (steps === 0) {
      ast = this.parseExpression(expression)
    }

    if (ast === null || previousReduction instanceof None) {
      return
    }

    const normal : NormalEvaluator = new NormalEvaluator(ast)

    previousReduction = normal.nextReduction  
    if (normal.nextReduction instanceof None) {
      this.setState({ ...this.state, steping : false })
      return
    }
  
    ast = normal.perform() // perform next reduction
    steps++


    this.setState({ ...this.state, ast, steps, previousReduction, steping : true })
  }

  stepIn () {

  }

  stepBack () {

  }

  onExpressionChange (event : ChangeEvent<HTMLTextAreaElement>) : void  {
    const { autoCloseParenthesis,  } : state = this.state
    let { target : { value : expression } } : { target : { value : string } } = event
    const lines : number = expression.split('\n').length
    const caretPosition : number = event.target.selectionEnd

    expression = expression.replace(/\\/g, 'λ')
    
    // TODO: if current and expression differs only at last char
    // and this char is `(` then append `)` and put carret before `)`
    if (autoCloseParenthesis
        &&
        expression.charAt(caretPosition - 1) === '('
    ) {
      expression = expression.slice(0, caretPosition) + ')' + expression.slice(caretPosition)
    }

    const ast : AST | null = this.parseExpression(expression)

    this.autoSave(expression)
    this.setState({ expression, lines, ast, steps : 0 , previousReduction : null, caretPosition })
  }

  autoSave (expression : string) : void {
    const encoded : string = encodeURI(expression)

    window.location.hash = encoded
  }

  parseExpression (expression : string) : AST | null {
    try {
      const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ', '~'], singleLetterVars : false })
      const ast : AST = parse(tokens, this.state.macroTable)

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

  getMacrosFromLocalStorage () : MacroMap {
    return JSON.parse(window.localStorage.getItem('macrotable') || '{}')
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

  addMacro (name : string, definition : string) : void {
    // TODO: fix
    const macroTable = { ...this.state.macroTable, [name] : definition }

    this.setState({ ...this.state, macroTable })
    window.localStorage.setItem('macrotable', JSON.stringify(macroTable))
  }

  removeMacro (name : string) : void {
    const macroTable = { ...this.state.macroTable }
    delete macroTable[name]

    this.setState({ ...this.state, macroTable })
    window.localStorage.setItem('macrotable', JSON.stringify(macroTable))
  }
}