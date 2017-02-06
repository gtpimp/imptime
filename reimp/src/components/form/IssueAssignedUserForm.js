import React, {Component} from 'react'
import {connect} from 'react-redux'
import {reduxForm, Field} from 'redux-form'
import SelectList from 'react-widgets/lib/SelectList'
import { ensureUsersLoaded, getUsers } from '../../actions/Users'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import SingleValueSelector from './SingleValueSelector'

class IssueAssignedUserForm extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh()
    }

    refresh() {
        const {dispatch, assignable_user_ids, project_id} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureUsersLoaded(assignable_user_ids))
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const {handleSubmit} = this.props
        fieldOnChange(e)
        setTimeout(() => handleSubmit(), 0)
    }
    
    renderSingleValueSelector(field) {
        const {input, data, ...rest} = field
        return (
            <SingleValueSelector
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                options={data}
                {...rest}
            />
        )
    }

    render() {
        const {handleSubmit, assignable_user_options, initialValues } = this.props
        return (
            <form onSubmit={handleSubmit}>
                <Field name='assigned_user'
                       component={this.renderSingleValueSelector}
                       valueField="value"
                       textField="label"
                       data={assignable_user_options}
                />
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, onChange } = props
    const project = getProject(state, project_id) || {}
    const assignable_user_ids = project.allowed_user_ids || []
    const users = getUsers(state, assignable_user_ids)

    const assignable_user_options = users.map(function (user) {
        return {value: user.id, label: user.username}
    })

    return {
        initialValues: {assigned_to: props.initial_value},
        enableReinitialize: true,
        onSubmit: onChange,
        assignable_user_options: assignable_user_options,
        assignable_user_ids: assignable_user_ids,
        project_id: project_id,
        project: project
    }
}

export default connect(mapStateToProps)(reduxForm({form: 'issue_assigned_user_form'})(IssueAssignedUserForm))

