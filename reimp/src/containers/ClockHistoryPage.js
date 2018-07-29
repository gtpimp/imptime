import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import ClockHistoryList from '../components/ClockHistoryList'
import {setClockBreadcrumbsHelper} from '../actions/Breadcrumbs'
import {
    LIST_KEY__CLOCK_HISTORY_LIST,
    PAGE_KEY__CLOCK_HISTORY_PAGE,
    CLOCK_HISTORY_HEADER_LIST
} from '../actions/ItemListKeyRegistry'
import {
    update_list_filter,
    update_list_pagination,
} from '../actions/ItemList'
import {
    set_toolbars,
} from '../actions/Page'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {ensureClocksLoaded, getClock} from '../actions/Clocks'

class ClockHistoryPage extends Component {

    componentDidMount() {
        const {clock_id, dispatch, list_key} = this.props
        dispatch(set_toolbars(PAGE_KEY__CLOCK_HISTORY_PAGE, []))
        dispatch(update_list_filter(list_key, {clock_id: clock_id}))
        dispatch(update_list_pagination(list_key, {page_size: 50}))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, clock, sprint, project } = props
        if ( props.clock_id && (!props.clock || props.clock.id !== props.clock_id) ) {
            dispatch(ensureClocksLoaded([props.clock_id]))
        }
        if ( props.sprint_id && (!props.sprint || props.sprint.id !== props.sprint_id) ) {
            dispatch(ensureSprintsLoaded([props.sprint_id]))
        }
        if ( props.project_id && (!props.project || props.project.id !== props.project_id) ) {
            dispatch(ensureProjectsLoaded([props.project_id]))
        }
        if ( project && sprint && clock &&
             (!this.props.project || !this.props.sprint || !this.props.clock ||
               this.props.clock_id !== props.clock_id ||
               this.props.sprint_id !== props.sprint_id ||
               this.props.project_id !== props.project_id) ) {
            dispatch(setClockBreadcrumbsHelper(project, sprint, clock))
        }
    }

    render() {
        const { clock_history_header_list, list_key} = this.props
        return (
            <div className="list-layout__list">
              <ClockHistoryList list_key={list_key}
                                header_list={clock_history_header_list} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const clock_id = props.match.params.clockId
    const clock_history_header_list = CLOCK_HISTORY_HEADER_LIST
    const clock = getClock(state, clock_id)
    const sprint = clock && getSprint(state, clock.sprint_id)
    const project = clock && getProject(state, clock.project_id)
    
    return {
        clock_history_header_list,
        clock_id,
        clock,
        sprint,
        sprint_id: clock && clock.sprint_id,
        project,
        project_id: clock && clock.project_id,
        list_key: LIST_KEY__CLOCK_HISTORY_LIST,
    }
}

export default withRouter(connect(mapStateToProps)(ClockHistoryPage))
