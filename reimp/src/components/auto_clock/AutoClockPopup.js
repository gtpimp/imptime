import React, {Component} from 'react'
import { map, slice, size } from 'lodash'
import moment from 'moment'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {css} from 'emotion'
import ModalDialog from '../ModalDialog'
import SprintName from '../SprintName'
import Timestamp from '../Timestamp'
import Hours from '../Hours'
import ProjectName from '../ProjectName'
import Floater from 'react-floater'
import '../../sass/auto-clock.scss'
import { setNotificationMessage } from '../../actions/Error'
import { getAvailableAutoClockEntity,
         clockIn,
         clockOut,
         hideAutoClockPopup,
         showAutoClockPopup,
         isAutoClockingEnabled,
         enableAutoClocking,
         disableAutoClocking,
         createHistoricClockEntry
} from '../../actions/AutoClock'
import {default_theme as theme} from '../../theme/default'
import { ENTITY_KEY__AUTO_CLOCK,
         LIST_KEY__RECENT_AUTO_CLOCK,
         LIST_KEY__RECENT_AUTO_CLOCK_BY_ISSUE,
         LIST_KEY__RECENT_AUTO_CLOCK_UNALLOCATED
} from '../../actions/ItemListKeyRegistry'
import { isLoadingItems, areAnyItemsInvalidated } from '../../actions/Item'
import { logged_in_user } from '../../actions/Auth'
import ToggleButton from '../toolbar/ToggleButton'
import {
    fetchAutoClocksIfNeeded, getAutoClocks
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
    getListFilter,
    getListPagination
} from '../../actions/ItemList'
import AutoClockQuickEntryForm from './AutoClockQuickEntryForm'
import AutoClockManagementEntryForm from './AutoClockManagementEntryForm'
import AutoClockInlineIssue from './AutoClockInlineIssue'
import AutoClockNewEntryForm from './AutoClockNewEntryForm'
import PopupPanelButton from '../PopupPanelButton'
import PopupPanelMiniButton from '../PopupPanelMiniButton'
import PopupPanelText from '../PopupPanelText'
import PopupPanelHeading from '../PopupPanelHeading'
import PopupPanelSeparator from '../PopupPanelSeparator'
import BreadcrumbCell from '../BreadcrumbCell'
import BreadcrumbSeparator from '../BreadcrumbSeparator'
import IssueProgress from '../IssueProgress'

class AutoClockPopup extends Component {
    constructor(props) {
        super(props)
        this.onClockInIssue = this.onClockInIssue.bind(this)
        this.onClockOut = this.onClockOut.bind(this)
        this.onShowPopup = this.onShowPopup.bind(this)
        this.onHidePopup = this.onHidePopup.bind(this)
        this.onAutoClockingEnabledToggleClick = this.onAutoClockingEnabledToggleClick.bind(this)
        this.startManagementClock = this.startManagementClock.bind(this)
        this.startQuickClock = this.startQuickClock.bind(this)
        this.showQuickClock = this.showQuickClock.bind(this)
        this.hideQuickClock = this.hideQuickClock.bind(this)
        this.startQuickClock = this.startQuickClock.bind(this)
        this.onStartCreatingHistoricEntry = this.onStartCreatingHistoricEntry.bind(this)
        this.onStopCreatingHistoricEntry = this.onStopCreatingHistoricEntry.bind(this)
        this.onCreateHistoricEntry = this.onCreateHistoricEntry.bind(this)
        this.state = { show_popup: false,
                       show_quick_clock: false,
                       show_create_historic_entry: false}
    }

