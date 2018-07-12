import React, { Component } from 'react'
import 'react-mde/lib/styles/css/react-mde-all.css'
import ReactMde, {ReactMdeTypes} from 'react-mde'
import * as Showdown from 'showdown';

interface MarkdownEditorState {
  mdeState: ReactMdeTypes.MdeState;
}


class MarkdownEditor extends Component<{}, MarkdownEditorState> {
    converter: Showdown.Converter;

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.state = {mdeState: { markdown: props.value } }
        this.converter = new Showdown.Converter({
            tables: true,
            simplifiedAutoLink: true,
            strikethrough: true,
            tasklists: true,
        });
    }
    
    onChange(mdeState: ReactMdeTypes.MdeState) {
        const { onChange } = this.props
        this.setState({ mdeState })
        onChange(mdeState.markdown)
    }

    
    render() {
        const { name } = this.props
        return (
            <ReactMde textAreaProps={{id: name, name: name}}
                      onChange={this.onChange}
                      visibility={{preview:false}}
                      editorState={this.state.mdeState}
                      generateMarkdownPreview={markdown => Promise.resolve(this.converter.makeHtml(markdown))}
            />
        )
    }
}

export default MarkdownEditor
