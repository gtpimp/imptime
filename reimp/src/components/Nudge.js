import React, { Component } from 'react'
import { map, keys, keyBy } from 'lodash'
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'
import classNames from 'classnames'
import {
    ensureNudgesLoaded,
    getNudge
} from '../actions/Nudges'

import IssueName from './IssueName'
import SprintName from './SprintName'
import ProjectName from './ProjectName'
import OtherUser from './OtherUser'
import Timestamp from './Timestamp'
import { getCellStyle } from '../actions/ItemListKeyRegistry'

class Nudge extends Component {

    constructor(props) {
        super(props)
        this.onClickNudge = this.onClickNudge.bind(this)
        this.onToggleSelection = this.onToggleSelection.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, nudge_id } = this.props
	dispatch(ensureNudgesLoaded([nudge_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, nudge_id } = new_props
	dispatch(ensureNudgesLoaded([nudge_id]))
    }

    onClickNudge() {
        const { history, nudge } = this.props
        history.push('/projects/' + nudge.project_id + '/sprints/' + nudge.sprint_id + '/issues/' + nudge.issue_id);
    }

    onToggleSelection() {
        const { nudge, is_selected, onChangeSelection } = this.props
        onChangeSelection(nudge.id, !is_selected)
    }

    render() {

        const { nudge, header_list, is_loading, is_selected } = this.props
        const headers_by_key = keyBy(header_list, "key")
        const visible_header_keys = keys(headers_by_key)
        const reason_class_name = "nudge__reason--" + nudge.reason
        const that = this

        if ( is_loading ) {
            return null
        }

        return (
	    <div key={this.key+"."+nudge.id}
                 className={classNames('nudge',
                                       reason_class_name,
                                       'div-table__row')}
	    >
              { map(visible_header_keys, function(header_key) {
                    const header = headers_by_key[header_key]
                    switch(header_key) {
                        case "select":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  <input type="checkbox"
                                         checked={is_selected}
                                         onChange={that.onToggleSelection}/>
                                </div>
                            )
                        case "user":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  <OtherUser user_id={nudge.user_id}/>
                                </div>
                            )
                        case "project":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  <ProjectName project_id={nudge.project_id}/>
                                </div>
                            )
                        case "sprint":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  <SprintName sprint_id={nudge.sprint_id}/>
                                </div>
                            )
                        case "issue":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  <IssueName issue_id={nudge.issue_id}/>
                                </div>
                            )
                        case "reason":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  {nudge.reason.replace(/_/g," ")}
                                </div>
                            )
                        case "description":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  {nudge.description}
                                </div>
                            )
                        case "due_date":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  { nudge.due_date && <Timestamp value={nudge.due_date} format="from_now" /> }
                                </div>
                            )
                        case "due_date_reason":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  {nudge.due_date_reason}
                                </div>
                            )
                        case "modified":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  <Timestamp value={nudge.modified} format="from_now" />
                                </div>
                            )                            
                        default:
                            console.error("Unknown header: " + header_key)
                    }
                })
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { nudge_id, header_list, is_selected, onChangeSelection } = props
    const nudge = getNudge(state, nudge_id) || {}

    return {
        nudge,
        is_loading: !nudge.id,
        header_list,
        is_selected,
        onChangeSelection
    }
}

export default withRouter(connect(mapStateToProps)(Nudge))
