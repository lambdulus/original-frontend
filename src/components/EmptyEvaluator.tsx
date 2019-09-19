import React, { PureComponent } from 'react'

import Editor from './Editor'
import { StepRecord } from './EvaluatorBox'

interface EmptyEvaluatorProps {
  className : string
  isActive : boolean
  editor : {
    placeholder : string
    content : string
    caretPosition : number
    syntaxError : Error | null
  }
  history : Array<StepRecord>

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
                  Collapsing { Math.max(0, this.props.history.length - 1) } { this.props.history.length === 2 ? 'step' : 'steps' }. Double click to activate this box.
                </p>
              )
          }
        </div>
    )
  }
}