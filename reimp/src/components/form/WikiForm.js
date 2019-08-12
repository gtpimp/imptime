import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import ReactTimeout from 'react-timeout'
import MarkdownEditor from '../MarkdownEditor'

// Don't need this anymore, now that auto-remembering keyboard data is implemented, but it's still kind of nice to eventually auto-save, so leaving in with a big timer.
const AUTOSAVE_TIMEOUT_MILLISECONDS = 5000000

class WikiForm extends Component {

    constructor(props) {
        super(props)
        this.renderMarkdownEditor = this.renderMarkdownEditor.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.autoSaveTimer = null
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const { handleSubmit, setTimeout, clearTimeout } = this.props
        if ( this.autoSaveTimer ) {
            clearTimeout(this.autoSaveTimer)
            this.autoSaveTimer = null
        }
        
        fieldOnChange(e)
        
        this.autoSaveTimer = setTimeout(handleSubmit, AUTOSAVE_TIMEOUT_MILLISECONDS)
    }

    renderMarkdownEditor(field) {
        const {input} = field
        return (
            <MarkdownEditor
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                name={input.name} />
        )
    }

    render() {

        const { handleSubmit } = this.props

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
