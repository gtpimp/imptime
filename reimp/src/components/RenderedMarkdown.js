import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {browserHistory} from 'react-router'
import ReactMarkdown from 'react-markdown'
import { has_permission } from '../actions/Users'

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
                {attrs.readable_name}
              </code>
              <div className="imptime_inline_code__infos">
                {map(attrs.infos, (info) =>
                    <div className="imptime_inline_code__info">{info}</div>
                 )}
              </div>
              <div className="imptime_inline_code__tooltip">
                {map(attrs.tooltips, (tooltip_row) =>
                    <div className="imptime_inline_code__tooltip_row">
                      {tooltip_row}
                    </div>
                 )}
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
