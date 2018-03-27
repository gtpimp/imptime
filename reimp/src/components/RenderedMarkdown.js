import React, { Component } from 'react'
import { connect } from 'react-redux'
import {browserHistory} from 'react-router'
import ReactMarkdown from 'react-markdown'
import { has_permission } from '../actions/Users'

const renderers = {
    link: (props) => {
        return (
            <a href={props.href}
               target="_blank"
               onClick={(event) => event.stopPropagation()}>
              {(props.children && props.children[0]) || props.href}
            </a> 
        )
    }
}

class RenderedMarkdown extends Component {

    render() {
        const { content } = this.props
        const fixed_content = (content || "").trim()
        return (
            <div className="text-component--rendered_markdown">
              <ReactMarkdown source={fixed_content} renderers={renderers} />
            </div>
        )
    }
}

export default RenderedMarkdown
