import '../../sass/toolbar-panel.css'
import React, {Component} from 'react'
import { connect } from 'react-redux'
import { recalculateSchedules } from '../../actions/Schedules'
import ToggleButton from './ToggleButton'
import {LIST_KEY__SCHEDULE_LIST} from '../../actions/ItemListKeyRegistry'
import { update_list_ordering, get_list_ordering, invalidateList } from '../../actions/ItemList'

class ScheduleToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onRecalculateClicked = this.onRecalculateClicked.bind(this)
        this.onToggleOrdering = this.onToggleOrdering.bind(this)
    }

    onRecalculateClicked() {
        const { dispatch } = this.props
        dispatch(recalculateSchedules())
    }

    onToggleOrdering(ordering_old_first) {
        const { dispatch } = this.props
        const direction = (ordering_old_first && "asc") || "desc"
        dispatch(update_list_ordering(LIST_KEY__SCHEDULE_LIST, { 'due_date': direction }))
        dispatch(invalidateList(LIST_KEY__SCHEDULE_LIST))
    }

    render() {
        const { ordering_old_first } = this.props
        return (
            <div className="toolbar-panel">
              <ToggleButton value={ordering_old_first}
                            onChange={this.onToggleOrdering}
                            on_label={"New"}
                            off_label={"Old"}
              />
              <div className="button toolbar-button--small button--large button--primary"
                             onClick={this.onRecalculateClicked}>Recalculate</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const ordering = get_list_ordering(state, LIST_KEY__SCHEDULE_LIST)
    const ordering_old_first = ordering.due_date === "asc"
    
    return {
        ordering_old_first
    }
}


export default connect(mapStateToProps)(ScheduleToolbarPanel)
