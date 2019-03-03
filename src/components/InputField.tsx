import React, { Component, ChangeEvent } from 'react'


interface InputProps {
  onEntry (expression : string) : void,
}

interface State {
  content : string,
}



export default class InputField extends Component<InputProps, State> {
  constructor (props : InputProps) {
    super(props)

    const initState : State = {
      content : '',
    }

    this.state = initState

    this.onChange = this.onChange.bind(this)
  }

  render () {
    const { content } : State = this.state
    return (
      <textarea
        onChange={ this.onChange }
        value={ content }
        onBlur={ _ => this.props.onEntry(this.state.content) }
      />
    )
  }

  onChange (event : ChangeEvent<HTMLTextAreaElement>) {
    const { target : { value : content } } : { target : { value : string } } = event

    this.setState({ content })
  }
}
