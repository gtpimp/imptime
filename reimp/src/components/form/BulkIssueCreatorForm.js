import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import TextAreaField from './TextAreaField'

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
            <TextAreaField
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
              <div className="bulk-issue-creator-form__content">
                <div className="bulk-issue-creator-form__help">
                  Sample of creating issues, include as many as you want:
                  <pre>{`

                  *** my new issue1
                  This is some description
                  
                  *** my new issue2
                  This is another description

                  *** my new issue3 with testables
                  This is my description

                  Testable:
                  - do something
                  - confirm it worked

                  Testable:
                  name: some testable name
                  - do something else
                  - confirm it also worked

                  *** my new issue4 with attributes
                  type: management-general
                  status: dev done
                  estimate: 1.5
                  attachment: name_of_an_existing_project_attachment
                  tags: some_tag_category:some_tag_name, some_other_tag_category:some_other_tag_name

                  Doing admin type things
                  
                `}</pre>
                </div>
                <div className="bulk-issue-creator-form__textarea issue_sidebar--textarea">
                  <Field name="bulk_issue_text"
                         component={this.renderTextarea} />
                </div>
              </div>
              <div className="bulk-issue-creator-form__actions">
                <button className="button issue_sidebar--textarea" type="submit">Create</button>
              </div>
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
