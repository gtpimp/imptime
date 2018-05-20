import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import SplitPane from 'react-split-pane'
import {
    LIST_KEY__SCHEDULE_ITEM_LIST,
    PAGE_KEY__SCHEDULE_ITEM_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    getPageFlag,
    setPageFlag
} from '../actions/Page'
import {
    initList,
    getVisibleItemIds,
    update_list_filter
} from '../actions/ItemList'
import {getSchedule, ensureSchedulesLoaded} from '../actions/Schedules'
import {getScheduleItems, ensureScheduleItemsLoaded} from '../actions/ScheduleItems'

class ScheduleItemPage extends Component {

    constructor(props) {
        super(props)
        this.onChangeSplitterSize = this.onChangeSplitterSize.bind(this)
    }

    componentDidMount() {
        const {schedule_id, visible_item_ids, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__SCHEDULE_ITEM_PAGE, ['schedule_item', 'schedule_item']))
        dispatch(initList(LIST_KEY__SCHEDULE_ITEM_LIST))
        dispatch(update_list_filter(LIST_KEY__SCHEDULE_ITEM_LIST, {schedule_id:schedule_id || -1}))
        dispatch(ensureSchedulesLoaded([schedule_id]))
        dispatch(ensureScheduleItemsLoaded([visible_item_ids]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = new_props
        if ( new_props.schedule && new_props.schedule.id !== this.props.schedule.id ) {
            dispatch(update_list_filter(LIST_KEY__SCHEDULE_ITEM_LIST, {schedule_id:new_props.schedule.id || -1}))
            dispatch(ensureSchedulesLoaded([new_props.schedule_id]))
            dispatch(ensureScheduleItemsLoaded([new_props.visible_item_ids]))
        }
    }

    onChangeSplitterSize(size) {
        const { dispatch } = this.props
        dispatch(setPageFlag(PAGE_KEY__SCHEDULE_ITEM_PAGE, 'splitter_size', size))
    }

    renderLeftPane() {
        return ( <div>left</div> )
    }

    renderRightPane() {
        return ( <div>right</div> )
    }

    render() {

        const { splitter_size } = this.props

        return (
            <div className="list-layout">
                <SplitPane split="vertical" minSize={50}
                           defaultSize={splitter_size}
                           onChange={this.onChangeSplitterSize}
                >
                  <div className="left">
                    {this.renderLeftPane()}
                  </div>
                  <div className="right">
                    {this.renderRightPane()}
                  </div>
                </SplitPane>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { list_key, schedule_id } = props
    const schedule = getSchedule(state, schedule_id)
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const schedule_items_by_id = getScheduleItems(state, visible_item_ids)
    const splitter_size = getPageFlag(state, PAGE_KEY__SCHEDULE_ITEM_PAGE, 'splitter_size', "80%")

    return {
        schedule_id,
        schedule,
        visible_item_ids,
        schedule_items_by_id,
        splitter_size
    }
}

export default withRouter(connect(mapStateToProps)(ScheduleItemPage))
