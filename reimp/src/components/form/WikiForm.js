import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import Textarea from 'react-expanding-textarea'
import ReactTimeout from 'react-timeout'
import MarkdownEditor from '../MarkdownEditor'

const AUTOSAVE_TIMEOUT_MILLISECONDS = 5000

class WikiForm extends Component {

    constructor(props) {
        super(props)
        this.renderMarkdownEditor = this.renderMarkdownEditor.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.autoSaveTimer = null
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const { handleSubmit } = this.props
        if ( this.autoSaveTimer ) {
            clearTimeout(this.autoSaveTimer)
            this.autoSaveTimer = null
        }
        
        fieldOnChange(e)
        
        this.autoSaveTimer = setTimeout(handleSubmit, AUTOSAVE_TIMEOUT_MILLISECONDS)
    }

    renderMarkdownEditor(field) {
        const {input, wiki} = field
        return (
            <MarkdownEditor
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                name={input.name} />
        )
    }

    render() {

        const { handleSubmit, onKeyDown } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <div className="project_sidebar--textarea">
                  <Field name="content" component={this.renderMarkdownEditor} />
                </div>
              </div>
              <button className="button project_sidebar--textarea" type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onKeyDown } = props

    return {
        initialValues: {content:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onKeyDown
    }
}

export default connect(mapStateToProps)(reduxForm({form:'wiki_form'})(ReactTimeout(WikiForm)))
