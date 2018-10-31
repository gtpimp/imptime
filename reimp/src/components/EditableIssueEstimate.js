import React, {Component} from 'react'
import {connect} from 'react-redux'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import EditableProperty from './form/EditableProperty'
import IssueEstimateForm from './form/IssueEstimateForm'
import { getIssue, updateIssueEstimate } from '../actions/Issues'
import { has_permission } from '../actions/Users'
import Progress from './Progress'
import { format_hours } from '../actions/lib'
import Hours from './Hours'

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
        const { issue, can_edit, actual, estimate_hours, class_name, project_id, renderReadOnly } = this.props

        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_estimate_own_points'>
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
                  { renderReadOnly && renderReadOnly() }
                  { ! renderReadOnly && (
                        <div>
                          { estimate_hours &&
                            <Progress issue={issue} actual={actual} estimate={estimate_hours} force_show={true} />
                          }
                          { can_edit && ! estimate_hours &&
                            <div>
                              <Hours hours={actual} />
                              <div className="icon--timer-estimate"/>
                            </div>
                          }
                        </div>
                  )}
                </div>
                <div className="text-component--empty">0</div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_id, class_name, actual, renderReadOnly } = props
    const issue = getIssue(state, issue_id) || {}
    const can_edit = has_permission(state, issue.project_id, 'has_estimate_own_points')
    const estimate_hours = ((issue.my_estimate || [])[0] || {}).estimate_hours || null

    return {
        issue,
        can_edit,
        project_id: issue.project_id,
        estimate_hours,
        class_name,
        actual,
        renderReadOnly
    }
}

export default connect(mapStateToProps)(EditableIssueEstimate)
