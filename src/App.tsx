import React, { Component, ChangeEvent } from 'react';

import {
  AST,
  tokenize,
  parse,
  ASTReduction,
  Token,
  NormalEvaluator,
  None,
  builtinMacros,
  MacroTable,
  Application,
  Beta,
  Lambda,
  Variable,
  ChurchNumber,
  Expansion,
  Macro,
  MacroMap
} from 'lambdulus-core'

import './App.css'
import Editor from './components/Editor'
import { debounce } from './misc';
import Evaluator from './components/Evaluator';


const HANDY_MACROS : MacroMap = {
  FACT : '(Y (λ f n . (<= n 1) 1 (* n (f (- n 1)))))',
  FACCT : '(λ n . (Y (λ f n a . IF (= n 1) a (f (- n 1) (* n a)))) (- n 1) (n))',
  FIB : '(Y (λ f n . (= n 0) 0 ((= n 1) 1 ( + (f (- n 1)) (f (- n 2))))))',
  // SHORTLIST : 'CON 3 (CONS 5 (CONS 1 NIL))',
  // LONGLIST :  '(CONS 3 (CONS 5 (CONS 1 (CONS 10 (CONS 7 (CONS 2 (CONS 4 (CONS 9 (CONS 4 (CONS 6 (CONS 8 NIL)))))))))))',
  APPEND : 'Y (λ fn listA listB . IF (NULL listA) (listB) (CONS (FIRST listA) (fn (SECOND listA) listB)))',
  LISTGREQ : 'Y (λ fn piv list . IF (NULL list) (NIL) ( IF (>= (FIRST list) piv) (CONS (FIRST list) (fn piv (SECOND list))) (fn piv (SECOND list)) ) )',
  LISTLESS : 'Y (λ fn piv list . IF (NULL list) (NIL) ( IF (< (FIRST list) piv) (CONS (FIRST list) (fn piv (SECOND list))) (fn piv (SECOND list)) ) )',
  LISTGR : 'Y (λ fn piv list . IF (NULL list) (NIL) ( IF (> (FIRST list) piv) (CONS (FIRST list) (fn piv (SECOND list))) (fn piv (SECOND list)) ) )',
  LISTEQ : 'Y (λ fn piv list . IF (NULL list) (NIL) ( IF (= (FIRST list) piv) (CONS (FIRST list) (fn piv (SECOND list))) (fn piv (SECOND list)) ) )',
  QUICKSORT : 'Y (λ fn list . IF (NULL list) (NIL) ( IF (NULL (SECOND list)) (list) ( APPEND (fn (LISTLESS (FIRST list) list)) ( APPEND (LISTEQ (FIRST list) list) (fn (LISTGR (FIRST list) list)) ) ) ) )',
  INFLIST : '(λ n . (Y (λ x . (λ f s g . g f s) n x)))',
  REMOVENTH : 'Y (λ fn list n . IF (= n 0) (SECOND list) (IF (NULL list) NIL (CONS (FIRST list) (fn (SECOND list) (- n 1) ) ) ) )',
  NTH : 'Y (λ fn list n . IF (= n 0) (FIRST list) (IF (NULL (list)) NIL (fn (SECOND list) (- n 1)) ) )',
  LEN : 'Y (λ fn list . IF (NULL list) (0) (+ 1 (fn (SECOND list) )) )',
  GETNTH : '(λ end . (Y (λ f n i . (end i) (i) ( (= n 0) (Y (λ f a . (end a) (i) (f) ) ) (f (- n 1)) ) )) )',
  MAP : '(λ fn l . (Y (λ f it . IF (NULL it) (NIL) (CONS (fn (FIRST it)) (f (SECOND it))) )) l )',
  REDUCE : '(λ fn l init . Y (λ f it acc . IF (NULL it) (acc) (f (SECOND it) (fn (FIRST it) acc)) ) l init )',
  APPLY : '(λ f args . Y (λ ff f l . (NULL l) (f) (ff (f (FIRST l)) (SECOND l)) ) f args )',
  RANGE : '(λ m n . Y (λ f e . (= e n) (CONS e NIL) (CONS e (f (+ e 1))) ) m )',
  LISTCOMPR : '(λ args . APPLY (λ op in rng cond . Y (λ f l . (NULL l) (NIL) ( (cond (FIRST l)) (CONS (op (FIRST l)) (f (SECOND l))) (CONS (FIRST l) (f (SECOND l))) ) ) rng ) args )',
  MOD : '(λ n m . (n (λ n . (= n (- m 1)) (0) (+ n 1)) (0)) )',
  INFIX : 'APPLY (λ l op r . op l r)',
}

