import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Field} from 'redux-form'
import { ensureUsersLoaded, getUsers } from '../../actions/Users'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import SingleValueSelector from './SingleValueSelector'

class IssueAssigneeField extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
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

    onFieldChange(user_id, fieldOnChange) {
        const {onChange} = this.props
        fieldOnChange(user_id)
        if ( onChange ) {
            onChange(user_id)
        }
    }

    renderSingleValueSelector(field) {
        const {input, data, ...rest} = field
        const { project_id, auto_focus } = this.props
        return (
            <SingleValueSelector
                onChange={(user_id) => this.onFieldChange(user_id, input.onChange)}
                value={input.value}
                options={data}
                auto_focus={auto_focus}
                rememberer_key={"user_"+project_id}
                {...rest}
            />
        )
    }

    render() {
        const {assignable_user_options } = this.props
        return (
              <Field name='assigned_user'
                     component={this.renderSingleValueSelector}
                     valueField="value"
                     textField="label"
                     data={assignable_user_options}
              />
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, onChange, auto_focus } = props
    const project = getProject(state, project_id) || {}
    const assignable_user_ids = project.allowed_user_ids || []
    const users = getUsers(state, assignable_user_ids)

    const assignable_user_options = users.map(function (user) {
        return {value: user.id, label: user.visible_name}
    })

    return {
        enableReinitialize: true,
        assignable_user_options,
        assignable_user_ids,
        project_id,
        project,
        onChange,
        auto_focus
    }
}

export default connect(mapStateToProps)(IssueAssigneeField)
