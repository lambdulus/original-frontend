import React, { PureComponent } from 'react'

import Editor from './Editor'

interface EmptyEvaluatorProps {
  className : string
  isActive : boolean
  editor : {
    placeholder : string
    content : string
    caretPosition : number
    syntaxError : Error | null
  }

  makeActive () : void
  onContent (content : string, caretPosition : number) : void
  onEnter () : void
  onExecute () : void
}


export default class EmptyEvaluator extends PureComponent<EmptyEvaluatorProps> {
  render () : JSX.Element {
    const { className, isActive, editor, makeActive } = this.props
    const {
      placeholder,
      content,
      caretPosition,
      syntaxError,
    } = editor

    return (
      <div
        className={ `${className} ${isActive ? '' : ' inactiveBox'}` }
        onDoubleClick={ this.props.makeActive } >
          {/* <p className='emptyStep'>Empty expression box.</p> */}
          {
            isActive ?
              (
                <Editor
                  placeholder={ placeholder } // data
                  content={ content } // data
                  caretPosition={ caretPosition } // data
                  syntaxError={ syntaxError } // data
                  isMarkDown={ false } // data

                  onContent={ this.props.onContent } // fn
                  onEnter={ this.props.onEnter } // fn // tohle asi bude potreba
                  onExecute={ this.props.onExecute } // fn // tohle asi bude potreba
                />
              )
              :
              (
                <p className='inactiveMessage'>
                  Collapsing { Math.max(0, history.length - 1) } { history.length === 2 ? 'step' : 'steps' }. Double click to activate this box.
                </p>
              )
          }
        </div>
    )
  }
}