interface State {
  editorState : {
    expression : string
    caretPosition : number
    syntaxError : Error | null
  }
  
  singleLetterVars : boolean
  macroTable : MacroMap

  submittedExpressions : Array<AST>
}

export default class App extends Component<any, State> {
  constructor (props : object) {
    super(props)

    this.parseExpression = this.parseExpression.bind(this)
    this.getSavedMacros = this.getSavedMacros.bind(this)
    this.getExpressionFromURL = this.getExpressionFromURL.bind(this)
    this.updateFromURL = this.updateFromURL.bind(this)
    const [update, cancel] = debounce(this.updateURL.bind(this), 500)
    this.updateURL = update
    this.cancelUpdate = cancel
    this.onExpression = this.onExpression.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onRemoveExpression = this.onRemoveExpression.bind(this)

    window.addEventListener('hashchange', this.updateFromURL)

    const expression : string = this.getExpressionFromURL()

    this.state = {
      editorState : {
        expression,
        caretPosition : expression.length,
        syntaxError : null,
      },
      singleLetterVars : false,
      macroTable : { ...HANDY_MACROS, ...this.getSavedMacros() },

      submittedExpressions : []

    }
    
  }

  render () {
    const {
      editorState : { expression, caretPosition, syntaxError },
      singleLetterVars,
      macroTable,
      submittedExpressions
    } : State = this.state

    return (
      <div className='app'>

        <ul className='evaluatorSpace' >
          { submittedExpressions.map((ast : AST, i : number) =>
            <li key={ i }>
              <button
                className='controlButton'
                onClick={ () => this.onRemoveExpression(i) }
              >
                DELETE
              </button>
              <Evaluator
                ast={ ast }
              />
            </li>
            ) }
        </ul>

        <Editor
        expression={ expression }
        caretPosition={ caretPosition }
        onExpression={ this.onExpression }
        onSubmit={ this.onSubmit }
        syntaxError={ syntaxError }
        />

        <div id="anchor"></div>

      </div>
    )
  }

  updateURL (expression : string) : void {
    // window.location.hash = encodeURI(expression)
    history.pushState({}, "page title?", "#" + encodeURI(expression))
  }

  cancelUpdate () : void {}

  onExpression (expression : string, caretPosition : number) : void {
    this.setState({ ...this.state, editorState : { expression, caretPosition, syntaxError : null } } )
    this.updateURL(expression)
  }

  onRemoveExpression (index : number) {
    const { submittedExpressions } : State = this.state

    submittedExpressions.splice(index, 1)

    this.setState({
      ...this.state,
      submittedExpressions
    })
  }

  onSubmit () : void {
    this.cancelUpdate()
    
    const { editorState : { expression, caretPosition, }, submittedExpressions } : State = this.state
    
    // window.location.hash = encodeURI(expression)
    history.pushState({}, "page 2", "#" + encodeURI(expression))

    try {
      const ast : AST = this.parseExpression(expression)
      // window.location.hash = encodeURI('')
      history.pushState({}, "page 2", "#" + encodeURI(''))

      this.setState({
        ...this.state,
        editorState : {
          expression : '',
          caretPosition : 0,
          syntaxError : null,
        },
        submittedExpressions : [ ...submittedExpressions, ast ]
      })
  
    } catch (exception) {
      this.updateURL(expression)
      console.log(exception)
      
      this.setState({
        ...this.state,
        editorState : {
          expression,
          caretPosition,
          syntaxError : exception,
        }
      })
    }
  }

  getExpressionFromURL () : string {
    // return ''
    return decodeURI(window.location.hash.substring(1))
  }

  updateFromURL () : void {
    const { editorState : { expression : currentExpr } } : State = this.state
    const expression : string = this.getExpressionFromURL()

    if (currentExpr === expression) {
      // breaking cyclic update
      console.log('ALREADY SYNCED')
      return
    }

    this.setState({
      ...this.state,
      editorState : {
        expression,
        caretPosition : expression.length,
        syntaxError : null
      }
    })
  }

  parseExpression (expression : string) : AST {
    // TODO: without try and catch
    // this method raises exception and caller handles it
    // caller should by able to display error to user
    // caller should store exception in editorState
    const { singleLetterVars, macroTable } : State = this.state
    
    const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ'], singleLetterVars })
    const ast : AST = parse(tokens, macroTable)

    return ast
  }

  getSavedMacros () : MacroMap {
    return JSON.parse(window.localStorage.getItem('macrotable') || '{}')
  }
}