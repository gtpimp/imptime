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
import FeatureTestable from './FeatureTestable'
import SidebarSectionTitle from './SidebarSectionTitle'
import SidebarProperty from './SidebarProperty'
import SidebarAddButton from './SidebarAddButton'
import SidebarDetail from './SidebarDetail'
import VisualSpecDocumentGallery from './visual_spec/VisualSpecDocumentGallery'
import VisualSpecDocumentForm from './visual_spec/VisualSpecDocumentForm'
import Hours from './Hours'

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
                    return <FeatureTestable key={`feature_testable_${feature.id}_${testable.id}`}
                                            feature_id={feature.id}
                                            testable_id={testable.id}/>
                })
              }
              <FeatureTestable feature_id={feature.id} testable_id={null}/>
            </PropertyStackComponent>
        )
    }

    showAddVisualSpecDoc = () => {
        this.setState({adding_visual_spec_doc:true})
    }

    hideAddVisualSpecDoc = () => {
        this.setState({adding_visual_spec_doc:false})
    }

    renderStatsStack() {
        const { feature } = this.props

        if ( !feature.nested_stats || !feature.stats ) {
            return null
        }
        
        return (
            <div>
              <SidebarProperty key="nestedstatsstack">
                <SidebarSectionTitle title="Stats" />
                <SidebarDetail key={`nested_stats_nested_stats.estimated_hours`} label="Estimated hours"><Hours hours={feature.nested_stats.estimated_hours}/></SidebarDetail>
                <SidebarDetail key={`nested_stats_nested_stats.hours_clocked`} label="Hours so far"><Hours hours={feature.nested_stats.hours_clocked}/></SidebarDetail>
                <SidebarDetail key={`nested_stats_nested_stats.num_features_missing_testables`} label="Features missing testables">{feature.nested_stats.num_features_missing_testables}</SidebarDetail>
                <SidebarDetail key={`nested_stats_nested_stats.num_testables_without_issues`} label="Number of testables without issues">{feature.nested_stats.num_testables_without_issues}</SidebarDetail>
                <SidebarDetail key={`nested_stats_nested_stats.num_not_fully_implemented_testables`} label="Number of testables without matching issues">{feature.nested_stats.num_not_fully_implemented_testables}</SidebarDetail>
                <SidebarDetail key={`nested_stats_nested_stats.num_unestimated_issues`} label="Number of unestimated issues">{feature.nested_stats.num_issues_without_estimates}</SidebarDetail>
                
                { false && <SidebarDetail key={`nested_stats_nested_stats.num_testables_with_issues`} label="num_testables_with_issues">{feature.nested_stats.num_testables_with_issues}</SidebarDetail>}
                { false && <SidebarDetail key={`nested_stats_nested_stats.num_issues`} label="num_issues">{feature.nested_stats.num_issues}</SidebarDetail> }
                { false && <SidebarDetail key={`nested_stats_nested_stats.num_issues_with_estimates`} label="num_issues_with_estimates">{feature.nested_stats.num_issues_with_estimates}</SidebarDetail>}
                { false && <SidebarDetail key={`nested_stats_nested_stats.num_fully_implemented_testables`} label="num_fully_implemented_testables">{feature.nested_stats.num_fully_implemented_testables}</SidebarDetail>}
              </SidebarProperty>
            </div>
        )
    }

    renderAttachmentsStack() {
        const { feature, project_id } = this.props
        const adding_visual_spec_doc = this.state.adding_visual_spec_doc
        return (
            <SidebarProperty key="attachmentstack">
              <SidebarSectionTitle title="Attachments" />
              <VisualSpecDocumentGallery annotated_visual_spec_document_ids={feature.annotated_visual_spec_document_ids}
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
                { this.renderStatsStack() }
                
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

