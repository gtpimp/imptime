import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import Textarea from 'react-expanding-textarea'

class ReleaseNoteCreatorForm extends Component {

    constructor(props) {
        super(props)
        this.renderHeaderTextarea = this.renderHeaderTextarea.bind(this)
        this.renderContentTextarea = this.renderContentTextarea.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    onChange(e, fieldOnChange) {
        fieldOnChange(e)
    }
    
    renderHeaderTextarea(field) {
        const {input} = field
        return (
            <Textarea
                className="textarea textarea--text-component release-note-creator-form__textarea"
                style={{ minHeight:50 }}
                value={input.value}
                onChange={(e) => this.onChange(e, input.onChange)}
            />
        )
    }

    renderContentTextarea(field) {
        const {input} = field
        return (
            <Textarea
                className="textarea textarea--text-component release-note-creator-form__textarea"
                style={{ minHeight:200 }}
                value={input.value}
                onChange={(e) => this.onChange(e, input.onChange)}
            />
        )
    }
    
    render() {
        const { handleSubmit } = this.props
        
        return (
            <form onSubmit={handleSubmit}>
              <h2>Release note creator</h2>
              <div>
                <div className="issue_sidebar--textarea">
                  Header
                  <Field name="release_note_header"
                         component={this.renderHeaderTextarea} />

                  <br/>
                  Content
                  <Field name="release_note_content"
                         component={this.renderContentTextarea} />
                </div>
              </div>
              <button className="button issue_sidebar--textarea" type="submit">Create</button>
            </form>
        )        
    }
}

function mapStateToProps(state, props) {

    const { onSubmit } = props
    
    return {
        onSubmit,
        enableReinitialize: true,
    }
}

export default connect(mapStateToProps)(reduxForm({form:'release_note_creator'})(ReleaseNoteCreatorForm))
