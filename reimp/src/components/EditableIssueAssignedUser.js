import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form'
import EditableProperty from './form/EditableProperty'
import IssueAssignedUserForm from './form/IssueAssignedUserForm'
import Label from './form/Label'
import Blank from './form/Blank'
import { updateIssueAssignedTo } from '../actions/Issue'
import OtherUser from '../components/OtherUser'
import { getIssue } from '../actions/Issues'
import { getUser } from '../actions/Users'

class EditableIssueAssignedUser extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue } = this.props
        console.log(new_value)
        dispatch(updateIssueAssignedTo(issue.id, new_value.assigned_to.value))
    }
    render() {
        const { issue } = this.props
        
        return (
            <div>
                <EditableProperty property_key='issue_assigned_to'
                                  initial_value={issue.assigned_to_id}
                                  edit_as_modal={true}
                                  onChange={this.onChange}
                >
                    <IssueAssignedUserForm issue={issue} />
                    <OtherUser />
                    <Blank />
                </EditableProperty>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_id } = props
    const issue = getIssue(state, issue_id) || {}
    
    return {
        issue: issue
    }
}


export default connect(mapStateToProps)(EditableIssueAssignedUser)
