import React, { ChangeEvent } from 'react'


interface InputProps {
  content : string,
  lines : number,
  caretPosition : number,
  onChange (event : ChangeEvent<HTMLTextAreaElement>) : void,
}

const style = {
  width: '100%',
  fontSize: '3em',
  border: 'none',
  overflow: 'auto',
  outline: 'none',
  resize: 'none' as any,
  borderStyle: 'none',
  // wordBreak: 'break-all' as any,
  // wordWrap: 'anywhere' as any,
  // textWrap: 'unrestricted',
}

export default function InputField (props : InputProps) : JSX.Element {
  const { content, lines, onChange, caretPosition } : InputProps = props

    return (
      <textarea
        style={ style }
        onChange={ onChange }
        value={ content }
        placeholder='(λ f . (λ x . f (x x)) (λ x . f (x x)))'
        wrap='hard'
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={ false }
        rows={ Math.max(lines + 1, 2) }
        ref={ (element : HTMLTextAreaElement) => {
          if (element !== null) {
            element.selectionStart = caretPosition
            element.selectionEnd = caretPosition
          }
        } }
      />
    )
}