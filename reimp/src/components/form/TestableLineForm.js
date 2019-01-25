import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import InputField from './InputField'

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
                           placeholder="Click... or Verify..."
                           maxLength="500"
                           autoFocus
                           onKeyDown={this.keyDown}
                           component={InputField} />
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
