import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import {
    ensureIssuesLoaded,
    getIssue,
    is_issue_invalidated
} from '../actions/Issues'
import SidebarAddButton from './SidebarAddButton'
import { has_permission } from '../actions/Users'
import IssueFeature from './IssueFeature'

class EditableIssueFeature extends Component {

    componentWillMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    onChange = () => {
        alert("changing")
    }

    onDelete = () => {
        alert("Deleting")
    }

    render() {
        const {feature_testable, can_edit, issue_id, project_id} = this.props
        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_issue_feature'>
              { feature_testable.id &&
                <EditableProperty property_key={'issue_comment_'+issue_id+'_'+feature_testable.id}
                                  initial_value={feature_testable.id}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                    >
                  <IssueCommentForm form={'issue_comment_form_'+issue_id+'_'+comment.id}
                                    issue_id={issue_id} comment={comment}/>
                  <IssueComment issue_id={issue_id}
                                comment={comment}
                                onDelete={this.onDelete} />
                  <div className="text-component--empty"></div>
                </EditableProperty>
              }

              { ! comment.id &&
                <div>
                  <EditableProperty property_key={'issue_comment_'+issue_id}
                                    initial_value=''
                                    onChange={this.onChange}
                                    can_edit={can_edit}
                    >
                    <IssueCommentForm form={'issue_comment_form_'+issue_id} issue_id={issue_id} />
                    <div className="text-component--readonly"></div>
                    <div className="text-component--empty">
                      <div className="text-component--comment">
                        <SidebarAddButton label="Add comment" />
                      </div>
                    </div>
                  </EditableProperty>
                </div>
              }

            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {

    const { issue_id, feature_id, feature_testable_id } = props
    const issue = getIssue(state, issue_id) || {}
    const can_edit = has_permission(state, issue.project_id, 'has_edit_issue_feature')
    const feature_testables = issue.feature_testables
    const feature_testable = first(filter(feature_testables, (ft) => ft.id=feature_testable_id))

    return {
        issue_id: issue_id,
        project_id: issue.project_id,
        feature_testable_id,
        feature_id,
        can_edit: can_edit,
        feature_testable,
        is_invalidated: is_issue_invalidated(state, issue.id)
    }
}


export default connect(mapStateToProps)(EditableIssueFeature)
