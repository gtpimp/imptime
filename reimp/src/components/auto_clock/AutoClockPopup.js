import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import classNames from 'classnames'
import '../../sass/auto-clock.scss'
import { getAvailableAutoClockEntity, clockIn, clockOut, shouldShowAutoClockPopup, hideAutoClockPopup, showAutoClockPopup } from '../../actions/AutoClock'
import AutoClockNewEntryForm from './AutoClockNewEntryForm'
import AutoClockList from './AutoClockList'
import EditableAutoClockEntry from './EditableAutoClockEntry'
import { ENTITY_KEY__AUTO_CLOCK, LIST_KEY__RECENT_AUTO_CLOCK } from '../../actions/ItemListKeyRegistry'
import { isLoadingItems, areAnyItemsInvalidated } from '../../actions/Item'
import { logged_in_user } from '../../actions/Auth'
import {
    fetchAutoClocksIfNeeded, getAutoClocks, setPreferredRole
} from '../../actions/AutoClock'
import {
    initList,
    invalidateList,
    selectItems,
    collapse_list,
    expand_list,
    shouldFetchList,
    getVisibleItemIds,
    getVisibleItems,
    getNestedObjects,
    ensureNestedObjectsLoaded,
    isLoading,
    getLastUpdated,
    getLoadingItemIds,
    getSelectedItemIds,
    getSelectedItems,
    getDisplayMode,
    update_list_pagination,
    update_list_ordering,
    update_list_format,
    update_list_filter,
    getListFilter
} from '../../actions/ItemList'


class AutoClockPopup extends Component {
    constructor(props) {
        super(props)
        this.onClockIn = this.onClockIn.bind(this)
        this.onClockOut = this.onClockOut.bind(this)
        this.hideList = this.hideList.bind(this)
        this.showList = this.showList.bind(this)
        this.onShowPopup = this.onShowPopup.bind(this)
        this.onHidePopup = this.onHidePopup.bind(this)
        this.state = { show_list: false,
                       show_popup: shouldShowAutoClockPopup() }
    }

    componentDidMount() {
	const { dispatch, list_key, filter } = this.props
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
        if ( filter.user_id != logged_in_user_id ) {
            dispatch(update_list_filter(list_key, {user_id:logged_in_user_id}))
        }
        dispatch(fetchAutoClocksIfNeeded(list_key))
        dispatch(ensureNestedObjectsLoaded(nested_objects))
    }

    onHidePopup() {
        console.log("DEBUG!!!!!!!!!!")
        return
        this.setState({show_popup:false})
        hideAutoClockPopup()
    }

    onShowPopup() {
        this.setState({show_popup:true})
        showAutoClockPopup()
    }

    onClockIn(new_values) {
        const { dispatch } = this.props
        dispatch(clockIn(new_values.project_id,
                         new_values.sprint_id,
                         new_values.issue_id,
                         new_values.role,
                         new_values.description))
        setPreferredRole(new_values.role)
    }

    onClockOut(entry_id) {
        const { dispatch } = this.props
        dispatch(clockOut(entry_id))
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
            <div className="auto-clock__show"
                 onClick={this.onShowPopup}
                 onMouseOver={this.onShowPopup} >
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
            <div className="auto-clock__current" >

              { most_recent_entry &&
                <div className="auto-clock__most_recent">
                  { most_recent_entry.is_active &&
                    <div className="icon--timer-stop" onClick={() => this.onClockOut(most_recent_entry.id)} />
                  }
                    <EditableAutoClockEntry entry_id={most_recent_entry.id}/>
                </div>
              }

            </div>
        )
    }

    renderAvailableClock() {
        const { available_project, available_project_id,
                available_sprint_id, available_issue_id } = this.props
        
        return (
            <div className="auto-clock__next">
              { ! available_project_id &&
                <div>Select a project to start clocking</div>
              }

                { available_project_id &&
                  <AutoClockNewEntryForm project_id={available_project_id}
                                         sprint_id={available_sprint_id}
                                         issue_id={available_issue_id}
                                         onSubmitted={this.onClockIn} />
                }
            </div>
        )
    }

    renderClockHistory() {
        const { show_list } = this.state

        if ( ! show_list ) {
            return (
                <div className="icon--expand auto-clock__expand_history" onClick={this.showList}/>
            )
        }
        
        return (
            <div className="auto-clock__history">
              <div className="icon--collapse auto-clock__collapse_history" onClick={this.hideList}/>
              <AutoClockList list_key={ENTITY_KEY__AUTO_CLOCK} />
            </div>
        )
    }

    render() {
        const { show_popup } = this.state

          return (

            <div className="auto-clock" onMouseLeave={this.onHidePopup}>

              { this.renderClockToggle() }
              
              { show_popup &&
                <div className="auto-clock--visible" >
                  { this.renderCurrentClock() }
                  { this.renderAvailableClock() }
                  { this.renderClockHistory() }
                </div>
              }

            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {  } = props
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
        list_key
    }

}

export default connect(mapStateToProps)(AutoClockPopup)
