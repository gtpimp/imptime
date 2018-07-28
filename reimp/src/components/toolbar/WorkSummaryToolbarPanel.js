import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import { invalidateAllSummaries } from '../../actions/WorkSummary'
import { LIST_KEY__WORK_SUMMARY_LIST } from '../../actions/ItemListKeyRegistry'
import { invalidateList } from '../../actions/ItemList'

class WorkSummariesToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.invalidateComponents = this.invalidateComponents.bind(this)
    }

    invalidateComponents() {
        const { dispatch } = this.props
        dispatch(invalidateAllSummaries())
        dispatch(invalidateList(LIST_KEY__WORK_SUMMARY_LIST))
    }

    render() {
        return (
            <div className="toolbar-panel">
              <ToolbarButton tooltip="Refresh" icon="refresh" onClick={this.invalidateComponents}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
    }
}


export default connect(mapStateToProps)(WorkSummariesToolbarPanel)
