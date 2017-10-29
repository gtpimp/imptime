import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import IssueEstimateForm from './form/IssueEstimateForm'
import { getIssue, updateIssueEstimate } from '../actions/Issues'
import { has_permission } from '../actions/Users'
import Hours from './Hours'
import { format_hours } from '../actions/lib'

class EditableIssueEstimate extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue } = this.props
        dispatch(updateIssueEstimate([issue.id], new_value.estimate))
    }

    render() {
        const { issue, can_edit } = this.props

        return (
            <EditableProperty property_key='issue_estimate'
                              initial_value={format_hours(issue.my_estimate[0].estimate_hours)}
                              onChange={this.onChange}
                              can_edit={can_edit}
            >
              <IssueEstimateForm />
              <div className="text-component--readonly">
                <Hours hours={issue.my_estimate[0].estimate_hours} />
              </div>
              <div className="text-component--empty">0</div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_id } = props
    const issue = getIssue(state, issue_id) || {}
    const can_edit = has_permission(state, issue.project_id, 'has_estimate_own_points')

    return {
        issue: issue,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableIssueEstimate)
