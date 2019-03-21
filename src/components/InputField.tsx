import React, { Component, ChangeEvent } from 'react'

import { debounce } from '../helpers'


interface InputProps {
  content : string,
  lines : number,
  onChange (event : ChangeEvent<HTMLTextAreaElement>) : void,
  // onEntry (expression : string) : void,
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

export default function InputField (props : InputProps) {
  const { content, lines, onChange } : InputProps = props
    return (
      <textarea
        style={ style }
        onChange={ onChange }
        value={ content }
        placeholder='(λ f . (λ x . f (x x)) (λ x . f (x x)))'
        autoFocus
        rows={ Math.max(lines + 1, 2) }
      />
    )
}


// export default class InputField extends Component<InputProps, State> {
//   constructor (props : InputProps) {
//     super(props)
    
//     this.updateFromURL = this.updateFromURL.bind(this)
//     this.onChange = this.onChange.bind(this)
//     this.getExpressionFromURL = this.getExpressionFromURL.bind(this)
//     this.onExpressionEnter = debounce(this.onExpressionEnter.bind(this), 1000)

//     const content : string = this.getExpressionFromURL()
//     const lines : number = content.split('\n').length

//     window.addEventListener('hashchange', this.updateFromURL)

//     const initState : State = {
//       content,
//       lines,
//     }

//     this.state = initState
//   }

//   onExpressionEnter (expression : string) : void {
//     this.props.onEntry(expression)
//   }

//   updateFromURL () : void {
//     const content : string = this.getExpressionFromURL()
//     const lines : number = content.split('\n').length

//     this.setState({ content, lines })
//   }

//   getExpressionFromURL () : string {
//     const expression : string = decodeURI(window.location.hash.substring(1))
//     return expression
//   }

//   render () {
//     const { content, lines } : State = this.state
//     return (
//       <textarea
//         style={ style }
//         onChange={ this.onChange }
//         value={ content }
//         onBlur={ _ =>  this.props.onEntry(this.state.content) }
//         placeholder='(λ f . (λ x . f (x x)) (λ x . f (x x)))'
//         autoFocus
//         rows={ Math.max(lines + 1, 2) }
//       />
//     )
//   }

//   onChange (event : ChangeEvent<HTMLTextAreaElement>) {
//     let { target : { value : content } } : { target : { value : string } } = event
//     const lines : number = content.split('\n').length
//     content = content.replace(/\\/g, 'λ')

//     this.onExpressionEnter(content)
//     this.setState({ content : content, lines })
//   }
// }