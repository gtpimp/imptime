import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import { getIssue } from '../../actions/Issues'

class IssueTestableForm extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
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
            <Textarea
                rows="1"
                className="textarea textarea--text-component textarea--testable"
                placeholder="Testable"
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                onKeyDown={this.keyDown}
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
                    <Field name="testable"
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
    const { onSubmitted, issue_id, testable, onCancel } = props
    const { issue } = state;
    /* const loading_item_id = issue.loading_item_ids || {}*/
    /* const initial_value = testable.testable;*/

    return {
        testable: testable,
        initialValues: {testable:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel
        /* initial_value: initial_value,
         * loading_item_id: loading_item_id*/
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_testable_form'})(IssueTestableForm))
