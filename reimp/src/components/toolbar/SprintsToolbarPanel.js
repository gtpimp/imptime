import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, concat } from 'lodash'
import Select from 'react-select';
import '../../sass/toolbar-panel.css'
import {
    PAGE_KEY__SPRINTS_PAGE,
    LIST_KEY__SPRINT_LIST
} from '../../actions/ItemListKeyRegistry'
import {
    getListFilter,
    update_list_filter,
    clear_list_filter_option,
    invalidateList
} from '../../actions/ItemList'
import { ensureSprintsLoaded, getSprint } from '../../actions/Sprints'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import {
    getPageSelectedEntities
} from '../../actions/Page'
import ToggleButton from './ToggleButton'

class SprintsToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onSprintShowClosedToggleButtonClick = this.onSprintShowClosedToggleButtonClick.bind(this)
        this.onChangeFilterSprintType = this.onChangeFilterSprintType.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps() {
        this.refresh()
    }

    refresh() {
        const {dispatch, sprint_ids, project_id} = this.props
        dispatch(ensureSprintsLoaded(sprint_ids))
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
    }

    onChangeFilterSprintType(new_value) {
        const { dispatch } = this.props
        if( new_value ) {
            if ( new_value.value === "_all_" ) {
                dispatch(clear_list_filter_option(LIST_KEY__SPRINT_LIST, 'sprint_type'))
            } else {
                dispatch(update_list_filter(LIST_KEY__SPRINT_LIST, {'sprint_type': new_value.value}))
            }
            dispatch(invalidateList(LIST_KEY__SPRINT_LIST))
        }
    }

    onSprintShowClosedToggleButtonClick(new_value) {
        const { dispatch } = this.props
        const open_only = new_value
        if ( open_only ) {
            dispatch(update_list_filter(LIST_KEY__SPRINT_LIST, {'sprint_status': 'open'}))
        } else {
            dispatch(clear_list_filter_option(LIST_KEY__SPRINT_LIST, 'sprint_status'))
        }
        dispatch(invalidateList(LIST_KEY__SPRINT_LIST))
    }

    render() {

        const { selected_sprint_type_filter,
                sprint_type_filter_options, selected_sprint_status_filter } = this.props

        return (
            <div className="toolbar-panel">
              <ToggleButton value={selected_sprint_status_filter==='open'}
                            onChange={this.onSprintShowClosedToggleButtonClick}
                            on_label={"Open only"}
                            off_label={"All"}
              />
              <div className="sprints-toolbar-panel__sprint_type_filter big-select">
                <Select value={selected_sprint_type_filter}
                        name='sprint_type'
                        options={sprint_type_filter_options}
                        onChange={this.onChangeFilterSprintType}
                />
              </div>

            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const selected_sprint_ids = getPageSelectedEntities(state, PAGE_KEY__SPRINTS_PAGE).sprint_ids
    const sprint = (selected_sprint_ids && selected_sprint_ids.length > 0 && getSprint(state, selected_sprint_ids[0])) || {}
    const selected_project_ids = getPageSelectedEntities(state, PAGE_KEY__SPRINTS_PAGE).project_ids
    const project = (selected_project_ids && selected_project_ids.length > 0 && getProject(state, selected_project_ids[0])) || {}
    const selected_sprint_type_filter = (getListFilter(state, LIST_KEY__SPRINT_LIST) || {}).sprint_type || "_all_"
    const sprint_type_filter_options = concat( [{value:'_all_', label: 'all'}], map(project.allowed_sprint_type_names, (name) => ( {value: name, label: name })))
    const selected_sprint_status_filter = (getListFilter(state, LIST_KEY__SPRINT_LIST) || {}).sprint_status || null
    
    return {
        sprint_ids: selected_sprint_ids,
        sprint: sprint,
        last_selected_sprint_id: sprint.id,
        project_id: project.id,
        selected_sprint_type_filter,
        sprint_type_filter_options,
        selected_sprint_status_filter
    }
}

export default connect(mapStateToProps)(SprintsToolbarPanel)
