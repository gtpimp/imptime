import React, { Component } from 'react'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { ReactMde } from 'react-mde'

class MarkdownEditor extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }
    
    onChange(value) {
        const { onChange } = this.props
        onChange(value.text)
    }
    
    render() {
        const { value, name } = this.props
        return (
            <ReactMde textAreaProps={{id: name, name: name}}
                      value={{text:value || ""}}
                      onChange={this.onChange}
                      visibility={{preview:false}}
                      showdownOptions={{ tables: true, simplifiedAutoLink: true }}
            />
        )
    }
}

export default MarkdownEditor
