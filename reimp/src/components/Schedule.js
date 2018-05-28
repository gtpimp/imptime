import React, { Component } from 'react'
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'
import classNames from 'classnames'
import { map, keys, keyBy } from 'lodash'
import {
    ensureSchedulesLoaded,
    getSchedule,
    addViewableUsersToSchedule,
    removeViewableUsersToSchedule,
    addEditableUsersToSchedule,
    removeEditableUsersToSchedule
} from '../actions/Schedules'
import Timestamp from './Timestamp'
import OtherUser from './OtherUser'
import InviteUserForm from '../components/form/InviteUserForm'
import ModalDialog from '../components/ModalDialog'
import { getCellStyle } from '../actions/ItemListKeyRegistry'
import { logged_in_user } from '../actions/Auth'

class Schedule extends Component {

    constructor(props) {
        super(props)
        this.onClickSchedule = this.onClickSchedule.bind(this)
        this.startAddViewableUser = this.startAddViewableUser.bind(this)
        this.stopAddViewableUser = this.stopAddViewableUser.bind(this)
        this.onAddViewableUser = this.onAddViewableUser.bind(this)
        this.startAddEditableUser = this.startAddEditableUser.bind(this)
        this.stopAddEditableUser = this.stopAddEditableUser.bind(this)
        this.onAddEditableUser = this.onAddEditableUser.bind(this)
        this.state = { 'inviting_viewable_user': false,
                       'inviting_editable_user': false }
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
        history.push('/schedule/' + schedule.id);
    }

    startAddViewableUser(event) {
        if ( event ) {
            event.preventDefault()
            event.stopPropagation()
        }
        this.setState({'inviting_viewable_user': true})
    }

    stopAddViewableUser(event) {
        if ( event ) {
            event.preventDefault()
            event.stopPropagation()
        }
        this.setState({'inviting_viewable_user': false})
    }

    onAddViewableUser(new_value) {
        const { schedule_id, dispatch } = this.props
        dispatch(addViewableUsersToSchedule(schedule_id, [new_value.invited_user_email]))
        this.stopAddViewableUser()
    }

    onRemoveViewableUser(event, user_id) {
        const { schedule_id, dispatch } = this.props
        if ( event ) {
            event.preventDefault()
            event.stopPropagation()
        }
        dispatch(removeViewableUsersToSchedule(schedule_id, [user_id]))
    }

    renderAddViewableUser() {
        const { project_id } = this.props
        const that = this
        return (
            <ModalDialog isOpen={true}
                         onClose={that.stopAddViewableUser}
                         title="Invite people to this schedule"
                         variant="large">
              <div>
                <InviteUserForm project_id={project_id} onChange={that.onAddViewableUser}/>
              </div>
            </ModalDialog>
        )
    }

    startAddEditableUser(event) {
        if ( event ) {
            event.preventDefault()
            event.stopPropagation()
        }
        this.setState({'inviting_editable_user': true})
    }

    stopAddEditableUser(event) {
        if ( event ) {
            event.preventDefault()
            event.stopPropagation()
        }
        this.setState({'inviting_editable_user': false})
    }

    onAddEditableUser(new_value) {
        const { schedule_id, dispatch } = this.props
        dispatch(addEditableUsersToSchedule(schedule_id, [new_value.invited_user_email]))
        this.stopAddEditableUser()
    }

    onRemoveEditableUser(event, user_id) {
        const { schedule_id, dispatch } = this.props
        if ( event ) {
            event.preventDefault()
            event.stopPropagation()
        }
        dispatch(removeEditableUsersToSchedule(schedule_id, [user_id]))
    }

    renderAddEditableUser() {
        const { project_id } = this.props
        const that = this
        return (
            <ModalDialog isOpen={true}
                         onClose={that.stopAddEditableUser}
                         title="Invite people to this schedule"
                         variant="large">
              <div>
                <InviteUserForm project_id={project_id} onChange={that.onAddEditableUser}/>
              </div>
            </ModalDialog>
        )
    }

    render() {
        const { schedule, is_loading, header_list, can_edit } = this.props
        const headers_by_key = keyBy(header_list, "key")
        const visible_header_keys = keys(headers_by_key)
        const that = this

        if ( ! is_loading === false ) {
	    return (
		<div key={schedule.id}
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
                                      <div onClick={that.onClickSchedule}>{schedule.name}</div>
                                    </div>
                                )
                            case "created_at":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div><Timestamp value={schedule.created} format="from_now"/></div>
                                    </div>
                                )
                            case "viewable_users":
                                return (
                                    <div className="div-table__cell schedule__user-list" key={header_key}
                                         style={getCellStyle(header)}>
                                      {map(schedule.viewer_user_ids, function(user_id) {
                                           return (
                                               <div key={user_id} className="schedule__user">
                                                 <OtherUser user_id={user_id} />
                                                 <div className="icon--small-delete" onClick={(event) => that.onRemoveViewableUser(event, user_id)}/>
                                               </div>
                                           )
                                       })}
                                       {can_edit && <button onClick={that.startAddViewableUser}>+</button>}
                                    </div>
                                )
                            case "editable_users":
                                return (
                                    <div className="div-table__cell schedule__user-list" key={header_key}
                                         style={getCellStyle(header)}>
                                      {map(schedule.editor_user_ids, function(user_id) {
                                           return (
                                               <div key={user_id} className="schedule__user">
                                                 <OtherUser user_id={user_id}/>
                                                 <div className="icon--small-delete" onClick={(event) => that.onRemoveEditableUser(event, user_id)}/> 
                                               </div>
                                           )
                                       })}
                                       {can_edit && <button onClick={that.startAddEditableUser}>+</button>}
                                    </div>
                                )
                            default:
                                console.error("Unknown header: " + header_key)
                        }
                    }
                    )}
                    { this.state.inviting_viewable_user && this.renderAddViewableUser() }
                    { this.state.inviting_editable_user && this.renderAddEditableUser() }
                </div>
            )
        }
    }
}

function mapStateToProps(state, props) {
    const { schedule_id, header_list } = props
    const schedule = getSchedule(state, schedule_id) || {}
    const can_edit = schedule.owner_id === logged_in_user().user_id

    return {
        schedule,
        is_loading: !schedule.id,
        header_list,
        can_edit
    }
}

export default withRouter(connect(mapStateToProps)(Schedule))
