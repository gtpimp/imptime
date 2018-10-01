import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import Textarea from 'react-expanding-textarea'

class BulkFeatureCreatorForm extends Component {

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
                className="textarea textarea--text-component bulk-feature-creator-form__textarea"
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
              <h2>Bulk Feature Creator</h2>
              <div className="bulk-feature-creator-form__content">
                <div className="bulk-feature-creator-form__help">
                  Sample of creating features, include as many as you want:
                  <pre>{`

                  * feature level 1
                  This is some top level feature description

                  ** feature level 2
                  This is a feature nested inside level 1

                  *** feature level 3
                  More nested

                  Testable:
                  - do something
                  - confirm it worked

                  Testable: 
                  name: a testable name
                  attachment: name_of_an_existing_project_attachment
                  - do something else
                  - confirm it also worked
                  
                `}</pre>
                </div>
                <div className="bulk-feature-creator-form__textarea feature_sidebar--textarea">
                  <Field name="bulk_feature_text"
                         component={this.renderTextarea} />
                </div>
              </div>
              <div className="bulk-feature-creator-form__actions">
                <button className="button feature_sidebar--textarea" type="submit">Create</button>
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

export default connect(mapStateToProps)(reduxForm({form:'bulk_feature_creator'})(BulkFeatureCreatorForm))
