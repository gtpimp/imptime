import React, {Component} from 'react'
import { map, slice, size } from 'lodash'
import moment from 'moment'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {css} from 'emotion'
import ModalDialog from '../ModalDialog'
import IssueName from '../IssueName'
import SprintName from '../SprintName'
import Timestamp from '../Timestamp'
import Hours from '../Hours'
import ProjectName from '../ProjectName'
import '../../sass/auto-clock.scss'
import { getAvailableAutoClockEntity,
         clockIn,
         clockOut,
         hideAutoClockPopup,
         showAutoClockPopup,
         isAutoClockingEnabled,
         enableAutoClocking,
         disableAutoClocking
} from '../../actions/AutoClock'
import AutoClockEntity from './AutoClockEntity'
import { ENTITY_KEY__AUTO_CLOCK,
         LIST_KEY__RECENT_AUTO_CLOCK,
         LIST_KEY__RECENT_AUTO_CLOCK_BY_ISSUE
} from '../../actions/ItemListKeyRegistry'
import { isLoadingItems, areAnyItemsInvalidated } from '../../actions/Item'
import { logged_in_user } from '../../actions/Auth'
import ToggleButton from '../toolbar/ToggleButton'
import {
    fetchAutoClocksIfNeeded, getAutoClocks, setPreferredRole
} from '../../actions/AutoClock'
import {
    initList,
    shouldFetchList,
    getVisibleItemIds,
    getNestedObjects,
    ensureNestedObjectsLoaded,
    isLoading,
    getLastUpdated,
    update_list_pagination,
    update_list_ordering,
    update_list_format,
    update_list_filter,
    getListFilter
} from '../../actions/ItemList'
import PopupPanelButton from '../PopupPanelButton'
import PopupPanelMiniButton from '../PopupPanelMiniButton'
import PopupPanelHeading from '../PopupPanelHeading'
import PopupPanelSeparator from '../PopupPanelSeparator'
import BreadcrumbCell from '../BreadcrumbCell'
import BreadcrumbSeparator from '../BreadcrumbSeparator'

class AutoClockPopup extends Component {
    constructor(props) {
        super(props)
        this.onClockIn = this.onClockIn.bind(this)
        this.onClockInIssue = this.onClockInIssue.bind(this)
        this.onClockOut = this.onClockOut.bind(this)
        this.hideList = this.hideList.bind(this)
        this.showList = this.showList.bind(this)
        this.onShowPopup = this.onShowPopup.bind(this)
        this.onHidePopup = this.onHidePopup.bind(this)
        this.onAutoClockingEnabledToggleClick = this.onAutoClockingEnabledToggleClick.bind(this)
        this.state = { show_list: false,
                       show_popup: false }
    }

    componentDidMount() {
        const { dispatch, list_key, list_key_by_issue } = this.props
        dispatch(initList(list_key))
        dispatch(update_list_ordering(list_key, { 'start_time': 'desc' }))
        dispatch(update_list_pagination(list_key, { page_size: 1 }))

        dispatch(initList(list_key_by_issue))
        dispatch(update_list_ordering(list_key_by_issue, { 'start_time': 'desc' }))
        dispatch(update_list_format(list_key_by_issue, { 'distinct_by_issue': true }))
        dispatch(update_list_filter(list_key_by_issue, { 'is_active': false }))
        dispatch(update_list_pagination(list_key_by_issue, { page_size: 6 }))
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, filter, filter_by_issue,
                logged_in_user_id,
                list_key, nested_objects,
                list_key_by_issue, nested_objects_by_issue } = props
        if ( filter.user_id !== logged_in_user_id ) {
            dispatch(update_list_filter(list_key, {user_id:logged_in_user_id}))
        }
        dispatch(fetchAutoClocksIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
        
        if ( filter_by_issue.user_id !== logged_in_user_id ) {
            dispatch(update_list_filter(list_key_by_issue, {user_id:logged_in_user_id}))
        }
        dispatch(fetchAutoClocksIfNeeded(list_key_by_issue))
        dispatch(ensureNestedObjectsLoaded(nested_objects_by_issue))
    }

    onHidePopup() {
        this.setState({show_popup:false})
        hideAutoClockPopup()
    }

    onShowPopup() {
        this.setState({show_popup:true})
        showAutoClockPopup()
    }

    onClockInIssue(issue_id) {
        const { dispatch } = this.props
        dispatch(disableAutoClocking())
        dispatch(clockIn({issue_id:issue_id}))
    }

    onClockIn(new_values) {
        const { dispatch } = this.props
        dispatch(disableAutoClocking())
        dispatch(clockIn(new_values))
        setPreferredRole(new_values.role)
    }

    onClockOut(entry_id) {
        const { dispatch } = this.props
        dispatch(clockOut(entry_id))
        dispatch(disableAutoClocking())
    }

