import React, { Component } from 'react'
import { AST, BasicPrinter, ASTVisitor, Macro, ChurchNumber, Variable, Lambda, Application } from 'lambdulus-core';


class ReactPrinter extends ASTVisitor {
  // private expression : string = ''
  private rendered : JSX.Element | null = null

  // TODO: this looks like nonsense
  // maybe solve it with another Visitor
  private printLambdaBody (lambda : Lambda) : void {
    if (lambda.body instanceof Lambda) {
      this.printLambdaBody(lambda.body)
    }
    else {
      lambda.body.visit(this)
    }
  }

  // TODO: this looks like nonsense
  // maybe solve it with another Visitor
  private printLambdaArguments (lambda : Lambda, accumulator : JSX.Element) : void {
    if (lambda.body instanceof Lambda) {
      const args : JSX.Element = 
      <span>
        { accumulator } { lambda.body.argument.name() }
      </span>
      
      this.printLambdaArguments(lambda.body, args)
    }
    else {
      this.rendered = accumulator
    }
  }

  constructor (
    public readonly tree : AST,
  ) {
    super()
    this.tree.visit(this)
  }

  print () : JSX.Element | null {
    return this.rendered
  }

  // TODO: this is ugly as hell
  onApplication(application: Application): void {
    if (application.right instanceof Application) {
      application.left.visit(this)
      const left : JSX.Element | null = this.rendered

      application.right.visit(this)
      const right : JSX.Element | null = this.rendered

      this.rendered =
      <span>
        { left } ( { right } )
      </span>
    }
    else {
      application.left.visit(this)
      const left : JSX.Element | null = this.rendered

      application.right.visit(this)
      const right : JSX.Element | null = this.rendered

      this.rendered =
      <span>
        { left } { right }
      </span>
    }
  }
  
  // TODO: this is ugly as hell
  onLambda(lambda: Lambda): void {
    if (lambda.body instanceof Lambda) {
      this.printLambdaArguments(lambda, <span>{ lambda.argument.name() }</span>)
      const args : JSX.Element | null = this.rendered

      this.printLambdaBody(lambda)
      const body : JSX.Element | null = this.rendered

      this.rendered =
      <span>
        (λ { args } . { body } )
      </span>
    }
    else {
      lambda.argument.visit(this)
      const args : JSX.Element | null = this.rendered

      lambda.body.visit(this)
      const body : JSX.Element | null = this.rendered

      this.rendered =
      <span>
        (λ { args } . { body } )
      </span>
    }
  }
  
  onChurchNumber(churchNumber: ChurchNumber): void {
    this.rendered = <span>{ churchNumber.name() }</span>
  }
  
  onMacro(macro: Macro): void {
    this.rendered = <span>{ macro.name() }</span>
  }
  
  onVariable(variable: Variable): void {
    this.rendered = <span>{ variable.name() }</span>
  }
}


const style = {
  fontSize: '2em',
  wordWrap: 'anywhere' as any,
  // textWrap: 'unrestricted',

}

export default function Result (props : { tree : AST | null }) : JSX.Element | null {
  const { tree } = props

  if (tree === null) {
    return null
  }

  const printer : ReactPrinter = new ReactPrinter(tree)

  return (
    <span style={ style } >
      { printer.print() }
    </span>
  )
}