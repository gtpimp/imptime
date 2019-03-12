import { createSelector } from 'reselect'
import { getEventLogKey } from '../actions/EventLogs'
import { get, map } from 'lodash'
import moment from 'moment'

const selGetEventLog = (state, props) => {
    const filter = get(state, ["item_list", props.list_key, "filter"], null)
    const event_logs = get(state, ["item", "event_log", "items_by_id"], null)
    if (! event_logs ) {
        return null
    }
    const key = getEventLogKey(filter)
    return event_logs[key]
}

export const makeSelGetEventsForCalendar = () => {
    return createSelector (
        [ selGetEventLog ],
        ( event_log ) => {
            const res = []
            if (! event_log ) {
                return res
            }
            map(event_log.issue_histories, (issue_history) => {
                res.push({type: 'issue_history',
                          start_at: moment(issue_history.created_at).toDate(),
                          end_at: moment(issue_history.created_at).add(30, 'minutes').toDate(),
                          obj: issue_history})
            })
            map(event_log.clock_entries, (clock_entry) => {
                res.push({type: 'clock_entry',
                          start_at: moment(clock_entry.start_time).toDate(),
                          end_at: moment(clock_entry.end_time).toDate(),
                          obj: clock_entry})
            })
            return res
        }
    )
}

