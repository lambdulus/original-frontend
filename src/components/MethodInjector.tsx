import React, { createContext, ReactNode } from "react"
import { BoxState } from "../AppTypes";


export const AddBoxContext = createContext((boxState : BoxState) => {})
export const AddEmptyBoxContext = createContext((boxState : BoxState) => {})
export const ChangeActiveBoxContext = createContext((activeBoxIndex : number) => {} )
export const SetBoxStateContext = createContext((index : number, boxState : BoxState) => {})
export const DefineMacroContext = createContext((name : string, definition : string) => {})

interface InjectorProps {
  addBox (boxState : BoxState) : void
  addEmptyBox (boxState: BoxState) : void
  changeActiveBox (activeBoxIndex: number) : void
  defineMacro (name: string, definition: string) : void
  setBoxState (index: number, boxState: BoxState) : void
  children : ReactNode
}

export function MethodInjector (props : InjectorProps) : JSX.Element {
  const { addBox, addEmptyBox, changeActiveBox, setBoxState, defineMacro, children } = props

  return (
    <AddBoxContext.Provider value={ addBox }>
      <AddEmptyBoxContext.Provider value={ addEmptyBox }>
        <ChangeActiveBoxContext.Provider value={ changeActiveBox }>
          <SetBoxStateContext.Provider value={ setBoxState }>
            <DefineMacroContext.Provider value={ defineMacro }>
            { children }
            </DefineMacroContext.Provider>
          </SetBoxStateContext.Provider>
        </ChangeActiveBoxContext.Provider>
      </AddEmptyBoxContext.Provider>
    </AddBoxContext.Provider>
  )
}