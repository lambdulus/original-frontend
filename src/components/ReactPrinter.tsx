import React from 'react'

import { ASTVisitor, Lambda, Variable, Beta, AST, Application, ChurchNumeral, Expansion, Macro } from "lambdulus-core";

import { Breakpoint } from "./Evaluator";


export default class ReactPrinter extends ASTVisitor {
  private rendered : JSX.Element | null = null

  private printMultiLambda (lambda : Lambda, accumulator : JSX.Element) : void {
    if (lambda.body instanceof Lambda) {
      const context : Variable = lambda.body.argument
      let className : string = 'argument'

      if (this.isBreakpoint(lambda.body.argument)) {
        className += ' breakpoint'
      }

      const args : JSX.Element = (
        <span className='arguments'>
          { accumulator } {' '}
          <span
            className={ className }
            onClick={ () => this.onClick({ type : Beta, context, broken : new Set }) }
          >
            { lambda.body.argument.name() }
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
            onClick={ () => {
              this.onClick({ type : Beta, context : lambda, broken : new Set })}
            }>
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
  onApplication(application: Application) : void {
    let leftClassName : string = 'left'
    let rightClassName : string = 'right'

    if (this.redex !== null
          &&
        this.redex.identifier === application.identifier
          &&
        this.redex === application
      ) {
        leftClassName += ' redex'
        rightClassName += ' redex'
    }

    if (application.right instanceof Application) {
      application.left.visit(this)
      const left : JSX.Element | null = <span className={ leftClassName }>{this.rendered}</span>

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

      application.right.visit(this)
      const right : JSX.Element | null = <span className={ rightClassName }>{ this.rendered }</span>

      this.rendered =
      <span className='application'>
        { left } { right }
      </span>
    }
  }
  
  // TODO: little bit refactored, maybe keep going
  onLambda(lambda: Lambda) : void {
    if (lambda.body instanceof Lambda) {
      const context : Variable = lambda.argument
      let className : string = 'argument'

      if (this.isBreakpoint(lambda.argument)) {
        className += ' breakpoint'
      }

      const acc : JSX.Element = (
        <span
          className={ className }
          onClick={ () => this.onClick({ type : Beta, context, broken : new Set }) }
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
            onClick={ () => {
              this.onClick({ type: Beta, context: lambda, broken : new Set })}
            }>
              λ { ' ' }
          </span>
          <span
            className={ className }
            onClick={ () => this.onClick({ type : Beta, context, broken : new Set }) }
          >
            { args } { ' ' }
          </span>
          . { body } 
          )
        </span>
      )
    }
  }
  
  // TODO: little bit refactored, maybe keep going
  onChurchNumeral(churchNumber: ChurchNumeral) : void {
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
        onClick={ () => this.onClick({ type: Expansion, context : churchNumber, broken : new Set }) }
      >
        { churchNumber.name() }
      </span>
    )
  }

  // TODO: little bit refactored, maybe keep going  
  onMacro(macro: Macro) : void {
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
        onClick={ () => this.onClick({ type: Expansion, context : macro, broken : new Set }) }
      >
        { macro.name() }
      </span>
    )
  }
  
  onVariable(variable: Variable): void {
    this.rendered = <span className='variable' >{ variable.name() }</span>
  }
}