    onAutoClockingEnabledToggleClick(new_value) {
        const { dispatch } = this.props
        if ( new_value ) {
            dispatch(enableAutoClocking())
        } else {
            dispatch(disableAutoClocking())
        }
    }

    hideList() {
        this.setState({show_list: false})
    }

    showList() {
        this.setState({show_list: true})
    }

    renderEntryWithTimings(entry) {
        return (
            <div className={css`display:flex; justify-content:space-between; width:80%`}>
              {this.renderIssueInline(entry.project_id, entry.sprint_id, entry.issue_id)}
              {this.renderTimings(entry)}
            </div>
        )
    }
    
    renderTimings(entry) {

        let hours = entry.hours
        if ( ! hours && entry.is_active ) {
            hours = moment().diff(moment(entry.start_time),'hours', true)
        }
        
        return (
            <div key="timings" className={css`display:flex`}>
              <BreadcrumbSeparator chevron={false} />
              <BreadcrumbCell>
                <Timestamp value={entry.start_time} format="from_now"/>
              </BreadcrumbCell>
              <BreadcrumbSeparator chevron={false} />
              <BreadcrumbCell>
                <Hours hours={hours}/>&nbsp;hours
              </BreadcrumbCell>
            </div>
        )
    }

    renderIssueInline(project_id, sprint_id, issue_id) {
        return (
            <div key="issue" className={css`display:flex`}>
              <BreadcrumbCell>
                <ProjectName project_id={project_id} />
              </BreadcrumbCell>
              <BreadcrumbSeparator/>
              <BreadcrumbCell>
                <SprintName sprint_id={sprint_id} />
              </BreadcrumbCell>
              <BreadcrumbSeparator/>
              <BreadcrumbCell>
                <IssueName issue_id={issue_id} />
              </BreadcrumbCell>
            </div>
        )
    }

    renderClockToggle() {
        const { most_recent_entry} = this.props
        return (
            <div className="auto-clock__button"
                 onClick={this.onShowPopup}>
              { most_recent_entry && most_recent_entry.is_active &&
                <div className={css`display:flex;`}>
                  <BreadcrumbCell>
                    <div className="icon--timer-active auto-clock__stop"
                         onClick={this.onShowPopup} />
                  </BreadcrumbCell>
                  <BreadcrumbSeparator/>
                  { this.renderIssueInline(most_recent_entry.project_id,
                                           most_recent_entry.sprint_id,
                                           most_recent_entry.issue_id) }
                  
                </div>
              }
              { (! most_recent_entry || ! most_recent_entry.is_active) &&
                <div className="icon--timer-inactive"/>
              }
            </div>
        )
        
    }

    renderCurrentClock() {

        const { most_recent_entry} = this.props

        if ( ! most_recent_entry || ! most_recent_entry.is_active  ) {
            return null
        }
        
        return (
            <div>
              <PopupPanelHeading>
                Current:
              </PopupPanelHeading>
              <div key={most_recent_entry.id} className={css`cursor:pointer;display:flex;width:100%;`}>
                <PopupPanelMiniButton onClick={() => this.onClockOut(most_recent_entry.id)}>
                  Stop
                </PopupPanelMiniButton>
                { this.renderEntryWithTimings(most_recent_entry)}
              </div>
              <PopupPanelSeparator strong={true} />
            </div>
        )
    }

    renderPreviousClocks() {
        let { recent_entries_by_issue, most_recent_entry } = this.props
        const that = this

        if ( most_recent_entry && most_recent_entry.is_active &&
             size(recent_entries_by_issue) > 0 &&
             recent_entries_by_issue[0].issue_id === most_recent_entry.issue_id ) {

            recent_entries_by_issue = slice(recent_entries_by_issue, 1)
        }

        if (size(recent_entries_by_issue) === 0) {
            return null
        }
        
        return (
            <div>
              <PopupPanelHeading>
                Recently clocked:
              </PopupPanelHeading>
              
              <div>
                {map(recent_entries_by_issue, function(recent_entry_by_issue) {
                     return (
                         <div key={recent_entry_by_issue.id} className={css`cursor:pointer;display:flex;`}>
                           <PopupPanelMiniButton onClick={() => that.onClockInIssue(recent_entry_by_issue.issue_id)}>
                             Clock again
                           </PopupPanelMiniButton>
                           { that.renderEntryWithTimings(recent_entry_by_issue)}
                         </div>
                     )}
                 )}
              </div>
            </div>
        )
    }

