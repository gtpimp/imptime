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
    is_feature_invalidated
} from '../actions/Features'
import TestableForm from './form/TestableForm'
import { has_permission } from '../actions/Users'
import Testable from './Testable'

class EditableFeatureTestable extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
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
            dispatch(updateFeatureTestable(feature_id, testable_id, new_value.testable))
        } else {
            dispatch(createFeatureTestable(feature_id, new_value.testable))
        }
    }

    onDelete(event) {
        const { dispatch, feature_id, testable_id } = this.props
        event.stopPropagation()
        if (! window.confirm("Are you sure you want to delete this testable?" ) ) {
            return false;
        }
        dispatch(deleteFeatureTestable(feature_id, testable_id))
    }

    render() {
        const {testable, can_edit, feature_id, project_id} = this.props
        return (

            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_feature'>
              { testable.id &&
                <EditableProperty property_key={'feature_testable_'+feature_id+'_'+testable.id}
                                  initial_value={testable.steps}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                >
                  <TestableForm form={'feature_testable_form_'+feature_id+'_'+testable.id}
                                testable={testable}/>
                  <Testable testable={testable}
                            onDelete={this.onDelete}
                  />
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
