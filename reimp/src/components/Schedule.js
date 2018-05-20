import React, { Component } from 'react'
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'
import classNames from 'classnames'
import { map, keys, keyBy } from 'lodash'
import {
    ensureSchedulesLoaded,
    getSchedule
} from '../actions/Schedules'
import Timestamp from './Timestamp'
import { getCellStyle } from '../actions/ItemListKeyRegistry'

class Schedule extends Component {

    constructor(props) {
        super(props)
        this.onClickSchedule = this.onClickSchedule.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, schedule_id } = this.props
	dispatch(ensureSchedulesLoaded([schedule_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, schedule_id } = new_props
	dispatch(ensureSchedulesLoaded([schedule_id]))
    }

    onClickSchedule() {
        const { history, schedule } = this.props
        history.push('/schedules/' + schedule.id);
    }

    render() {

        const { schedule, is_loading, header_list } = this.props
        const headers_by_key = keyBy(header_list, "key")
        const visible_header_keys = keys(headers_by_key)

        if ( ! is_loading === false ) {
	    return (
		<div key={schedule.id}
		     onClick={this.onClickSchedule}
                     className={classNames("div-table__row")}
		>
		  <div className="div-table__cell">{schedule && schedule.id}</div>
		  <div className="div-table__cell">Loading...</div>
		</div>
	    )
        } else {
            return (
		<div key={this.key+"."+schedule.id}
                     className={classNames('schedule',
                                           'div-table__row')}
		>

                  { map(visible_header_keys, function(header_key) {
                        const header = headers_by_key[header_key]
                        switch(header_key) {
                            case "name":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div>{schedule.name}</div>
                                    </div>
                                )
                            case "created_at":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div><Timestamp value={schedule.created} format="from_now"/></div>
                                    </div>
                                )
                            default:
                                console.error("Unknown header: " + header_key)
                                
                        }
                    }
                    )}
                </div>
            )
        }

    }
}

function mapStateToProps(state, props) {
    const { schedule_id, header_list } = props
    const schedule = getSchedule(state, schedule_id) || {}

    return {
        schedule,
        is_loading: !schedule.id,
        header_list
    }
}

export default withRouter(connect(mapStateToProps)(Schedule))
