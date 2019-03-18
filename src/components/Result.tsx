import React, { Component } from 'react'
import { AST, BasicPrinter } from 'lambdulus-core';


const style = {
  fontSize: '2em',

}

export default function Result (props : { tree : AST | null }) : JSX.Element | null {
  const { tree } = props

  if (tree === null) {
    return null
  }

  const printer : BasicPrinter = new BasicPrinter(tree)

  return (
    <span style={ style } >
      { printer.print() }
    </span>
  )
}