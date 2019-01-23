import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import TextAreaField from './TextAreaField'

class TestableLineForm extends Component {

    onChangeAndSubmit = (e, fieldOnChange) => {
        fieldOnChange(e)
        // setTimeout(() => handleSubmit(), 0)
    }

    keyDown = (event) => {
        const { onKeyDown } = this.props
        if (onKeyDown) {
            onKeyDown(event)
        }
    }

    renderTextarea = (field) => {
        const {input} = field
        return (
            <TextAreaField
                rows="1"
                className="textarea textarea--text-component textarea--testable"
                placeholder="Click... or Verify..."
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                onKeyDown={this.keyDown}
            />
        )
    }

    render() {

        const { testable_line, handleSubmit, onCancel } = this.props

        return (
            <div>
              { testable_line &&
                <div className="text-component--readonly text-component--testable">
                </div>
              }
              <form onSubmit={handleSubmit}>
                <div>
                  <div className="issue_sidebar--textarea">
                    <Field name="instruction"
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
    const { onSubmitted, testable_line, onCancel } = props

    return {
        testable_line: testable_line,
        initialValues: {instruction:props.initial_value.instruction},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel
    }
}

export default connect(mapStateToProps)(reduxForm({form:'testable_line_form'})(TestableLineForm))
