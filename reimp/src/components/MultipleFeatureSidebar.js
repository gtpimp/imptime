import React, {Component} from 'react'
import {connect} from 'react-redux'
import {ensureFeaturesLoaded, getFeatures} from '../actions/Features'
import PropertyStack from '../components/PropertyStack'
import PropertyStackComponent from '../components/PropertyStackComponent'

class MultipleFeatureSidebar extends Component {

    componentDidMount() {
        const {feature_ids, dispatch} = this.props
        dispatch(ensureFeaturesLoaded(feature_ids))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch} = this.props
        dispatch(ensureFeaturesLoaded(new_props.feature_ids))
    }

    render() {

        const {features} = this.props

        return (

            <div className="sidebar feature-sidebar">
              <PropertyStack>
                <PropertyStackComponent>
                  <div className="property-row">
                    <div className="property-value">
                      { features.length } features selected
                    </div>
                  </div>
                  
                </PropertyStackComponent>
                
              </PropertyStack>
              
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {feature_ids, project_id} = props
    const features = getFeatures(state, feature_ids) || []
    let feature = null
    if ( features && features.length > 0 ) {
        feature = features[0]
    }
    
    return {
        features: features || [],
        feature,
        feature_ids,
        project_id
    }
}

export default connect(mapStateToProps)(MultipleFeatureSidebar)
