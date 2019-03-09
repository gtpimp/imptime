import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import Timestamp from './Timestamp'
import {
    ensureEventLogLoaded,
    getEventLog,
    isLoadingEventLog,
    invalidateEventLog
} from '../actions/EventLogs'
import {
    update_list_filter,
    getListFilter
} from '../actions/ItemList'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import Loading from './Loading'
import 'react-datepicker/dist/react-datepicker.css'

class EventLog extends Component {

    componentDidMount() {
        const { dispatch, list_key, project_id, filter } = this.props
        dispatch(update_list_filter(list_key, filter))
        
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(ensureEventLogLoaded(filter))
            dispatch(invalidateEventLog(filter))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, filter } = this.props
        if ( new_props.project_id ) {
            dispatch(ensureProjectsLoaded([new_props.project_id]))
            dispatch(ensureEventLogLoaded(filter))
        }
    }

    updateDateFromInclusive = (new_value) => {
        const { dispatch, list_key } = this.props
        dispatch(update_list_filter(list_key, {'date_from_inclusive': new_value}))
    }

    updateDateToInclusive = (new_value) => {
        const { dispatch, list_key } = this.props
        dispatch(update_list_filter(list_key, {'date_to_inclusive': new_value}))
    }

    refreshEventLog = () => {
        const { filter, dispatch } = this.props
        dispatch(invalidateEventLog(filter))
    }

    render_filter() {
        const { filter } = this.props
        return (
            <div className="project__statement__filter">

              <div className="project__statement__date_filter">

              <div className="project__statement__filter__from">
                  From:
                  <DatePicker selected={filter.date_from_inclusive}
                              dateFormat="DD/MM/YYYY"
                              onChange={this.updateDateFromInclusive} />
                </div>

                <div className="project__statement__filter__to">
                  To:
                  <DatePicker selected={filter.date_to_inclusive}
                              dateFormat="DD/MM/YYYY"
                              onChange={this.updateDateToInclusive} />
                </div>

                <div className="project__statement__filter__submit">
                  <button onClick={this.refreshEventLog}>Filter</button>
                </div>
              </div>

              <h3 className="project__statement__date_range">
                <div className="project__statement__date_range__element">Event log from</div>
                <div className="project__statement__date_range__element"><Timestamp value={filter.date_from_inclusive}/></div>
                <div className="project__statement__date_range__element">to</div>
                <div className="project__statement__date_range__element"><Timestamp value={filter.date_to_inclusive}/></div>
                <div className="project__statement__date_range__element">(inclusive)</div>
              </h3>
              
              <div className="clear">
              </div>
              
            </div>
        )
    }

    render() {

        const { is_loading, event_log } = this.props
        const that = this;

        return (
            <div className="project__statement">
              { is_loading &&
                <div>
                  <br/>
                  <Loading />
                </div>
              }

              { that.render_filter() }

              { ! is_loading &&
                <div>
                  Captain's Log: 1 2 3
                  id={event_log.id}
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id, list_key } = props
    const project = getProject(state, project_id) || {}
    const filter = getListFilter(state, list_key)
    const event_log = filter && getEventLog(state, filter)

    if ( ! filter.date_from_inclusive ) {
        filter.date_from_inclusive = moment().subtract(1, 'days');
    }
    if ( ! filter.date_to_inclusive ) {
        filter.date_to_inclusive = moment().add(1, 'days');
    }
    if (! filter.project_id ) {
        filter.project_id = project_id
    }
    const is_loading = !event_log || isLoadingEventLog(state, filter)
    
    return {
        project_id,
        project,
        event_log,
        is_loading,
        filter,
    }
}

export default connect(mapStateToProps)(EventLog)
