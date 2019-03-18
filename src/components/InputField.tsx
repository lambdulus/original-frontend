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

const fact : string = `
(λ n .
  (Y (λ f n a .
    IF (<= n 1)
       a
       (f (- n 1) (* n a))
  )) (- n 1) (n)
) 5
`.trim()

export default class InputField extends Component<InputProps, State> {
  constructor (props : InputProps) {
    super(props)

    const initState : State = {
      content : fact, // ''
      lines: 7, // 1
    }

    this.state = initState

    this.onChange = this.onChange.bind(this)
  }

  getExpressionFromURL () : string {
    // TODO: implement
    return ''
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

    console.log("lines ", lines)

    this.setState({ content, lines })
  }
}
