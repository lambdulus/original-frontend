import React from 'react'

import { ASTVisitor, Lambda, Variable, Beta, AST, Application, ChurchNumeral, Expansion, Macro } from "lambdulus-core";

import { Breakpoint } from "./Evaluator";


export default class ReactPrinter extends ASTVisitor {
  private rendered : JSX.Element | null = null
  private argument : Variable | null = null

  private printMultiLambda (lambda : Lambda, accumulator : JSX.Element) : void {
    if (lambda.body instanceof Lambda) {
      const context : Variable = lambda.body.argument
      let className : string = 'argument'

      if (this.isBreakpoint(lambda.body.argument)) {
        className += ' breakpoint'
      }

      // TODO: same here
      if (this.argument
          &&
          this.argument.name() === context.name()) {
            className += ' substitutedArg'
        }

      const args : JSX.Element = (
        <span className='arguments'>
          { accumulator } {' '}
          <span
            className={ className }
            onClick={ () => {
              (context as any).identifier = Symbol()
              this.onClick({ type : Beta, context, broken : new Set }) }
            }
          >
            { context.name() }
          </span>
        </span>
      )
      
      this.printMultiLambda(lambda.body, args)
    }
    else {
      lambda.body.visit(this)
      const body : JSX.Element | null = this.rendered
      this.rendered = accumulator

      this.rendered = (
        <span className='function'>
          (
          <span
            className='lambda'
            >
              λ { ' ' }
          </span>
          { accumulator } . { body }
          )
        </span>
      )
    }
  }

  isBreakpoint (node : AST) : boolean {
    for (const breakpoint of this.breakpoints) {
      if (breakpoint.context.identifier === node.identifier) {
        return true
      }
    }
    return false
  }

  constructor (
    public readonly tree : AST,
    private readonly onClick : (breakpoint : Breakpoint) => void,
    private readonly redex : AST | null,
    private readonly breakpoints : Array<Breakpoint>,
  ) {
    super()
    this.tree.visit(this)
  }

  print () : JSX.Element | null {
    return this.rendered
  }

  // TODO: little bit refactored, maybe keep going
  onApplication (application: Application) : void {
    let leftClassName : string = 'left'
    let rightClassName : string = 'right'
    let set : boolean = false

    if (this.redex !== null
          &&
        this.redex.identifier === application.identifier // tohle je asi trosku useles
          &&
        this.redex === application
      ) {
        leftClassName += ' redex'
        rightClassName += ' redex'

        // TODO: this is probably not good and should be done other way

        if (application.left instanceof Lambda) {
          this.argument = application.left.argument
          set = true
        }
    }

    if (application.right instanceof Application) {
      application.left.visit(this)
      const left : JSX.Element | null = <span className={ leftClassName }>{this.rendered}</span>

      // tohle delam proto, ze se nesmi vypnout this.argument u libovolne aplikace, jenom u te ktera ho setnula
      // priklad + 2 3a krokuj - zakomentuj a krokuj znovu Y se bude chovat spatne hned v prvnich krocich
      if (set) {
        this.argument = null
      }

      application.right.visit(this)
      const right : JSX.Element | null = <span className={ rightClassName }>( { this.rendered } )</span>

      this.rendered =
      <span className='application'>
        { left } { right }
      </span>
    }
    else {
      application.left.visit(this)
      const left : JSX.Element | null = <span className={ leftClassName }>{this.rendered}</span>

      // tohle delam proto, ze se nesmi vypnout this.argument u libovolne aplikace, jenom u te ktera ho setnula
      // priklad + 2 3a krokuj - zakomentuj a krokuj znovu Y se bude chovat spatne hned v prvnich krocich
      if (set) {
        this.argument = null
      }

      application.right.visit(this)
      const right : JSX.Element | null = <span className={ rightClassName }>{ this.rendered }</span>

      this.rendered =
      <span className='application'>
        { left } { right }
      </span>
    }
  }
  
  // TODO: little bit refactored, maybe keep going
  onLambda (lambda: Lambda) : void {
    // TODO: this also seems not so elegant and clean
    let argument : Variable | null = this.argument
    if (this.argument !== lambda.argument
        &&
        this.argument !== null
        &&
        this.argument.name() === lambda.argument.name()) {
      this.argument = null
    }


    // multilambda
    if (lambda.body instanceof Lambda) {
      const context : Variable = lambda.argument
      let className : string = 'argument'

      if (this.isBreakpoint(lambda.argument)) {
        className += ' breakpoint'
      }

      // TODO: same here
      if (this.argument
        &&
        this.argument.name() === context.name()) {
          className += ' substitutedArg'
      }

      const acc : JSX.Element = (
        <span
          className={ className }
          onClick={ () => {
            (context as any).identifier = Symbol()
            this.onClick({ type : Beta, context, broken : new Set }) }
          }
        >
          { lambda.argument.name() }
        </span>
      )

      this.printMultiLambda(lambda, acc)
    }
    else {
      const context : Variable = lambda.argument

      lambda.argument.visit(this)
      const args : JSX.Element | null = this.rendered

      lambda.body.visit(this)
      const body : JSX.Element | null = this.rendered

      let className : string = 'argument'

      if (this.isBreakpoint(lambda.argument)) {
        className += ' breakpoint'
      }

      this.rendered = (
        <span className='function' >
          (
          <span
            className='lambda'
            >
              λ { ' ' }
          </span>
          <span
            className={ className }
            onClick={ () => {
              (context as any).identifier = Symbol()              
              this.onClick({ type : Beta, context, broken : new Set }) }
            }
          >
            { args } { ' ' }
          </span>
          . { body } 
          )
        </span>
      )
    }

    if (argument !== null) {
      this.argument = argument
    }
  }
  
  // TODO: little bit refactored, maybe keep going
  onChurchNumeral (churchNumber: ChurchNumeral) : void {
    let className : string = 'churchnumeral'

    if (this.redex !== null
          &&
        this.redex.identifier === churchNumber.identifier
          &&
        this.redex === churchNumber
      ) {
        className += ' redex'
    }

    if (this.isBreakpoint(churchNumber)) {
      className += ' breakpoint'
    }

    this.rendered = (
      <span
        className={ className }
        onClick={ () => {
          (churchNumber as any).identifier = Symbol()
          this.onClick({ type: Expansion, context : churchNumber, broken : new Set }) }
        }
      >
        { churchNumber.name() }
      </span>
    )
  }

  // TODO: little bit refactored, maybe keep going  
  onMacro (macro: Macro) : void {
    let className = 'macro'

    if (this.redex !== null && this.redex.identifier === macro.identifier && this.redex === macro) {
      className += ' redex'
    }

    if (this.isBreakpoint(macro)) {
      className += ' breakpoint'
    }

    this.rendered = (
      <span
        className={ className }
        onClick={ () => {
          (macro as any).identifier = Symbol()
          this.onClick({ type: Expansion, context : macro, broken : new Set }) }
        }
      >
        { macro.name() }
      </span>
    )
  }
  
  onVariable (variable: Variable): void {
    // TODO: same here - not so clean
    let className : string = 'variable'

    if (this.argument
        &&
        this.argument.name() === variable.name()) {
          className += ' substitutedArg'
      }

    this.rendered = <span className={ className } >{ variable.name() }</span>
  }
}