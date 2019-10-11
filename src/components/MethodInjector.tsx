import React, { createContext, ReactNode } from "react"
import { BoxState } from "../AppTypes"


export const AddBoxContext = createContext((boxState : BoxState) => {})
export const RemoveBoxContext = createContext((index  : number) => {})
export const AddEmptyBoxContext = createContext((boxState : BoxState) => {})
export const ChangeActiveBoxContext = createContext((activeBoxIndex : number) => {} )
export const SetBoxStateContext = createContext((index : number, boxState : BoxState) => {})
export const DefineMacroContext = createContext((name : string, definition : string) => {})

interface InjectorProps {
  addBox (boxState : BoxState) : void
  removeBox (index : number) : void
  addEmptyBox (boxState: BoxState) : void
  changeActiveBox (activeBoxIndex: number) : void
  defineMacro (name: string, definition: string) : void
  setBoxState (index: number, boxState: BoxState) : void
  children : ReactNode
}

export function MethodInjector (props : InjectorProps) : JSX.Element {
  const { addBox, removeBox, addEmptyBox, changeActiveBox, setBoxState, defineMacro, children } = props

  return (
    <AddBoxContext.Provider value={ addBox }>
      <RemoveBoxContext.Provider value={ removeBox }>
        <AddEmptyBoxContext.Provider value={ addEmptyBox }>
          <ChangeActiveBoxContext.Provider value={ changeActiveBox }>
            <SetBoxStateContext.Provider value={ setBoxState }>
              <DefineMacroContext.Provider value={ defineMacro }>
              { children }
              </DefineMacroContext.Provider>
            </SetBoxStateContext.Provider>
          </ChangeActiveBoxContext.Provider>
        </AddEmptyBoxContext.Provider>
      </RemoveBoxContext.Provider>
    </AddBoxContext.Provider>
  )
}