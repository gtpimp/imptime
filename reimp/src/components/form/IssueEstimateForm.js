import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import '../../sass/text-component.scss'

class IssueEstimateForm extends Component {

    constructor(props) {
        super(props)
        this.renderInput = this.renderInput.bind(this)
        this.keyDown = this.keyDown.bind(this)
    }

    keyDown(event) {
        const { onKeyDown } = this.props
        if (onKeyDown) {
            onKeyDown(event)
        }
    }

    renderInput(field) {
        const {input, data, onChange, ...rest} = field
        return (
            <input
                rows="1"
                maxLength="10"
                className="textarea--estimate"
                placeholder="estimate"
                onChange={input.onChange}
                value={input.value}
                onKeyDown={this.keyDown}
            />
        )
    }

    render() {
        const { handleSubmit } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <div className="issue_sidebar--textarea">
                  <Field name="estimate" component={this.renderInput} />
                </div>
                <button className="button issue_sidebar--textarea" type="submit">Submit</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted } = props

    return {
        initialValues: {estimate:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_estimate_form'})(IssueEstimateForm))

