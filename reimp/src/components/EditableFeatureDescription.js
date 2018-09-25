import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import FeatureDescriptionForm from './form/FeatureDescriptionForm'
import { updateFeatureDescription, getFeature, ensureFeaturesLoaded } from '../actions/Features'
import { has_permission } from '../actions/Users'
import RenderedMarkdown from './RenderedMarkdown'

class EditableFeatureDescription extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    componentDidMount() {
        const {feature_id, dispatch} = this.props
        dispatch(ensureFeaturesLoaded([feature_id]))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch} = this.props
        dispatch(ensureFeaturesLoaded([new_props.feature_id]))
    }

    onChange(new_value) {
        const { dispatch, feature } = this.props
        dispatch(updateFeatureDescription(feature.id, new_value.description))
    }

    render() {
        const { feature, can_edit, project_id } = this.props

        if (! feature ) {
            return null
        }
        
        const description = (feature.description || "").trim()
        const enriched_description = (feature.enriched_description || "").trim() || description
        
        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_description'>
              <EditableProperty property_key={'feature_description'+feature.id}
                                initial_value={description}
                                onChange={this.onChange}
                                can_edit={can_edit}
              >
                <FeatureDescriptionForm />
                <div className="text-component--readonly text-component--description">
                  <RenderedMarkdown content={enriched_description} />
                </div>
                <div> </div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }

}

function mapStateToProps(state, props) {
    const { feature_id } = props
    const feature = getFeature(state, feature_id)
    const project_id = feature && feature.project_id
    const can_edit = project_id && has_permission(state, project_id, 'has_edit_feature')
    return {
        feature: feature,
        project_id: project_id,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableFeatureDescription)
