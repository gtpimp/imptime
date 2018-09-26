import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import Sidebar from './Sidebar'
import {
    getCandidateFeature,
    updateCandidateName,
    saveCandidateFeature,
    cancelCandidateFeature
} from '../actions/Features'
import FeatureNameForm from './form/FeatureNameForm'

class NewFeatureSidebar extends Component {

    constructor(props) {
        super(props)
        this.onSaveCandidateFeature = this.onSaveCandidateFeature.bind(this)
        this.onCancelFeatureCreation = this.onCancelFeatureCreation.bind(this)
    }

    onSaveCandidateFeature(new_value) {
        const {dispatch} = this.props
        dispatch(updateCandidateName(new_value.name))
        dispatch(saveCandidateFeature())
    }

    onCancelFeatureCreation() {
        const {dispatch} = this.props
        dispatch(cancelCandidateFeature())
    }
    
    render() {
        
        return (
            
            <Sidebar>
              <PropertyStack>
                <div>
                  <div>
                    <FeatureNameForm
                        onSubmitted={this.onSaveCandidateFeature}
                        onCancel={this.onCancelFeatureCreation}/>
                  </div>
                </div>
              </PropertyStack>
            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {

    const candidate_feature = getCandidateFeature(state) || null
    return {
        candidate_feature: candidate_feature
    }
}

export default connect(mapStateToProps)(NewFeatureSidebar)
