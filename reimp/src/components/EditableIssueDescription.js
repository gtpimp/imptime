import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import IssueDescriptionForm from './form/IssueDescriptionForm'
import { updateIssueDescription, getIssue } from '../actions/Issues'

class EditableIssueDescription extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue } = this.props
 
        dispatch(updateIssueDescription(issue.id, new_value.description))
    }

    render() {
        const { issue } = this.props
        
        return (
            <EditableProperty property_key='issue_description'
                              initial_value={issue.description}
                              onChange={this.onChange}
            >
                <IssueDescriptionForm />
                <div className="text-component--readonly text-component--description">{issue.description}</div>
                <div className="text-component--empty text-component--description">Description</div>
            </EditableProperty>
        )
    }

}

function mapStateToProps(state, props) {
    const { issue_id } = props
    const issue = getIssue(state, issue_id)
    return {
        issue: issue
    }
}


export default connect(mapStateToProps)(EditableIssueDescription)
