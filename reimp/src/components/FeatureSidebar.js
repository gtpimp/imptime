import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import Timestamp from './Timestamp'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import moment from 'moment'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureFeaturesLoaded, getFeature, deleteFeatures} from '../actions/Features'
import EditableFeatureName from './EditableFeatureName'
import EditableFeatureDescription from './EditableFeatureDescription'
import EditableFeatureTestable from './EditableFeatureTestable'
import SidebarSectionTitle from './SidebarSectionTitle'
import SidebarProperty from './SidebarProperty'
import SidebarAddButton from './SidebarAddButton'
import VisualSpecDocumentGallery from './visual_spec/VisualSpecDocumentGallery'
import VisualSpecDocumentForm from './visual_spec/VisualSpecDocumentForm'

class FeatureSidebar extends Component {

    constructor(props) {
        super(props)
        this.state = {adding_visual_spec_doc: false}
    }
    
    componentDidMount() {
	const { dispatch, project_id, feature_id } = this.props
	if ( project_id ) {
	    dispatch(ensureProjectsLoaded([project_id]))
	}
	if ( feature_id ) {
	    dispatch(ensureFeaturesLoaded([feature_id]))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { project_id, feature_id } = new_props
	if ( project_id ) {
	    dispatch(ensureProjectsLoaded([project_id]))
	}
	if ( feature_id ) {
	    dispatch(ensureFeaturesLoaded([feature_id]))
	}
    }

    onDeleteFeature = () => {
        const { dispatch, feature_id } = this.props
        if (! window.confirm("Are you sure you want to delete this feature?") ) {
            return false
        }
        dispatch(deleteFeatures([feature_id]))
    }

    renderTestablesStack() {
        const { feature, testables } = this.props
        return (
            <PropertyStackComponent title="Testables">
              { map(testables, function (testable, index) {
                    return <EditableFeatureTestable key={feature.id+"_"+testable.id} feature_id={feature.id} testable_id={testable.id}/>
                })
              }
              <EditableFeatureTestable feature_id={feature.id} testable_id={null}/>
            </PropertyStackComponent>
        )
    }

    showAddVisualSpecDoc = () => {
        this.setState({adding_visual_spec_doc:true})
    }

    hideAddVisualSpecDoc = () => {
        this.setState({adding_visual_spec_doc:false})
    }

    renderAddAttachmentWidget() {
        const { issue } = this.props
        return (
            <PropertyStackComponent>
              <SidebarSectionTitle title="Attachments" />
              <VisualSpecDocumentGallery visual_spec_document_ids={issue.visual_spec_document_ids}
                                         issue_id={issue.id}
                                         allow_edit={false} />
              <button className="button button--primary" onClick={this.showAddVisualSpecDoc}>Add</button>
              <button className="button button--secondary" onClick={this.showIssueVisualSpecGallery}>Manage</button>
            </PropertyStackComponent>
        )
    }

    renderAttachmentsStack() {
        const { feature, project_id } = this.props
        const adding_visual_spec_doc = this.state.adding_visual_spec_doc
        return (
            <SidebarProperty key="attachmentstack">
              <SidebarSectionTitle title="Attachments" />
              <VisualSpecDocumentGallery visual_spec_document_ids={feature.visual_spec_document_ids}
                                         feature_id={feature.id}
                                         allow_edit={false} />
              
              { ! adding_visual_spec_doc && (
                    <SidebarAddButton
                        data-tooltip="Upload attachment"
                        onButtonClick={this.showAddVisualSpecDoc}
                        label="Add attachment" />
                )}
                { adding_visual_spec_doc && (
                      <div>
                        <VisualSpecDocumentForm feature_id={feature.id}
                                                project_id={project_id}
                                                onChange={this.hideAddVisualSpecDoc}
                        />
                        <button className="button button--primary" onClick={this.hideAddVisualSpecDoc}>Cancel</button>
                      </div>
                  )}
            </SidebarProperty>
        )
    }

    render() {

        const { feature_id, feature } = this.props

        if (! feature_id ) {
            return null
        }
        
        return (
            <div className="sidebar feature-sidebar">
              <PropertyStack>

                <PropertyStackComponent>
                  <div className="property--title">
                    <EditableFeatureName feature_id={feature_id} />
                  </div>
                </PropertyStackComponent>
                <PropertyStackComponent>
                  <div className="property-text">
                    <EditableFeatureDescription feature_id={feature_id} />
                  </div>
                </PropertyStackComponent>

                <PropertyStackComponent>
                  <div className="named-property">
                    <div className="named-property__name">Created</div>
                    <div className="named-property__value"><Timestamp format="short-date" value={moment(feature.created)}/></div>
                  </div>
                </PropertyStackComponent>

                { this.renderTestablesStack() }
                { this.renderAttachmentsStack() }
                
                <PropertyStackComponent>
                  <div onClick={this.onDeleteFeature} className="icon--small-delete" />
                </PropertyStackComponent>
                
              </PropertyStack>
            </div>
        )
    }
}

export function mapStateToProps(state, props) {
    const { feature_id, project_id } = props
    const project = getProject(state, project_id)
    const feature = getFeature(state, feature_id) || {}
    
    return {
        feature_id,
        feature,
        project_id,
        project,
        testables: feature && feature.testables
    }
}

export default connect(mapStateToProps)(FeatureSidebar)

