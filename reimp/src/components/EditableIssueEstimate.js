import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import IssueEstimateForm from './form/IssueEstimateForm'
import { getIssue, updateIssueEstimate } from '../actions/Issues'
import { has_permission } from '../actions/Users'
import Hours from './Hours'
import Progress from './Progress'
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
        const { issue, can_edit, estimate_hours, class_name } = this.props

        return (
            <EditableProperty property_key={'issue_estimate' + issue.id}
                              initial_value={format_hours(estimate_hours)}
                              onChange={this.onChange}
                              edit_as_modal={true}
                              actionLabel="Issue Estimate"
                              class_name={class_name}
                              can_edit={can_edit}
            >
              <IssueEstimateForm />
              <div className="text-component--readonly">
                <Progress issue={issue} estimate={estimate_hours} />
              </div>
              <div className="text-component--empty">0</div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_id, class_name } = props
    const issue = getIssue(state, issue_id) || {}
    const can_edit = has_permission(state, issue.project_id, 'has_estimate_own_points')
    const estimate_hours = ((issue.my_estimate || [])[0] || {}).estimate_hours || null

    return {
        issue,
        can_edit,
        estimate_hours,
        class_name
    }
}

export default connect(mapStateToProps)(EditableIssueEstimate)
