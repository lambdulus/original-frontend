import React, { Component, ChangeEvent } from 'react';
import { AST, tokenize, parse, ASTReduction, Token, NormalEvaluator, None, builtinMacros, MacroTable, Application, Beta, Lambda } from 'lambdulus-core'

import InputField from './components/InputField'
import Controls, { ControlProps } from './components/Controls'
import Result from './components/Result'
import UserMacros from './components/UserMacros';
import { debounce, TreeComparator } from './helpers';
import { MacroMap } from 'lambdulus-core/';
import UserStep from './components/UserStep';


export type Breakpoint = {
  type : ASTReduction,
  context : AST,
}

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
  briefHistory : Array<AST>,
  isValidating : boolean,
  running : boolean,
  singleLetterVars : boolean,
  breakpoints : Array<Breakpoint>,
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
  position: 'absolute' as any,
  top: '0',
  width: '100%',
  // height: '80%',
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

const listStyle = {
  padding: '0',
}

const itemStyle = {
  listStyle: 'none',
  marginBottom: '20px',
}

export default class App extends Component<any, state> {
  constructor (props : object) {
    super(props)
    
    this.run = this.run.bind(this)
    this.step = this.step.bind(this)
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
    this.clear = this.clear.bind(this)
    this.validate = this.validate.bind(this)
    this.onComparison = this.onComparison.bind(this)
    this.__run = this.__run.bind(this)
    this.stop = this.stop.bind(this)
    this.addBreakpoint = this.addBreakpoint.bind(this)
    this.shouldBreak = this.shouldBreak.bind(this)

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
      menuOpen : false,
      steping : false,
      briefHistory : [],
      isValidating : false,
      running : false,
      singleLetterVars : false, // TODO this.getConfigFromStorage(),
      breakpoints : [],
    }
  }

  componentDidMount () {
    this.setState({ ...this.state, ast : this.parseExpression(this.state.expression) })
  }

  render() {
    const controlProps : ControlProps = {
      run : this.run,
      stop : this.stop,
      step : this.step,
      clear : this.clear,
      validate : this.validate,
      stepIn : this.stepIn,
      stepBack : this.stepBack,
      canRun : true,
      canStepOver : true,
      canStepIn : true,
      canGoBack : true,
      running : this.state.running,
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
              <span style={ { fontSize: '1.3em' } } title='Write identifiers without spaces' >Single letter Identifiers</span>
              <input type='checkbox' checked={ this.state.singleLetterVars }
              onChange={ _ => this.setState({ ...this.state, singleLetterVars : !this.state.singleLetterVars}) } />
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
          {/* <Result tree={ ast } /> */}
          {
            this.state.isValidating
              ?
            <UserStep onComparison={ this.onComparison }/>
              :
            null
          }
          <ul style={ listStyle }>
            {
              this.state.briefHistory.map((ast, i) => {
                return <li key={i} style={ i !== 0 ? { ...itemStyle, color: 'gray' } : itemStyle }>
                {
                  i === 0 ? <Result addBreakpoint={ this.addBreakpoint } tree={ ast } />
                  : <Result tree={ ast } />
                }
                </li>
              })
            }
          </ul>
        </div>
      </div>
    );
  }

  shouldBreak (breakpoint : Breakpoint, reduction : ASTReduction) : boolean {
    if (reduction instanceof (breakpoint.type as any)
        && reduction instanceof Beta && breakpoint.context instanceof Lambda
        && reduction.target.identifier === breakpoint.context.body.identifier
      ) {
        return true
    }
    return false
  }

  __run () {
    let { ast, expression, steps, previousReduction, briefHistory, running, breakpoints } = this.state
    if ( ! running) {
      return
    }
    
    if (steps === 0) {
      ast = this.parseExpression(expression)
    }
    
    if (ast === null || previousReduction instanceof None) {
      return
    }

    const normal : NormalEvaluator = new NormalEvaluator(ast)
  
    previousReduction = normal.nextReduction
    if (normal.nextReduction instanceof None) {
      // NOT CALL SETTIMEOUT AGAIN
      briefHistory = [ast.clone()]

      this.setState({
        ...this.state,
        ast,
        steps,
        previousReduction,
        steping : false,
        briefHistory,
        isValidating : false,
        running : false,
      })

      return
    }

    let index : number = 0
    const breakpoint : Breakpoint | undefined = breakpoints.find(
      (breakpoint : Breakpoint, id) =>
        (index = id,
        this.shouldBreak(breakpoint, normal.nextReduction))
    )

    if (breakpoint !== undefined) {
      breakpoints.splice(index, 1)

      this.setState({
        ...this.state,
        running : false,
        steping : false,
        breakpoints,
      })
      return
    }
  
    ast = normal.perform() // perform next reduction
    steps++

    this.setState({
      ...this.state,
      ast,
      steps,
      previousReduction,
      briefHistory : [ ast ],
      isValidating : false,
    })

    window.setTimeout(this.__run, 10)    
  }

  run () {
    if (this.state.previousReduction instanceof None) {
      return
    }
    this.setState({ ...this.state, running : true, steping : true },
      () => window.setTimeout(this.__run, 10))
  }

  stop () {
    this.setState({ ...this.state, running : false })
  }

  step () {
    let { ast, expression, steps, previousReduction, briefHistory } = this.state
    if (steps === 0) {
      ast = this.parseExpression(expression)
    }

    if (ast === null || previousReduction instanceof None) {
      return
    }

    const normal : NormalEvaluator = new NormalEvaluator(ast)

    previousReduction = normal.nextReduction
    if (normal.nextReduction instanceof None) {
      this.setState({ ...this.state, steping : false, previousReduction, })
      return
    }
  
    ast = normal.perform() // perform next reduction
    steps++

    briefHistory.unshift(ast.clone())
    briefHistory.length = Math.min(briefHistory.length, 5)

    this.setState({
      ...this.state,
      ast,
      steps,
      previousReduction,
      steping : true,
      briefHistory,
      isValidating : false,
    })
  }

  clear () : void {
    this.setState({
      steps : 0,
      previousReduction : null,
      briefHistory: [],
      steping: false,
      isValidating : false,
      breakpoints : [],
    })
  }

  validate () : void {
    if (this.state.previousReduction instanceof None) {
      return
    }

    this.setState({ ...this.state, isValidating : true })
  }

  onComparison (userExpression : string) : void {
    let { ast, expression, steps, previousReduction, briefHistory } = this.state
    if (steps === 0) {
      ast = this.parseExpression(expression)
    }

    // TODO: tohle se asi nestane - prozkoumat
    // stane pokud nekdo chce kliknout na validaci kdyz neni nic napsany v inputu
    // pripadne pokud nekdo chce kliknout na validaci kdyz uz neni co validovat myslim
    if (ast === null || previousReduction instanceof None) {
      this.setState({
        ...this.state,
        ast,
        // steping : true,
        isValidating : false,
      })
      return
    }

    const normal : NormalEvaluator = new NormalEvaluator(ast)

    previousReduction = normal.nextReduction  
    if (normal.nextReduction instanceof None) {
      this.setState({ ...this.state, steping : false, isValidating : false })
      return
    }
  
    ast = normal.perform() // perform next reduction
    steps++


    // TODO: provest porovnani uzivatelskeho kroku a meho
    // to znamena porovnani stromu vcetne vyznamu
    // pokud nesedi, bude treba provest analyzu chyby
    // zobrazit chybu
    // pokracovat ve svem vyhodnocovani

    const userAst : AST | null = this.parseExpression(userExpression)

    if (userAst === null) {
      console.error('User Input is INVALID λ expression.')
      // TODO: put it in state
      this.setState({
        ...this.state,
        ast,
        // steping : true,
        isValidating : false,
      })
      return
    }

    const treeComparator : TreeComparator = new TreeComparator([ ast, userAst ])
    if ( ! treeComparator.equals) {
      console.error('User Input is INCCORECT.')
      
      briefHistory.unshift(ast.clone())
      briefHistory.length = Math.min(briefHistory.length, 5)
      
      this.setState({
        ...this.state,
        ast,
        steps,
        previousReduction,
        // steping : true, // proc bych to tady daval true to neni duvod
        briefHistory,
        isValidating : false,
      })
    }
    else {
      console.log('User Input is CORRECT.')
      
      briefHistory.unshift(userAst.clone())
      briefHistory.length = Math.min(briefHistory.length, 5)

      this.setState({
        ...this.state,
        ast : userAst,
        steps,
        previousReduction,
        // steping : true, // proc bych to tady daval true to neni duvod
        briefHistory,
        isValidating : false,
      })
    }

    
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
    this.setState({
      expression,
      lines,
      ast,
      briefHistory: [],
      steps : 0,
      previousReduction : null,
      caretPosition,
      isValidating : false,
      breakpoints : [],
    })
  }

  autoSave (expression : string) : void {
    const encoded : string = encodeURI(expression)

    window.location.hash = encoded
  }

  parseExpression (expression : string) : AST | null {
    const { singleLetterVars } = this.state
    try {
      const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ', '~'], singleLetterVars })
      const ast : AST = parse(tokens, this.state.macroTable)

      console.log('successfuly parsed')

      return ast
    }
    catch (exception) {
      console.log('Something went wrong')
      console.error(exception)
      return null
    }
  }

  getExpressionFromURL () : string {
    const expression : string = decodeURI(window.location.hash.substring(1))
    return expression
  }

  getMacrosFromLocalStorage () : MacroMap {
    const usefulMacros : MacroMap = {
      fact : '(Y (λ f n . (<= n 1) 1 (* n (f (- n 1)))))',
      facct : '(λ n . (Y (λ f n a . IF (= n 1) a (f (- n 1) (* n a)))) (- n 1) (n))',
      fib : '(Y (λ f n . (= n 0) 0 ((= n 1) 1 ( + (f (- n 1)) (f (- n 2))))))',
      inflist : '(λ n . (Y (λ x . (λ f s g . g f s) n x)))',
    }

    const userMacros : MacroMap = JSON.parse(window.localStorage.getItem('macrotable') || '{}')

    return { ...usefulMacros, ...userMacros }
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

  addBreakpoint (breakpoint : Breakpoint) : void {
    this.setState({
      ...this.state,
      breakpoints : [ ...this.state.breakpoints, breakpoint ],
    })
  }
}