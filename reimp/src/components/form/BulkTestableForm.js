import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import TextAreaField from './TextAreaField'

class BulkTestableForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
        this.renderName = this.renderName.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.keyDown = this.keyDown.bind(this)
    }

    onChangeAndSubmit(e, fieldOnChange) {
        fieldOnChange(e)
        // setTimeout(() => handleSubmit(), 0)
    }

    keyDown(event) {
        const { onKeyDown } = this.props
        if (onKeyDown) {
            onKeyDown(event)
        }
    }

    renderTextarea(field) {
        const {input} = field
        return (
            <TextAreaField
                rows="10"
                className="textarea textarea--text-component textarea--testable"
                placeholder="Testable steps"
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                onKeyDown={this.keyDown}
            />
        )
    }

    renderName(field) {
        const {input} = field
        return (
            <input
                onKeyDown={this.keyDown}
                maxLength="300"
                className="textarea textarea--text-component textarea--testable"
                placeholder="Testable name (optional)"
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
            />
        )
    }

    render() {

        const { testable, handleSubmit, onCancel } = this.props

        return (
            <div>
              { testable &&
                <div className="text-component--readonly text-component--testable">
                </div>
              }
              <form onSubmit={handleSubmit}>
                <div>
                  <div className="issue_sidebar--textarea">
                    <Field name="name"
                           component={this.renderName} />
                  </div>
                  <div className="issue_sidebar--textarea">
                    <Field name="steps"
                           component={this.renderTextarea} />
                  </div>
                </div>
                <div className="issue_sidebar__button_row">
                  <button className="button issue_sidebar--textarea" type="submit">Submit</button>
                  <button className="button issue_sidebar--textarea" onClick={onCancel}>Cancel</button>
                </div>
              </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { onSubmitted, testable, onCancel } = props

    return {
        testable: testable,
        initialValues: {steps:props.initial_value.steps, name:props.initial_value.name},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel
    }
}

export default connect(mapStateToProps)(reduxForm({form:'bulk_testable_form'})(BulkTestableForm))
