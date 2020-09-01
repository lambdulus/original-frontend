import React, { createContext, ReactNode } from "react"

import { DEFAULT_STATE, EvaluationStrategy, AppState } from "../AppTypes"


export const StateContext = createContext(DEFAULT_STATE)
export const SLIContext = createContext(true)
export const StrategyContext = createContext(EvaluationStrategy.NORMAL)

interface InjectorProps {
  state : AppState
  SLI : boolean
  strategy : EvaluationStrategy
  children : ReactNode
}

export function DataInjector (props : InjectorProps) : JSX.Element {
  const { state, SLI, strategy, children } = props

  return (
    <StateContext.Provider value={ state }>
      <StrategyContext.Provider value={ strategy }>
        <SLIContext.Provider value={ SLI }>
          { children }
        </SLIContext.Provider>
      </StrategyContext.Provider>
    </StateContext.Provider>
  )
}