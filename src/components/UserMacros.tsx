import React, { Component, ChangeEvent } from 'react'
import { trimStr } from '../helpers'
import { UserMacroTable, builtinMacros } from 'lambdulus-core/dist/parser'

interface Props {
  disabled : boolean,
  macros : UserMacroTable,
  addMacro (name : string, definition : string) : void,
  removeMacro (name : string) : void,
}

interface State {
  value : string,
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

export default class UserMacros extends Component<Props, State> {
  constructor (props : Props) {
    super(props)

    this.onChange = this.onChange.bind(this)
    this.listMacros = this.listMacros.bind(this)
    this.onAdd = this.onAdd.bind(this)

    this.state = {
      value : '',
    }
  }

  render () {
    return (
      <div>
        <span style={ { fontSize: '1.3em',  } } >Built-in Macros:</span>
          { <ul style={ listStyle }>
          { builtinMacros.map((macroName) => {
              return <li title='Built-in Macro' style={ macroStyle } key={ macroName }>{ macroName }</li>
            })
          }
          </ul> }
        <br />
        { this.listMacros() }
        <br />
        <input disabled={this.props.disabled} value={ this.state.value } onChange={ this.onChange } />
        <button disabled={this.props.disabled} onClick={ this.onAdd } >ADD</button>
      </div>
    )
  }

  onChange (event : ChangeEvent<HTMLInputElement>) : void {
    this.setState({ ...this.state, value : event.target.value })
  }

  onAdd () : void {
    const [ name, definition ] : Array<string> = this.state.value.split('=').map(trimStr)

    this.props.addMacro(name, definition)
    this.setState({ ...this.state, value : '' })
  }

  listMacros () : JSX.Element {
    const { macros } = this.props
    return (
      <ul style={ listStyle }>
        { Object.entries(macros).map(([ name, definition ]) => {
          return (
            <li key={ name } title='Click to delete Macro' style={ userMacroStyle } onClick={ () => this.props.removeMacro(name) } >
              { name } = { definition }
            </li>
          )
        }) }
      </ul>
    )
  }
}