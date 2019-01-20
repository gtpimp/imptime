import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { startCandidateFeature } from '../../actions/Features'
import { getGloballySelectedProjectId, get_selected_feature_ids } from '../../actions/Page'
import ToggleButton from './ToggleButton'
import { PAGE_KEY__FEATURES_PAGE } from '../../actions/ItemListKeyRegistry'

class FeaturesToolbarPanel extends Component {

    onNewFeatureClick = () => {
        const { dispatch, last_selected_feature_id, project_id } = this.props
        dispatch(startCandidateFeature(project_id, last_selected_feature_id))
    }

    onCreateIssuesFromFeatures = () => {
        const { dispatch, last_selected_feature_id, project_id } = this.props
        dispatch(startCandidateFeature(project_id, last_selected_feature_id))
    }
    
    onToggleFlat = (tree_view) => {
        const { project_id, history } = this.props
        history.push('/projects/' + project_id + '/features/flat')
    }
    
    render() {
        const { is_tree_view } = this.props
        return (
            <div className="toolbar-panel">
              <div className="button toolbar-button--small button--large button--primary"
                   onClick={this.onCreateIssuesFromFeatures}>
                Auto Create Issues
              </div>
              <div className="button toolbar-button--small button--large button--primary"
                   onClick={this.onNewFeatureClick}>
                + New Feature
              </div>
              <ToggleButton value={is_tree_view}
                            onChange={this.onToggleFlat}
                            on_label={"Tree"}
                            off_label={"Flat"}
              />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = getGloballySelectedProjectId(state)
    const is_tree_view = true
    const selected_feature_ids = get_selected_feature_ids(state, PAGE_KEY__FEATURES_PAGE)
    const last_selected_feature_id = selected_feature_ids && selected_feature_ids[0]
    
    return {
        project_id,
        is_tree_view,
        last_selected_feature_id
    }
}

export default withRouter(connect(mapStateToProps)(FeaturesToolbarPanel))
