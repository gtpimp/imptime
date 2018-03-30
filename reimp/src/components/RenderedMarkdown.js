import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {browserHistory} from 'react-router'
import ReactMarkdown from 'react-markdown'
import { has_permission } from '../actions/Users'
import SprintName from './SprintName'
import Timestamp from './Timestamp'

const imptime_constant = "__imptime__"

const renderers = {
    link: (props) => {
        return (
            <a href={props.href}
               target="_blank"
               onClick={(event) => event.stopPropagation()}>
              {(props.children && props.children[0]) || props.href}
            </a> 
        )
    },
    inlineCode: (props) => {
        if ( ! props.children.startsWith(imptime_constant) ) {
            return (
                <code>{props.children}</code>
            )
        }

        const raw_attrs = props.children.slice(imptime_constant.length)
        let attrs
        try {
            attrs = JSON.parse(raw_attrs)
        } catch (err) {
            console.error("Failed to parse imptime attr: " + raw_attrs + " : " + err)
            return <code>{props.children}</code>
        }
        
        return (
            <div className="imptime_inline_code">
              <code>
                issue{attrs.issue_number} ({attrs.issue_status})
              </code>
              <div className="imptime_inline_code__tooltip">
                <div className="imptime_inline_code__tooltip_row imptime_inline_code__tooltip_row--issue">
                  issue{attrs.issue_number}
                </div>
                <div className="imptime_inline_code__tooltip_row imptime_inline_code__tooltip_row--issue">
                  {attrs.issue_subject}
                </div>
                <div className="imptime_inline_code__tooltip_row imptime_inline_code__tooltip_row--issue">
                  Issue status: {attrs.issue_status}
                </div>
                <div className="imptime_inline_code__tooltip_row imptime_inline_code__tooltip_row--modified">
                  Issue last modified <Timestamp value={attrs.issue_modified} format="from_now"/>
                </div>
                <div className="imptime_inline_code__tooltip_row imptime_inline_code__tooltip_row--sprint">
                  Sprint: {attrs.sprint_name} ({attrs.sprint_status})
                </div>
              </div>
            </div>
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
