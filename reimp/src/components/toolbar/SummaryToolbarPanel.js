import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import '../../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import ReactTooltip from 'react-tooltip'
import { invalidateAllSummaries } from '../../actions/Summaries'
import { LIST_KEY__SUMMARY_LIST } from '../../actions/ItemListKeyRegistry'
import { invalidateList } from '../../actions/ItemList'

class SummariesToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.invalidateComponents = this.invalidateComponents.bind(this)
    }

    invalidateComponents() {
        const { dispatch } = this.props
        dispatch(invalidateAllSummaries())
        dispatch(invalidateList(LIST_KEY__SUMMARY_LIST))
    }

    render() {
        return (
            <div className="toolbar-panel">
              <ToolbarButton tooltip="Refresh" icon="refresh" onClick={this.invalidateComponents}/>
              <ReactTooltip place="bottom" type="info" />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
    }
}


export default connect(mapStateToProps)(SummariesToolbarPanel)