    renderAvailableClock() {
        const { available_project_id,
                available_sprint_id, available_issue_id,
                auto_clocking_enabled } = this.props

        if ( ! available_issue_id ) {
            return null
        }
        
        return (
            <div>
              <PopupPanelHeading>
                Selected issue:
              </PopupPanelHeading>

              <div className={css`cursor:pointer;display:flex;width:100%;`}>
                <PopupPanelMiniButton onClick={() => this.onClockInIssue(available_issue_id)}>
                  Clock in
                </PopupPanelMiniButton>
                {this.renderIssueInline(available_project_id, available_sprint_id, available_issue_id)}
              </div>
                  
              { false &&
                // Disabled because this isn't 100% tested yet.
                <div className="auto-clock__toggle_autoclocking">
                  <ToggleButton value={auto_clocking_enabled}
                                onChange={this.onAutoClockingEnabledToggleClick}
                                on_label={"Auto clocking enabled"}
                                off_label={"Auto clocking disabled"}
                  />
                </div>
              }

              <PopupPanelSeparator strong={true} />

            </div>
        )
    }

    renderPanel() {
        return (
            <ModalDialog isOpen={true}
                         onClose={this.onHidePopup}
                         variant="large"
                         title="Clocker">

              
              { this.renderCurrentClock() }
              { this.renderAvailableClock() }
              { this.renderPreviousClocks() }

              <PopupPanelButton>
                <Link to='/clock/history'>Clock history</Link>
              </PopupPanelButton>
              
            </ModalDialog>
        )
    }

    renderClockStatus() {
        const { most_recent_entry } = this.props
        return (
            <div>
              { most_recent_entry &&
                <div className="auto-clock__mini-auto-clock-status">
                  <AutoClockEntity project_id={most_recent_entry.project_id}
                                   sprint_id={most_recent_entry.sprint_id}
                                   issue_id={most_recent_entry.issue_id}
                                   className="auto-clock-entry__entities_row" />
                </div>
              }
            </div>
        )
    }

    render() {
        const { show_popup } = this.state

        return (

            <div>
              { this.renderClockToggle() }
              { show_popup && this.renderPanel() }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const list_key = LIST_KEY__RECENT_AUTO_CLOCK
    const list_key_by_issue = LIST_KEY__RECENT_AUTO_CLOCK_BY_ISSUE

    const { available_project_id,
            available_sprint_id,
            available_issue_id } = getAvailableAutoClockEntity(state)

    const visible_item_ids = getVisibleItemIds(state, list_key)
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__AUTO_CLOCK, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const nested_objects = getNestedObjects(state, list_key)
    const should_fetch_list = shouldFetchList(state, list_key)
    const is_invalidated = areAnyItemsInvalidated(state, ENTITY_KEY__AUTO_CLOCK, visible_item_ids)
    const items_by_id = getAutoClocks(state, visible_item_ids)
    const filter = getListFilter(state, list_key)
    const most_recent_entry = (items_by_id && items_by_id.length > 0 && items_by_id[0]) || null
    const recent_entries = items_by_id
    
    const visible_item_ids_by_issue = getVisibleItemIds(state, list_key_by_issue)
    const is_loading_by_issue = isLoading(state, list_key_by_issue) || isLoadingItems(state, ENTITY_KEY__AUTO_CLOCK, visible_item_ids_by_issue)
    const last_updated_by_issue = getLastUpdated(state, list_key_by_issue)
    const nested_objects_by_issue = getNestedObjects(state, list_key_by_issue)
    const should_fetch_list_by_issue = shouldFetchList(state, list_key_by_issue)
    const is_invalidated_by_issue = areAnyItemsInvalidated(state, ENTITY_KEY__AUTO_CLOCK, visible_item_ids_by_issue)
    const items_by_id_by_issue = getAutoClocks(state, visible_item_ids_by_issue)
    const filter_by_issue = getListFilter(state, list_key)
    const most_recent_entry_by_issue = (items_by_id_by_issue && items_by_id_by_issue.length > 0 && items_by_id_by_issue[0]) || null
    const recent_entries_by_issue = items_by_id_by_issue
    
    const logged_in_user_id = logged_in_user().user_id || -1
    const auto_clocking_enabled = isAutoClockingEnabled(state)

    return {
        available_project_id,
        available_sprint_id,
        available_issue_id,
        auto_clock_ids: visible_item_ids,
        auto_clock_ids_by_issue: visible_item_ids_by_issue,
        auto_clocks_by_id: items_by_id,
        auto_clocks_by_id_by_issue: items_by_id_by_issue,
        is_loading,
        is_loading_by_issue,
        is_invalidated,
        is_invalidated_by_issue,
        should_fetch_list,
        should_fetch_list_by_issue,
        last_updated,
        last_updated_by_issue,
        nested_objects,
        nested_objects_by_issue,
        filter,
        filter_by_issue,
        logged_in_user_id,
        most_recent_entry,
        most_recent_entry_by_issue,
        recent_entries,
        recent_entries_by_issue,
        list_key,
        list_key_by_issue,
        auto_clocking_enabled
    }

}

export default connect(mapStateToProps)(AutoClockPopup)
