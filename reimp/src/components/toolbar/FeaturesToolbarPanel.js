import React, {Component} from 'react'
import {connect} from 'react-redux'
import { startCandidateFeature } from '../../actions/Features'
import { getGloballySelectedProjectId, get_selected_feature_ids } from '../../actions/Page'
import { PAGE_KEY__FEATURES_PAGE } from '../../actions/ItemListKeyRegistry'

class FeaturesToolbarPanel extends Component {

    onNewFeatureClick = () => {
        const { dispatch, last_selected_feature_id, project_id } = this.props
        dispatch(startCandidateFeature(project_id, last_selected_feature_id))
    }
    
    render() {
        return (
            <div className="toolbar-panel">
              <div className="button toolbar-button--small button--large button--primary"
                   onClick={this.onNewFeatureClick}>
                + New Feature
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = getGloballySelectedProjectId(state)
    const selected_feature_ids = get_selected_feature_ids(state, PAGE_KEY__FEATURES_PAGE)
    const last_selected_feature_id = (selected_feature_ids && selected_feature_ids[0]) || null

    return {
        project_id,
        last_selected_feature_id
    }
}

export default connect(mapStateToProps)(FeaturesToolbarPanel)
