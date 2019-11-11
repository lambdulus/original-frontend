import React from 'react'
const ReactMarkdown = require('react-markdown')
import 'github-markdown-css'

import guide from '../misc/UserGuide'

export default function HelpSpace (props : {}) : JSX.Element {
  return (
  <div className='helpSpace'>
    <ReactMarkdown className='markdown-body' source={ guide } />    
  </div>)
}