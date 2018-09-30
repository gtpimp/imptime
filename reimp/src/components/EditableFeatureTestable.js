import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import {
    updateFeatureTestable,
    createFeatureTestable,
    deleteFeatureTestable,
    ensureFeaturesLoaded,
    getFeature,
    is_feature_invalidated,
    addIssueToFeatureTestable,
    removeIssueToFeatureTestable
} from '../actions/Features'
import TestableForm from './form/TestableForm'
import { has_permission } from '../actions/Users'
import Testable from './Testable'
import IssueName from './IssueName'
import IssueSelectorForm from './form/IssueSelectorForm'
import ModalDialog from './ModalDialog'

class EditableFeatureTestable extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
        this.state = {creatingIssueForTestable: false}
    }

    componentWillMount() {
        const { dispatch, feature_id } = this.props
        dispatch(ensureFeaturesLoaded([feature_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { feature_id } = new_props
        dispatch(ensureFeaturesLoaded([feature_id]))
    }

    onChange(new_value) {
        const { dispatch, feature_id, testable_id } = this.props
        if ( testable_id ) {
            dispatch(updateFeatureTestable(feature_id, testable_id, new_value.testable, new_value.name))
        } else {
            dispatch(createFeatureTestable(feature_id, new_value.testable, new_value.name))
        }
    }

    onDelete(evt) {
        const { dispatch, feature_id, testable_id } = this.props
        evt.stopPropagation()
        if (! window.confirm("Are you sure you want to delete this testable?" ) ) {
            return false;
        }
        dispatch(deleteFeatureTestable(feature_id, testable_id))
    }

    onCancelCreateIssueForTestable = () => {
        this.setState({creatingIssueForTestable: false})
    }

    createIssueForTestable = (evt) => {
        evt.stopPropagation()
        this.setState({creatingIssueForTestable: true})
    }

    onCreatedIssueForTestable = (new_values) => {
        const { dispatch, feature_id, testable } = this.props
        const { issue_id } = new_values
        this.setState({creatingIssueForTestable: false})
        dispatch(addIssueToFeatureTestable(feature_id, testable.id, issue_id))
    }

    onRemoveIssueFromFeature = (evt, issue_id) => {
        const { dispatch, feature_id, testable } = this.props
        evt.stopPropagation()
        if ( ! window.confirm("Unassociate this issue from this testable?\n(The issue won't be deleted)") ) {
            return
        }
        dispatch(removeIssueToFeatureTestable(feature_id, testable.id, issue_id))
    }

    getExtraActions = (testable) => {
        const that = this
        const actions = [
            {onClick: this.createIssueForTestable,
             label: "Link issue"}
        ]
        map(testable.implementing_issue_ids, (issue_id) => {
            actions.push({onClick: null,
                          label: (
                              <div>
                                <IssueName issue_id={issue_id}/>
                                <div className="issue__small-delete-image"
                                     onClick={(evt) => that.onRemoveIssueFromFeature(evt, issue_id)} />
                              </div>
                          )})
        })
        return actions
    }

    renderCreateIssueForTestable() {
        const { testable } = this.props
        return (
            <ModalDialog isOpen={true}
                         onClose={this.onCancelCreateIssueForTestable}
                         title={`Select issue for testable`}
                         variant="large">
              <div className="editable-property-modal__row editable-property-modal__row--header">
                <label className="editable-property-modal__title">
                  Select or create an issue for testable {testable.name}
                </label>
              </div>
              <IssueSelectorForm optional_default_issue_values={{issue_type:'issue'}}
                                 onSubmitted={this.onCreatedIssueForTestable}/>
            </ModalDialog>
        )
    }

    renderTestable = (testable) => {
        return (
            <div>
              <Testable testable={testable}
                        onDelete={this.onDelete}
                        extraActions={this.getExtraActions(testable)}
              />
            </div>
        )
    }

    render() {
        const {testable, can_edit, feature_id, project_id} = this.props
        const { creatingIssueForTestable } = this.state
        return (

            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_feature'>
              { creatingIssueForTestable && this.renderCreateIssueForTestable() }
              { testable.id &&
                <EditableProperty property_key={'feature_testable_'+feature_id+'_'+testable.id}
                                  initial_value={testable}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                >
                  <TestableForm form={'feature_testable_form_'+feature_id+'_'+testable.id}
                                testable={testable}/>
                  { this.renderTestable(testable) }
                  <div className="text-component--empty"></div>
                </EditableProperty>
              }

              <div className="feature-testable__button-bar">
                { ! testable.id &&
                  <div>
                    <EditableProperty property_key={'feature_testable_'+feature_id}
                                      initial_value=''
                                      onChange={this.onChange}
                                      can_edit={can_edit}
                    >
                      <TestableForm form={'feature_testable_form_'+feature_id} />
                      <div className="text-component--readonly"></div>
                      <div className="text-component--empty">
                        <div className="icon--add" data-tooltip="Create testable"></div>
                      </div>
                    </EditableProperty>
                  </div>
                }

              </div>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {

    const { feature_id, testable_id } = props
    const feature = getFeature(state, feature_id) || {}
    const can_edit = has_permission(state, feature.project_id, 'has_edit_description')

    let testable = { id: null}
    map(feature.testables || [], function(feature_testable, index) {
        if ( feature_testable.id === testable_id ) {
            testable = feature_testable
        }
    })

    return {
        feature_id: feature_id,
        feature,
        sprint_id: feature.sprint_id,
        testable_id: testable_id,
        testable: testable,
        can_edit: can_edit,
        project_id: feature.project_id,
        is_invalidated: is_feature_invalidated(state, feature.id),
    }
}


export default connect(mapStateToProps)(EditableFeatureTestable)
