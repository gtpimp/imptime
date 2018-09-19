import React, {Component} from 'react'
import {connect} from 'react-redux'
import Timestamp from '../components/Timestamp'
import PropertyStack from '../components/PropertyStack'
import PropertyStackComponent from '../components/PropertyStackComponent'
import moment from 'moment'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureFeaturesLoaded, getFeature} from '../actions/Features'
import EditableFeatureName from '../components/EditableFeatureName'

class FeatureSidebar extends Component {

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

    render() {

        const { feature_id, feature } = this.props
        
        return (
            <div className="sidebar feature-sidebar">
              <PropertyStack>

                <PropertyStackComponent>
                  <div className="property--title">
                    <EditableFeatureName feature_id={feature_id} />
                  </div>
                </PropertyStackComponent>
                <PropertyStackComponent>
                  <div className="property-text">{feature.description}
                  </div>
                </PropertyStackComponent>

                <PropertyStackComponent>
                  <div className="named-property">
                    <div className="named-property__name">Created</div>
                    <div className="named-property__value"><Timestamp format="short-date" value={moment(feature.created)}/></div>
                  </div>
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
    }
}

export default connect(mapStateToProps)(FeatureSidebar)

