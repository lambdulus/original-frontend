import React, { Component } from 'react'

export default function Result (props : { result : string }) : JSX.Element {
  return (
    <div>
      { props.result }
    </div>
  )
}