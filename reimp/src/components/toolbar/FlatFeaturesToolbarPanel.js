import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { cx, css } from 'emotion'
import { getGloballySelectedProjectId, toggleShowFlatFeatureListTestables } from '../../actions/Page'
import ToggleButton from './ToggleButton'
import FlatFeatureNavigation from '../FlatFeatureNavigation'
import ReactToPrint from "react-to-print"

class FlatFeaturesToolbarPanel extends Component {

    onToggleFlat = (tree_view) => {
        const { project_id, history } = this.props
        history.push('/projects/' + project_id + '/features')
    }

    printFlatFeatureList() {
        window.print()
    }
    
    render() {
        const { navigateToFeature, is_tree_view, list_key, getComponentRefForPrinting } = this.props
        return (
            <div className="toolbar-panel">
              <FlatFeatureNavigation list_key={list_key} navigateToFeature={navigateToFeature} />
              <div className={cx("icon--print", css`cursor:pointer`)}
                   onClick={this.printFlatFeatureList} />
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
    const { custom_props } = props
    const { navigateToFeature, list_key, getComponentRefForPrinting } = custom_props
    const project_id = getGloballySelectedProjectId(state)
    const is_tree_view = false
    
    return {
        project_id,
        is_tree_view,
        navigateToFeature,
        list_key,
        getComponentRefForPrinting
    }
}

export default withRouter(connect(mapStateToProps)(FlatFeaturesToolbarPanel))
