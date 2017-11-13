import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import '../../sass/text-component.scss'

class SprintReviewCycleForm extends Component {

    constructor(props) {
        super(props)
        this.renderInput = this.renderInput.bind(this)
    }

    renderInput(field) {
        const {input, data, ...rest} = field
        return (
            <input
                maxLength="5"
                className="textarea textarea--text-component"
                placeholder="Review frequency in days"
                onChange={input.onChange}
                value={input.value}
            />
        )
    }

    render() {
        const { handleSubmit } = this.props
        return (
            <form onSubmit={handleSubmit}>
              <div>
                <Field name="review_every_num_days"
                       component={this.renderInput} />
                <button type="submit">Submit</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted } = props

    return {
        initialValues: {review_every_num_days:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_review_cycle_form'})(SprintReviewCycleForm))
