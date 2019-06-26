import React from 'react'

import { ASTVisitor, Lambda, Variable, Beta, AST, Application, ChurchNumber, Expansion, Macro } from "lambdulus-core";

import { Breakpoint } from "./Evaluator";


export default class ReactPrinter extends ASTVisitor {
  private rendered : JSX.Element | null = null

  private printMultiLambda (lambda : Lambda, accumulator : JSX.Element) : void {
    if (lambda.body instanceof Lambda) {
      const context : Variable = lambda.body.argument
      const args : JSX.Element = (
        <span className='arguments'>
          { accumulator } {' '}
          <span
            className='argument'
            onClick={ () => this.onClick({ type : Beta, context }) }
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
              this.onClick({ type : Beta, context : lambda })}
            }>
              λ { ' ' }
          </span>
          { accumulator } . { body }
          )
        </span>
      )
    }
  }

  constructor (
    public readonly tree : AST,
    private readonly onClick : (breakpoint : Breakpoint) => void,
    private readonly redex : AST | null,
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
      const context : Variable = lambda.body.argument
      const acc : JSX.Element = (
        <span
          className='argument'
          onClick={ () => this.onClick({ type : Beta, context }) }
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

      this.rendered = (
        <span className='function' >
          (
          <span
            className='lambda'
            onClick={ () => {
              this.onClick({ type: Beta, context: lambda })}
            }>
              λ { ' ' }
          </span>
          <span
            className='argument'
            onClick={ () => this.onClick({ type : Beta, context }) }
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
  onChurchNumber(churchNumber: ChurchNumber) : void {
    let className : string = 'churchnumeral'

    if (this.redex !== null
          &&
        this.redex.identifier === churchNumber.identifier
          &&
        this.redex === churchNumber
      ) {
        className += ' redex'
    }
    this.rendered = (
      <span
        className={ className }
        onClick={ () => this.onClick({ type: Expansion, context : churchNumber }) }
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

    this.rendered = (
      <span
        className={ className }
        onClick={ () => this.onClick({ type: Expansion, context : macro }) }
      >
        { macro.name() }
      </span>
    )
  }
  
  onVariable(variable: Variable): void {
    this.rendered = <span className='variable' >{ variable.name() }</span>
  }
}