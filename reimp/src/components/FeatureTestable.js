import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import {
    /*createFeatureTestable,*/
    ensureFeaturesLoaded,
    getFeature,
    is_feature_invalidated,
    addIssueToFeatureTestable
} from '../actions/Features'
import SidebarAddButton from './SidebarAddButton'
import { has_permission } from '../actions/Users'
import Testable from './Testable'

class FeatureTestable extends Component {

    componentWillMount() {
        const { dispatch, feature_id } = this.props
        dispatch(ensureFeaturesLoaded([feature_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { feature_id } = new_props
        dispatch(ensureFeaturesLoaded([feature_id]))
    }

    onPromoteToFeature = (event) => {
        const { dispatch, feature_id, testable_id } = this.props
        event.stopPropagation()
        if ( ! window.confirm( "Convert this testable to a new feature?" ) ) {
            return
        }
        dispatch(promoteFeatureTestableToFeature(feature_id, testable_id))
    }

    render() {
        const {testable, can_edit, project_id} = this.props

        const extra_actions = { label: "Promote to feature",
                                onClick: this.onPromoteToFeature }
        
        return (
            { testable.id && 
              <Testable testable={testable}
                        project_id={project_id}
                        can_edit={can_edit}
                        onDelete={this.onDelete}
                        extra_actions={extra_actions}
              />
            }
            { ! testable.id && 
              <div className="text-component--testable">
                <SidebarAddButton label="Add testable"
                                  onButtonClick={alert("not yet")} />
              </div>
            }
        )
    }
}

function mapStateToProps(state, props) {

    const { feature_id, testable_id } = props
    const feature = getFeature(state, feature_id) || {}
    const can_edit = has_permission(state, feature.project_id, 'has_edit_description')

    let testable = { id: null}
    if { testable_id } {
        map(feature.testables || [], function(feature_testable, index) {
            if ( feature_testable.id === testable_id ) {
                testable = feature_testable
            }
        })
    }

    return {
        feature_id: feature_id,
        feature,
        sprint_id: feature.sprint_id,
        testable_id: testable_id,
        testable: testable,
        project_id: feature.project_id,
        is_invalidated: is_feature_invalidated(state, feature.id),
    }
}


export default connect(mapStateToProps)(FeatureTestable)
