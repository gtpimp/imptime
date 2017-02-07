import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import IssueTitleForm from './form/IssueTitleForm'
import { updateIssueSubject, getIssue } from '../actions/Issues'

class EditableIssueTitle extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue } = this.props
        dispatch(updateIssueSubject(issue.id, new_value.title))
    }

    render() {
        const { issue } = this.props
        
        return (
            <EditableProperty property_key='issue_title'
                              initial_value={issue.subject}
                              onChange={this.onChange}
            >
                <IssueTitleForm />
                <div className="text-component--readonly">{issue.subject}</div>
                <div className="text-component--empty">Title</div>
            </EditableProperty>
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


export default connect(mapStateToProps)(EditableIssueTitle)