    componentDidMount() {
        const { dispatch, list_key, list_key_by_issue, list_key_unallocated } = this.props
        dispatch(initList(list_key))
        dispatch(update_list_ordering(list_key, { 'end_time': 'desc' }))
        dispatch(update_list_pagination(list_key, { page_size: 1 }))

        dispatch(initList(list_key_by_issue))
        dispatch(update_list_ordering(list_key_by_issue, { 'end_time': 'desc' }))
        dispatch(update_list_format(list_key_by_issue, { 'distinct_by_issue': true }))
        dispatch(update_list_filter(list_key_by_issue, { 'is_active': false }))
        dispatch(update_list_pagination(list_key_by_issue, { page_size: 6 }))

        dispatch(initList(list_key_unallocated))
        dispatch(update_list_ordering(list_key_unallocated, { 'end_time': 'desc' }))
        dispatch(update_list_filter(list_key_unallocated, { 'is_unallocated': true }))
        dispatch(update_list_pagination(list_key_unallocated, { page_size: 6 }))

        
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, filter, filter_by_issue, filter_unallocated,
                logged_in_user_id,
                list_key, nested_objects,
                list_key_by_issue, nested_objects_by_issue,
                list_key_unallocated, nested_objects_unallocated } = props
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

        if ( filter_unallocated.user_id !== logged_in_user_id ) {
            dispatch(update_list_filter(list_key_unallocated, {user_id:logged_in_user_id}))
        }
        dispatch(fetchAutoClocksIfNeeded(list_key_unallocated))
        dispatch(ensureNestedObjectsLoaded(nested_objects_unallocated))
        
    }

    showQuickClock() {
        this.setState({show_quick_clock:true})
    }

    hideQuickClock() {
        this.setState({show_quick_clock:false})
    }

    startQuickClock(values) {
        const { dispatch } = this.props
        dispatch(clockIn({description:values.description}))
        this.hideQuickClock()
        this.onHidePopup()
    }

    startManagementClock(values) {
        const { dispatch, available_project_id, available_sprint_id } = this.props
        dispatch(clockIn({project_id: available_project_id,
                          sprint_id: available_sprint_id,
                          action: values.action,
                          description:values.description}))
        this.hideQuickClock()
        this.onHidePopup()
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
        this.onHidePopup()
    }

    onClockOut(entry_id) {
        const { dispatch } = this.props
        dispatch(clockOut(entry_id))
        dispatch(disableAutoClocking())
        this.onHidePopup()
    }

    onAutoClockingEnabledToggleClick(new_value) {
        const { dispatch } = this.props
        if ( new_value ) {
            dispatch(enableAutoClocking())
        } else {
            dispatch(disableAutoClocking())
        }
    }

    onStartCreatingHistoricEntry(evt) {
        if ( evt ) {
            evt.preventDefault()
        } 
        this.setState({show_create_historic_entry:true})
    }

    onStopCreatingHistoricEntry(evt) {
        if ( evt ) {
            evt.preventDefault()
        }
        this.setState({show_create_historic_entry:false})
    }

    onCreateHistoricEntry(new_values) {
        const { dispatch, available_issue_id } = this.props

        const d = new_values
        d.issue_id = available_issue_id

        const on_done = function() {
            dispatch(setNotificationMessage("Historic entry created"))
        }
        dispatch(createHistoricClockEntry(d, on_done))
        this.onStopCreatingHistoricEntry()
    }
    
    renderEntryWithTimings(entry) {
        return (
            <div className={css`display:flex; justify-content:space-between; width:80%`}>
              {this.renderEntryInline(entry)}
              {this.renderTimings(entry)}
            </div>
        )
    }

    renderEntryInline(entry) {
        if ( entry.issue_id ) {
            return this.renderIssueInline(entry.project_id, entry.sprint_id, entry.issue_id)
        } else {
            return (
                <div className={css`display:flex`}>
                    <BreadcrumbCell>
                      {entry.comments || "Unallocated"}
                    </BreadcrumbCell>
                </div>
            )
        }
    }

    getEntryHours(entry) {
        if ( entry.is_active ) {
            return moment().diff(moment(entry.start_time),'hours', true)
        } else {
            return entry.hours
        }
    }
    
    renderTimings(entry) {

        const hours = this.getEntryHours(entry)
        
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
        return <AutoClockInlineIssue project_id={project_id}
                                     sprint_id={sprint_id}
                                     issue_id={issue_id} />
    }

    renderUnallocatedAlert() {
        const { pagination_unallocated } = this.props
        const num_unallocated = pagination_unallocated && pagination_unallocated.num_items
        if ( num_unallocated === 0 ) {
            return null
        }
        return (
            <div className={css`color:${theme.colours.notok};
                                font-size:${theme.colours.superscript}`}
                 onClick={this.openUnallocatedIssues}
            >
              <Floater title="Unallocated issues"
                       disableHoverToClick
                       event="hover"
                       eventDelay={0}
                       placement="right"
                       content={<div>You have {num_unallocated} unallocated clock entries. These need to be assigned to an issue as soon as possible. Click to open and fix them.</div>}>
                <Link to='/clock/history/unallocated'
                      onClick={(evt) => evt.stopPropagation()}>
                  {num_unallocated}
                </Link>
              </Floater>
            </div>
        )
    }

    renderProgress(entry) {
        if ( ! entry.issue_id ) {
            return null
        }
        const hours = this.getEntryHours(entry)
        return (
            <div className={css`width:75px;height:100%;`}>
              <IssueProgress issue_id={entry.issue_id} running_actual_increment={hours} enable_live_timer={true}  />
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
                  { this.renderUnallocatedAlert() }
                  <div className={css`font-size:${theme.font_sizes.auto_clock_status}`}>
                    <BreadcrumbSeparator/>
                  </div>
                  <div className={css`font-size:${theme.font_sizes.auto_clock_status};display:flex;`}>
                    { this.renderEntryInline(most_recent_entry) }
                    <div className={css`margin-left:${theme.spacing.horizontal_space_inline}`}>
                      { this.renderProgress(most_recent_entry) }
                    </div>
                  </div>
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

              <PopupPanelSeparator strong={true} />
              
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

    renderCreateHistoricEntryPanel() {
        return (
            <AutoClockNewEntryForm onCancel={this.onStopCreatingHistoricEntry}
                                   onSubmitted={this.onCreateHistoricEntry}/>
        )
    }

    renderQuickClockPanel() {
        const { available_project_id,
                available_sprint_id } = this.props
        
        return (

            <div>

              <div>
                <PopupPanelHeading>
                  Unallocated clocking
                </PopupPanelHeading>
                <PopupPanelText>
                  Start clocking now, you will later need to resolve which issue this time belongs to.
                </PopupPanelText>
                <AutoClockQuickEntryForm onSubmitted={this.startQuickClock} />
                <PopupPanelSeparator strong={true} />
              </div>

              { available_project_id && available_sprint_id && 
                <div>
                  <PopupPanelHeading>
                    <div className={css`display:flex; justify-content:flex-start`}>
                      Quick clock for
                      &nbsp;
                      <ProjectName project_id={available_project_id} />
                      -
                      <SprintName sprint_id={available_sprint_id} />
                    </div>
                  </PopupPanelHeading>
                  <AutoClockManagementEntryForm onSubmitted={this.startManagementClock} />
                  <PopupPanelSeparator strong={true} />
                </div>
              }
              
              <PopupPanelMiniButton onClick={this.hideQuickClock}>
                Cancel
              </PopupPanelMiniButton>
            </div>
            
        )
    }

    renderPanel() {
        const { show_quick_clock, show_create_historic_entry } = this.state
        return (
            <ModalDialog isOpen={true}
                         onClose={this.onHidePopup}
                         variant="large"
                         title="Clocker">


              { ! show_quick_clock && ! show_create_historic_entry && 
                <div>
                  { this.renderCurrentClock() }
                  { this.renderAvailableClock() }
                  { this.renderPreviousClocks() }
                  <PopupPanelButton onClick={this.showQuickClock}>
                    <Floater
                        description="Clock quickly"
                        disableHoverToClick
                        event="hover"
                        eventDelay={0}
                        placement="bottom"
                        content={<div>A fast way to start clocking something new that you're about to start doing.</div>}
                    >
                      Start quick clock
                    </Floater>
                  </PopupPanelButton>
                  <div className={css`width:100%;padding-top:${theme.spacing.vertical_section_gap}`}>
                    <Link to='/clock/history/'
                          onClick={(evt) => { evt.stopPropagation(); this.onHidePopup() }}>
                      Clock history
                    </Link>

                    <Floater
                        description="Create historic entry"
                        disableHoverToClick
                        event="hover"
                        eventDelay={0}
                        placement="bottom"
                        content={<div>Create an entry for an event that's already finished.</div>}
                    >
                      <PopupPanelMiniButton onClick={this.onStartCreatingHistoricEntry}>Add old entry</PopupPanelMiniButton>
                    </Floater>
                    
                  </div>
                </div>
              }

              { show_quick_clock && this.renderQuickClockPanel() }

              { show_create_historic_entry && this.renderCreateHistoricEntryPanel() }
              
            </ModalDialog>
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
    const list_key_unallocated = LIST_KEY__RECENT_AUTO_CLOCK_UNALLOCATED

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
    const filter_by_issue = getListFilter(state, list_key_by_issue)
    const most_recent_entry_by_issue = (items_by_id_by_issue && items_by_id_by_issue.length > 0 && items_by_id_by_issue[0]) || null
    const recent_entries_by_issue = items_by_id_by_issue

    const visible_item_ids_unallocated = getVisibleItemIds(state, list_key_unallocated)
    const is_loading_unallocated = isLoading(state, list_key_unallocated) || isLoadingItems(state, ENTITY_KEY__AUTO_CLOCK, visible_item_ids_unallocated)
    const last_updated_unallocated = getLastUpdated(state, list_key_unallocated)
    const nested_objects_unallocated = getNestedObjects(state, list_key_unallocated)
    const should_fetch_list_unallocated = shouldFetchList(state, list_key_unallocated)
    const is_invalidated_unallocated = areAnyItemsInvalidated(state, ENTITY_KEY__AUTO_CLOCK, visible_item_ids_unallocated)
    const items_by_id_unallocated = getAutoClocks(state, visible_item_ids_unallocated)
    const filter_unallocated = getListFilter(state, list_key_unallocated)
    const most_recent_entry_unallocated = (items_by_id_unallocated && items_by_id_unallocated.length > 0 && items_by_id_unallocated[0]) || null
    const recent_entries_unallocated = items_by_id_unallocated
    const pagination_unallocated = getListPagination(state, list_key_unallocated)
    
    const logged_in_user_id = logged_in_user().user_id || -1
    const auto_clocking_enabled = isAutoClockingEnabled(state)

    return {
        available_project_id,
        available_sprint_id,
        available_issue_id,
        auto_clock_ids: visible_item_ids,
        auto_clock_ids_by_issue: visible_item_ids_by_issue,
        auto_clock_ids_unallocated: visible_item_ids_unallocated,
        auto_clocks_by_id: items_by_id,
        auto_clocks_by_id_by_issue: items_by_id_by_issue,
        auto_clocks_by_id_unallocated: items_by_id_unallocated,
        is_loading,
        is_loading_by_issue,
        is_loading_unallocated,
        is_invalidated,
        is_invalidated_by_issue,
        is_invalidated_unallocated,
        should_fetch_list,
        should_fetch_list_by_issue,
        should_fetch_list_unallocated,
        last_updated,
        last_updated_by_issue,
        last_updated_unallocated,
        nested_objects,
        nested_objects_by_issue,
        nested_objects_unallocated,
        filter,
        filter_by_issue,
        filter_unallocated,
        logged_in_user_id,
        most_recent_entry,
        most_recent_entry_by_issue,
        most_recent_entry_unallocated,
        recent_entries,
        recent_entries_by_issue,
        recent_entries_unallocated,
        list_key,
        list_key_by_issue,
        list_key_unallocated,
        auto_clocking_enabled,
        pagination_unallocated
    }

}

export default connect(mapStateToProps)(AutoClockPopup)
