import React, { Component } from 'react'
import { AST, BasicPrinter, ASTVisitor, Macro, ChurchNumber, Variable, Lambda, Application, Beta, Expansion, NormalEvaluator, None } from 'lambdulus-core';
import { Breakpoint } from '../App';


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
      <span className='arguments' >
        { accumulator }
        {' '}
        <span style={ { cursor: 'pointer' } }
          onClick={() => this.onClick({type:Beta, context: (lambda.body as Lambda).argument})} >
          {lambda.body.argument.name()}
        </span>
      </span>
      
      this.printLambdaArguments(lambda.body, args)
    }
    else {
      this.rendered = accumulator
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

  // TODO: this is ugly as hell
  onApplication(application: Application): void {
    let leftStyle : React.CSSProperties = {}
    let rightStyle : React.CSSProperties = {}

    if (this.redex !== null && this.redex.identifier === application.identifier && this.redex === application) {
      leftStyle = {
        backgroundColor: '#69f0ae',
        borderRadius: '5px'
      }

      rightStyle = {
        backgroundColor: '#ff80ab',
        borderRadius: '5px'
      }
    }

    if (application.right instanceof Application) {
      application.left.visit(this)
      const left : JSX.Element | null = <span style={leftStyle}>{this.rendered}</span>

      application.right.visit(this)
      const right : JSX.Element | null = <span style={rightStyle}>( { this.rendered } )</span>

      this.rendered =
      <span className='application' >
        { left } { right }
      </span>
    }
    else {
      application.left.visit(this)
      // const left : JSX.Element | null = this.rendered
      const left : JSX.Element | null = <span style={leftStyle}>{this.rendered}</span>


      application.right.visit(this)
      // const right : JSX.Element | null = this.rendered
      const right : JSX.Element | null = <span style={rightStyle}>{ this.rendered }</span>


      this.rendered =
      <span className='application' >
        { left } { right }
      </span>
    }
  }
  
  // TODO: this is ugly as hell
  onLambda(lambda: Lambda): void {
    if (lambda.body instanceof Lambda) {
      const acc : JSX.Element = <span style={ { cursor: 'pointer' } }
        onClick={() => this.onClick({type:Beta, context: (lambda.body as Lambda).argument})} >
        {lambda.argument.name()}
      </span>

      this.printLambdaArguments(lambda, acc)
      const args : JSX.Element | null = this.rendered

      this.printLambdaBody(lambda)
      const body : JSX.Element | null = this.rendered

      this.rendered =
      <span className='lambda' >
        ( <span style={ { cursor: 'pointer' } } onClick={() => {
          // console.log(lambda)
          this.onClick({ type: Beta, context: lambda })}
         } >
          λ
        </span> { args } . { body } )
      </span>
    }
    else {
      lambda.argument.visit(this)
      const args : JSX.Element | null = this.rendered

      lambda.body.visit(this)
      const body : JSX.Element | null = this.rendered

      this.rendered =
      <span className='lambda' >
        (<span style={ { cursor: 'pointer' } } onClick={() => {
          // console.log(lambda)

          this.onClick({ type: Beta, context: lambda })}
         } >
          λ
        </span> { args } . { body } )
      </span>
    }
  }
  
  onChurchNumber(churchNumber: ChurchNumber): void {
    let style : React.CSSProperties = {}

    if (this.redex !== null && this.redex.identifier === churchNumber.identifier && this.redex === churchNumber) {
      style = {
        backgroundColor: '#82b1ff',
        borderRadius: '5px'
      }
    }
    this.rendered = <span className='churchnumeral' style={{cursor:'pointer', ...style}}
      onClick={() => this.onClick({ type: Expansion, context : churchNumber })} >
      { churchNumber.name() }
    </span>
  }
  
  onMacro(macro: Macro): void {
    let style : React.CSSProperties = {}

    if (this.redex !== null && this.redex.identifier === macro.identifier && this.redex === macro) {
      style = {
        backgroundColor: '#80d8ff',
        borderRadius: '5px'
      }
    }

    this.rendered = <span className='macro' style={{cursor:'pointer', ...style}}
      onClick={() => this.onClick({ type: Expansion, context : macro })} >
      { macro.name() }
    </span>
  }
  
  onVariable(variable: Variable): void {
    this.rendered = <span className='variable' >{ variable.name() }</span>
  }
}


const style = {
  fontSize: '2em',
  wordWrap: 'anywhere' as any,
  // textWrap: 'unrestricted',

}

export default function Result (props : { tree : AST | null, addBreakpoint?(breakpoint : Breakpoint) : void }) : JSX.Element | null {
  const { tree, addBreakpoint } = props

  if (tree === null) {
    return null
  }

  let redex : AST | null  = null
  const normal : NormalEvaluator = new NormalEvaluator(tree)
  if (normal.nextReduction instanceof Beta) {
    redex = normal.nextReduction.redex
  }
  if (normal.nextReduction instanceof Expansion) {
    redex = normal.nextReduction.target
  }

  const printer : ReactPrinter = new ReactPrinter(tree, (breakpoint : Breakpoint) => {
    if (addBreakpoint !== undefined) {
      console.log('CLICKED')
      addBreakpoint(breakpoint)
    }
  }, redex)

  return (
    <span style={ style } >
      { printer.print() }
    </span>
  )
}