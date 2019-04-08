import React, { Component, ChangeEvent, SyntheticEvent } from 'react'
import { trimStr } from '../helpers'
import { MacroMap, builtinMacros, Token, tokenize, parse, AST } from 'lambdulus-core/'

interface Props {
  disabled : boolean,
  macros : MacroMap,
  addMacro (name : string, definition : string) : void,
  removeMacro (name : string) : void,
}

interface State {
  value : string,
  invalidMacro : boolean,
  builtinsExpanded : boolean,
  macroError : null | string,
}

const listStyle = {
  padding: '0',
}

const macroStyle = {
  fontSize: '1.2em',
  display: 'inline-block',
  textAlign: 'center' as any,
  paddingLeft: '10px',
  paddingRight: '10px',
  border: '1px solid gray',
  listStyle: 'none',
  margin: '10px',
  borderRadius: '20px',
  color: 'gray',
  cursor: 'pointer',
}

const userMacroStyle = {
  fontSize: '1.2em',
  display: 'inline-block',
  textAlign: 'center' as any,
  paddingTop: '3px',
  paddingBottom: '3px',
  paddingLeft: '10px',
  paddingRight: '10px',
  border: '2px solid black',
  listStyle: 'none',
  margin: '10px',
  borderRadius: '20px',
  color: 'black',
  cursor: 'pointer',
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
  // wordBreak: 'break-all' as any,
  // wordWrap: 'anywhere' as any,
  // textWrap: 'unrestricted',
}

export default class UserMacros extends Component<Props, State> {
  constructor (props : Props) {
    super(props)

    this.onChange = this.onChange.bind(this)
    this.listMacros = this.listMacros.bind(this)
    this.onAdd = this.onAdd.bind(this)
    this.isValidExpression = this.isValidExpression.bind(this)

    this.state = {
      value : '',
      invalidMacro : false,
      builtinsExpanded : true,
      macroError : null,
    }
  }

  render () {
    return (
      <div>
        <span title='Click for toggle display'
              style={ { fontSize: '1.3em', cursor: 'pointer', } }
              onClick={_ => this.setState({
                ...this.state,
                builtinsExpanded : !this.state.builtinsExpanded,
              })
        } >
          Built-in Macros:</span>
          { <ul style={ listStyle }>
          { this.state.builtinsExpanded
              ?            
            Object.entries(builtinMacros).map(([macroName, definition ]) => {
              return <li title='Built-in Macro' style={ macroStyle } key={ macroName }>
                { macroName }
                { ' ' }
                := { definition }
              </li>
            })
              :
              null
          }
          </ul> }
        <span style={ { fontSize: '1.3em',  } } >User defined Macros:</span>
        { this.listMacros() }
        <br />
        <form onSubmit={ this.onAdd } >
          <input disabled={this.props.disabled} value={ this.state.value } onChange={ this.onChange }
            placeholder='T := (λ t f . t)' style={ this.state.invalidMacro ? { ...inputStyle, borderBottom: '2px solid #EF3D59' } : inputStyle } autoFocus type='text'
          />
        </form>
      </div>
    )
  }

  onChange (event : ChangeEvent<HTMLInputElement>) : void {
    let { target : { value : expression } } = event
    expression = expression.replace(/\\/g, 'λ')

    this.setState({ ...this.state, value : expression, invalidMacro : false })
  }

  onAdd (event : SyntheticEvent) : void {
    event.preventDefault()

    const [ name, definition ] : Array<string> = this.state.value.split(':=').map(trimStr)

    if (!definition
        ||
      ! this.isValidExpression(definition)
        ||
      name in builtinMacros) {
      const macroError : string = (!definition) ? 'Empty definition.'
        :
        name in builtinMacros ? 'You can not redefine built-in macros.'
          : 'Invalid macro.'

      this.setState({ ...this.state, invalidMacro : true, macroError })
      console.error(macroError)
      return
    }
    
    
    this.props.addMacro(name, definition)
    this.setState({ ...this.state, value : '' })
  }

  listMacros () : JSX.Element {
    const { macros } = this.props
    return (
      <ul style={ listStyle }>
        { Object.entries(macros).map(([ name, definition ]) => {
          return (
            <li key={ name }
                title={ this.props.disabled ? 'You cannot remove Macro while evaluating' : 'Click to delete Macro' }
                style={ userMacroStyle }
                onClick={ () => ( ! this.props.disabled) && this.props.removeMacro(name) } >
              { name } := { definition }
            </li>
          )
        }) }
      </ul>
    )
  }

  isValidExpression (expression : string) : boolean {
    try {
      const tokens : Array<Token> = tokenize(expression, { lambdaLetters : ['λ'], singleLetterVars : false })
      parse(tokens, this.props.macros)

      return true
    }
    catch (exception) {
      return false
    }
  }
}