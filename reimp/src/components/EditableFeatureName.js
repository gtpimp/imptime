import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import FeatureNameForm from './form/FeatureNameForm'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import { updateFeatureName, getFeature } from '../actions/Features'
import { has_permission } from '../actions/Users'

class EditableFeatureName extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, feature } = this.props
        dispatch(updateFeatureName(feature.id, new_value.name))
    }

    render() {
        const { feature, can_edit } = this.props

        return (
            <PermissionInspectorHighlighter project_id={feature.project_id}
                                            permission_name='has_edit_feature'>
              <EditableProperty property_key={'feature_name'+feature.id}
                                initial_value={feature.name}
                                onChange={this.onChange}
                                can_edit={can_edit}
                                edit_as_modal={false}
                                actionLabel="Edit Feature Name"
              >
                <FeatureNameForm />
                <div className="text-component--readonly">{feature.name}</div>
                <div className="text-component--empty">Name</div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {
    const { feature_id } = props
    const feature = getFeature(state, feature_id) || {}

    const can_edit = has_permission(state, feature.project_id, 'has_edit_feature')
    return {
        feature: feature,
        can_edit
    }
}


export default connect(mapStateToProps)(EditableFeatureName)
