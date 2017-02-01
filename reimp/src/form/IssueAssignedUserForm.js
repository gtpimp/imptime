import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form';


class IssueAssignedUserForm extends Component {

    render() {
        const { initialValues, handleSubmit } = this.props
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="assigned">Assigned user</label>
                    <Field name="assigned" component="textarea" type="text"/>
                </div>
                <button type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange } = props
    
    return {
        initialValues: {assigned:props.initial_value},
        enableReinitialize: true,
        onSubmit: onChange
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_assigned_user_form'})(IssueAssignedUserForm))

