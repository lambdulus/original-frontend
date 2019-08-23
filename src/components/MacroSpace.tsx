import React from 'react'
import { MacroMap, builtinMacros } from 'lambdulus-core'


export interface MacroProperties {
  macroTable : MacroMap
  removeMacro (name : string) : void
}

export default function MacroSpace (props : MacroProperties) : JSX.Element {
  const { macroTable, removeMacro } = props

  return (
    <div className='macroSpace'>
      <p>Built-in Macros</p>
      <ul className='UL'>
        { Object.entries(builtinMacros).map(([macroName, macroExpression]) =>
          <div key={ macroName }>
            <li className='LI'>
              <div className='box boxMacro'>
                { macroName } := { macroExpression }
              </div>
            </li>
          </div>
        ) }
      </ul>

      <p>User-defined Macros</p>
      <ul>
        { Object.entries(macroTable).map(([macroName, macroExpression]) =>
            <div key={ macroName }>
              <li className='LI'>
                <div className='box boxMacro'>
                  { macroName } := { macroExpression }
                  <i className="hiddenMacroIcon far fa-trash-alt" onClick={ () => removeMacro(macroName) } />
                </div>
              </li>
            </div>
          ) }
      </ul>
    </div>
  )
}