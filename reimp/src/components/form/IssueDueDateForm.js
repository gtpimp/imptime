import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import SingleValueSelector from './SingleValueSelector'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

class IssueDueDateForm extends Component {

    constructor(props) {
        super(props)
        this.renderDateSelector = this.renderDateSelector.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh()
    }

    refresh() {
        
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const {handleSubmit} = this.props
        fieldOnChange(e)
        setTimeout(() => handleSubmit(), 0)
    }

    renderDateSelector(field) {
        const {input, data, ...rest} = field
        return (
            <DatePicker selected={input.value}
                        dateFormat="DD/MM/YYYY"
                        allowSameDate={true}
                        popperPlacement='bottom'
                        startOpen={true}
                        value={input.value}
                        onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                        {...rest}
            />
        )
    }

    render() {
        const { handleSubmit, due_date_options } = this.props
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="issue_due_date">Due date</label>
                    <Field name="issue_due_date"
                           component={this.renderDateSelector}
                           valueField="value"
                           textField="label"
                           data={due_date_options}
                    />
                </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted } = props

    return {
        initialValues: {due_date:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_due_date_form'})(IssueDueDateForm))
