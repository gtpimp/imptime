import React, {Component} from 'react'
import {connect} from 'react-redux'
import { first, filter } from 'lodash'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import {
    ensureIssuesLoaded,
    getIssue,
    is_issue_invalidated
} from '../actions/Issues'
import {
    removeIssueToFeatureTestable,
    addIssueToFeature_AutoCreateTestable
} from '../actions/Features'
import SidebarAddButton from './SidebarAddButton'
import { has_permission } from '../actions/Users'
import IssueFeature from './IssueFeature'
import FeatureSelectorForm from './form/FeatureSelectorForm'

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

    onChange = (new_value) => {
        const { dispatch, issue } = this.props
        dispatch(addIssueToFeature_AutoCreateTestable(new_value.feature_id, issue.id))
    }

    onDelete = (evt) => {
        const { dispatch, feature_id, feature_testable_id, issue_id } = this.props
        if ( evt ) {
            evt.preventDefault()
            evt.stopPropagation()
        }
        if (! window.confirm("Unassociate this feature from the issue?") ) {
            return false
        }
        dispatch(removeIssueToFeatureTestable(feature_id, feature_testable_id, issue_id))
    }

    render() {
        const {feature_testable, feature_id, can_edit, issue_id, project_id} = this.props
        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_issue_feature'>
              { feature_testable &&
                <EditableProperty property_key={'issue_feature_'+issue_id+'_'+feature_testable.id}
                                  edit_as_modal={true}
                                  modal_variant="large"
                                  initial_value={feature_testable.id}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                    >
                  <FeatureSelectorForm form={'issue_feature_form_'+issue_id+'_'+feature_id}
                                       project_id={project_id}
                                       default_feature_id={feature_id}/>
                  <IssueFeature issue_id={issue_id}
                                feature_id={feature_id}
                                feature_testable_id={feature_testable.id}
                                onDelete={can_edit && this.onDelete} />
                  <div className="text-component--empty"></div>
                </EditableProperty>
              }

              { ! feature_testable &&
                <div>
                  <EditableProperty property_key={'issue_feature_'+issue_id}
                                    edit_as_modal={true}
                                    modal_variant="fixed"
                                    initial_value=''
                                    onChange={this.onChange}
                                    can_edit={can_edit}
                    >
                    <FeatureSelectorForm form={'issue_feature_form_'+issue_id}
                                         project_id={project_id}
                    />
                    <div className="text-component--readonly"></div>
                    <div className="text-component--empty">
                      <div className="text-component--feature">
                        <SidebarAddButton label="Add feature" />
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
