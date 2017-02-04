import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form'
import SelectList from 'react-widgets/lib/SelectList'
import { ensureUsersLoaded, getUsers } from '../../actions/Users'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'

class IssueAssignedUserForm extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh()
    }
    
    refresh() {
        const { dispatch, assignable_user_ids, project_id } = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureUsersLoaded(assignable_user_ids))
    }
    
    renderSelectList({input, ...rest }) {
        return (
            <SelectList {...input} onBlur={() => input.onBlur()} {...rest}/>
        )
    }
    
    render() {
        const { initialValues, handleSubmit, assignable_users } = this.props
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="assigned">Assigned user</label>
                    <Field name="assigned_to" component={this.renderSelectList}
                           valueField="value"
                           textField="label"
                           data={assignable_users}
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, onChange } = props
    const project = getProject(state, project_id) || {}
    const assignable_user_ids = project.allowed_user_ids || []
    const users = getUsers(state, assignable_user_ids)
    
    const assignable_users = users.map(function(user) {
	return { value: user.id, label: user.username }
    })
    
    return {
        initialValues: {assigned_to:props.initial_value},
        enableReinitialize: true,
        onSubmit: onChange,
        assignable_users: assignable_users,
        assignable_user_ids: assignable_user_ids,
        project_id: project_id,
        project: project
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_assigned_user_form'})(IssueAssignedUserForm))

