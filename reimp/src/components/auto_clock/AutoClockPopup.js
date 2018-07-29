import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import ModalDialog from '../ModalDialog'
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
import AutoClockNewEntryForm from './AutoClockNewEntryForm'
import AutoClockEntry from './AutoClockEntry'
import AutoClockEntity from './AutoClockEntity'
import { ENTITY_KEY__AUTO_CLOCK, LIST_KEY__RECENT_AUTO_CLOCK } from '../../actions/ItemListKeyRegistry'
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
    update_list_filter,
    getListFilter
} from '../../actions/ItemList'
import PopupPanelButton from '../PopupPanelButton'
import PopupPanelHeading from '../PopupPanelHeading'
import PopupPanelText from '../PopupPanelText'


class AutoClockPopup extends Component {
    constructor(props) {
        super(props)
        this.onClockIn = this.onClockIn.bind(this)
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
        const { dispatch, list_key } = this.props
        dispatch(initList(list_key))
        dispatch(update_list_ordering(list_key, { 'start_time': 'desc' }))
        dispatch(update_list_pagination(list_key, { page_size: 1 }))
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, filter, logged_in_user_id, list_key, nested_objects } = props
        if ( filter.user_id !== logged_in_user_id ) {
            dispatch(update_list_filter(list_key, {user_id:logged_in_user_id}))
        }
        dispatch(fetchAutoClocksIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    onHidePopup() {
        this.setState({show_popup:false})
        hideAutoClockPopup()
    }

    onShowPopup() {
        this.setState({show_popup:true})
        showAutoClockPopup()
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

    renderClockToggle() {
        const { most_recent_entry} = this.props
        return (
            <div className="auto-clock__button"
                 onClick={this.onShowPopup}>
              { most_recent_entry && most_recent_entry.is_active &&
                <div className="icon--timer-active auto-clock__stop"
                     onClick={() => this.onClockOut(most_recent_entry.id)}
                />
              }
              { (! most_recent_entry || ! most_recent_entry.is_active) &&
                <div className="icon--timer-inactive"/>
              }
            </div>
        )
        
    }

    renderCurrentClock() {

        const { most_recent_entry} = this.props

        return (
            <div>
              <PopupPanelHeading>
                Current clock
              </PopupPanelHeading>

              { ! most_recent_entry.is_active &&
                <PopupPanelText>
                  No active clock
                </PopupPanelText>
              }
                
              { most_recent_entry.is_active &&
                <div>
                  <PopupPanelText>
                    <AutoClockEntry entry_id={most_recent_entry.id}/>
                  </PopupPanelText>
                  <PopupPanelButton onClick={() => this.onClockOut(most_recent_entry.id)}>
                    Stop
                  </PopupPanelButton>
                </div>
              }
            </div>
        )
    }

    renderAvailableClock() {
        const { available_project_id,
                available_sprint_id, available_issue_id,
                auto_clocking_enabled } = this.props
        
        return (
            <div>
              <PopupPanelHeading>
                Clock In
              </PopupPanelHeading>
              { ! available_project_id &&
                <PopupPanelText>
                  <div>
                    Select a project, sprint or issue to start clocking
                  </div>
                </PopupPanelText>
              }
              { available_project_id &&
                <div>
                  <AutoClockNewEntryForm project_id={available_project_id}
                                         sprint_id={available_sprint_id}
                                           issue_id={available_issue_id}
                                           onSubmitted={this.onClockIn} />
                </div>
              }
                  
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
                    
            </div>
        )
    }

    renderPanel() {
        return (
            <ModalDialog isOpen={true}
                         onClose={this.onHidePopup}
                         variant="large"
                         title="Clock in / Clock out">

              { this.renderCurrentClock() }
              { this.renderAvailableClock() }

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
    const logged_in_user_id = logged_in_user().user_id || -1
    const most_recent_entry = (items_by_id && items_by_id.length > 0 && items_by_id[0]) || null
    const auto_clocking_enabled = isAutoClockingEnabled(state)

    return {
        available_project_id,
        available_sprint_id,
        available_issue_id,
        auto_clock_ids: visible_item_ids,
        auto_clocks_by_id: items_by_id,
        is_loading,
        is_invalidated,
        should_fetch_list,
        last_updated,
        nested_objects,
        filter,
        logged_in_user_id,
        most_recent_entry,
        list_key,
        auto_clocking_enabled
    }

}

export default connect(mapStateToProps)(AutoClockPopup)
