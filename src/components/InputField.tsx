import React, { Component, ChangeEvent } from 'react'


interface InputProps {
  onEntry (expression : string) : void,
}

interface State {
  content : string,
  lines : number,
}

const style = {
  width: '100%',
  fontSize: '3em',
  border: 'none',
  overflow: 'auto',
  outline: 'none',
  resize: 'none' as any,
  borderStyle: 'none',
}

export default class InputField extends Component<InputProps, State> {
  constructor (props : InputProps) {
    super(props)
    
    this.updateFromURL = this.updateFromURL.bind(this)
    this.onChange = this.onChange.bind(this)
    this.getExpressionFromURL = this.getExpressionFromURL.bind(this)

    const content : string = this.getExpressionFromURL()
    const lines : number = content.split('\n').length

    window.addEventListener('hashchange', this.updateFromURL)

    const initState : State = {
      content,
      lines,
    }

    this.state = initState
  }

  updateFromURL () : void {
    const content : string = this.getExpressionFromURL()
    const lines : number = content.split('\n').length

    this.setState({ content, lines })
  }

  getExpressionFromURL () : string {
    const expression : string = decodeURI(window.location.hash.substring(1))
    return expression
  }

  render () {
    const { content, lines } : State = this.state
    return (
      <textarea
        style={ style }
        onChange={ this.onChange }
        value={ content }
        onBlur={ _ => this.props.onEntry(this.state.content) }
        placeholder='(λ f . (λ x . f (x x)) (λ x . f (x x)))'
        autoFocus
        rows={ Math.max(lines + 1, 2) }
      />
    )
  }

  onChange (event : ChangeEvent<HTMLTextAreaElement>) {
    const { target : { value : content } } : { target : { value : string } } = event
    const lines : number = content.split('\n').length

    this.setState({ content, lines })
  }
}
