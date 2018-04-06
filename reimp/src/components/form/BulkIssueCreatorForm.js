import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import Textarea from 'react-expanding-textarea'

class BulkIssueCreatorForm extends Component {

    constructor(props) {
        super(props)
        this.keyDown = this.keyDown.bind(this)
        this.renderTextarea = this.renderTextarea.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    keyDown(event) {
        const { onCancel } = this.props
        if (event.keyCode === 27) {
            event.preventDefault()
            onCancel()
        }
    }

    onChange(e, fieldOnChange) {
        fieldOnChange(e)
    }
    
    renderTextarea(field) {
        const {input} = field
        return (
            <Textarea
                className="textarea textarea--text-component bulk-issue-creator-form__textarea"
                style={{ minHeight:200 }}
                placeholder="Bulk Text"
                value={input.value}
                onChange={(e) => this.onChange(e, input.onChange)}
                onKeyDown={this.keyDown}
            />
        )
    }
    
    render() {
        const { handleSubmit } = this.props
        
        return (
            <form onSubmit={handleSubmit}>
              <h2>Bulk Issue Creator</h2>
              <div>
                Sample of a single issue section, include as many as you want:
                <pre>{`

                  *** my new issue1
                  This is some description
                  
                  *** my new issue2
                  This is another description
                  
                `}</pre>
              </div>
              <div>
                <div className="issue_sidebar--textarea">
                  <Field name="bulk_issue_text"
                         component={this.renderTextarea} />
                </div>
              </div>
              <button className="button issue_sidebar--textarea" type="submit">Create</button>
            </form>
        )        
    }
}

function mapStateToProps(state, props) {

    const { onSubmit, onCancel } = props
    
    return {
        onSubmit,
        onCancel,
        enableReinitialize: true,
    }
}

export default connect(mapStateToProps)(reduxForm({form:'bulk_issue_creator'})(BulkIssueCreatorForm))
