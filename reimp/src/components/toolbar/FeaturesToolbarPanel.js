import React, {Component} from 'react'
import {connect} from 'react-redux'
import { includes } from 'lodash'
import {withRouter} from 'react-router-dom'
import { startCandidateFeature } from '../../actions/Features'
import { getGloballySelectedProjectId } from '../../actions/Page'
import ToggleButton from './ToggleButton'

class FeaturesToolbarPanel extends Component {

    onNewFeatureClick = () => {
        const { dispatch, last_selected_feature_id, project_id } = this.props
        dispatch(startCandidateFeature(project_id, last_selected_feature_id))
    }

    onToggleFlat = (tree_view) => {
        const { project_id, history } = this.props
        if ( tree_view ) {
            history.push('/projects/' + project_id + '/features')
        } else {
            history.push('/projects/' + project_id + '/features/flat')
        }
    }
    
    render() {
        const { is_tree_view } = this.props
        return (
            <div className="toolbar-panel">
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
    const is_tree_view = !includes(window.location.pathname, "flat") // hack, should be handled by router, don't have time now to fix.
    
    return {
        project_id,
        is_tree_view
    }
}

export default withRouter(connect(mapStateToProps)(FeaturesToolbarPanel))
