import React, { Component, ChangeEvent, SyntheticEvent } from 'react'
import { Token, tokenize, parse, } from 'lambdulus-core/'

interface Props {
  onComparison (expression : string) : void,
}

interface State {
  value : string,
  invalidExpr : boolean,
}

const inputStyle = {
  width: '100%',
  fontSize: '2em',
  border: 'none',
  overflow: 'auto',
  outline: 'none',
  resize: 'none' as any,
  borderStyle: 'none',
  borderBottom: 'none',
}

export default class UserStep extends Component<Props, State> {
  constructor (props : Props) {
    super(props)

    this.onChange = this.onChange.bind(this)
    this.compare = this.compare.bind(this)
    this.isValidExpression = this.isValidExpression.bind(this)

    this.state = {
      value : '',
      invalidExpr : false,
    }
  }

  render () {
    return (
      <form onSubmit={ this.compare } >
        <input value={ this.state.value } onChange={ this.onChange }
          placeholder='(λ t f . t)' style={ this.state.invalidExpr ? { ...inputStyle, borderBottom: '2px solid #EF3D59' } : inputStyle } autoFocus type='text'
        />
      </form>
    )
  }

  onChange (event : ChangeEvent<HTMLInputElement>) : void {
    let { target : { value : expression } } = event
    expression = expression.replace(/\\/g, 'λ')

    this.setState({ ...this.state, value : expression, invalidExpr : false })
  }

  compare (event : SyntheticEvent) : void {
    event.preventDefault()

    const expression : string = this.state.value.trim()

    if (!expression
        ||
        ! this.isValidExpression(expression)) {
      this.setState({ ...this.state, invalidExpr : true })
      return
    }
    
    
    this.props.onComparison(expression)
    this.setState({ ...this.state, value : '' })
  }

  isValidExpression (expression : string) : boolean {
    try {
      const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ'], singleLetterVars : false })
      parse(tokens, {})

      return true
    }
    catch (exception) {
      return false
    }
  }
}