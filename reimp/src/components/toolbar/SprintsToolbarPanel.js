import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, concat } from 'lodash'
import Select from 'react-select';
import '../../sass/toolbar-panel.css'
import {browserHistory} from 'react-router'
import {
    PAGE_KEY__SPRINTS_PAGE,
    PAGE_KEY__SPRINTS_TOOLBAR,
    LIST_KEY__SPRINT_LIST
} from '../../actions/ItemListKeyRegistry'
import {
    getListFilter,
    update_list_filter,
    clear_list_filter_option,
    invalidateList
} from '../../actions/ItemList'
import {
    startCandidateSprint,
    get_display_all,
    set_display_all
} from '../../actions/Sprints.js'
import { ensureSprintsLoaded, getSprint } from '../../actions/Sprints'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import {
    get_selected_project_ids,
    get_selected_sprint_ids
} from '../../actions/Page'
import ToggleButton from './ToggleButton'

class SprintsToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onNewSprintClick = this.onNewSprintClick.bind(this)
        this.onDashboardClick = this.onDashboardClick.bind(this)
        this.onIssuesClick = this.onIssuesClick.bind(this)
        this.onSprintShowClosedToggleButtonClick = this.onSprintShowClosedToggleButtonClick.bind(this)
        this.onBulkCreateIssuesClick = this.onBulkCreateIssuesClick.bind(this)
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

    onNewSprintClick() {
        const { dispatch, project_id, last_selected_sprint_id, selected_sprint_type_filter } = this.props
        const default_sprint_args = {}
        if ( selected_sprint_type_filter != "_all_" ) {
            default_sprint_args.sprint_type = selected_sprint_type_filter
        }
        dispatch(startCandidateSprint(project_id, last_selected_sprint_id, default_sprint_args))
    }

    onDashboardClick() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id);
    }

    onChangeFilterSprintType(new_value) {
        const { dispatch } = this.props
        if( new_value ) {
            if ( new_value.value == "_all_" ) {
                dispatch(clear_list_filter_option(LIST_KEY__SPRINT_LIST, 'sprint_type'))
            } else {
                dispatch(update_list_filter(LIST_KEY__SPRINT_LIST, {'sprint_type': new_value.value}))
            }
            dispatch(invalidateList(LIST_KEY__SPRINT_LIST))
        }
    }

    onIssuesClick() {
        const { project_id, sprint } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+sprint.id+'/issues');
    }

    onSprintShowClosedToggleButtonClick(display_all) {
        const { dispatch } = this.props
        dispatch(set_display_all(PAGE_KEY__SPRINTS_TOOLBAR, display_all))
    }

    onBulkCreateIssuesClick() {
        const { dispatch, project_id, sprint_id } = this.props
        browserHistory.push("/projects/" + project_id + "/sprints/" + sprint_id + "/bulkCreate")
    }

    render() {

        const { sprint, display_all, selected_sprint_type_filter, sprint_type_filter_options } = this.props

        return (
            <div className="toolbar-panel">
              <ToggleButton value={display_all}
                            onChange={this.onSprintShowClosedToggleButtonClick}
                            on_label={"All"}
                            off_label={"Open"}
              />
              <div className="sprints-toolbar-panel__sprint_type_filter">
                <Select value={selected_sprint_type_filter}
                        name='sprint_type'
                        options={sprint_type_filter_options}
                        onChange={this.onChangeFilterSprintType}
                />
              </div>
              <div className="button button--large button--primary" onClick={this.onNewSprintClick}>
                + New Sprint
              </div>
              { sprint && sprint.id &&
                <div>
                  <div className="button button--large button--primary" onClick={this.onIssuesClick}>
                    Issues
                  </div>
                </div>
              }
              <div className="button toolbar-button--small button--large button--primary" onClick={this.onBulkCreateIssuesClick}>
                + Bulk Issues
              </div>
              { sprint &&
                <div>
                  <div className="button button--large button--primary" onClick={this.onDashboardClick}>
                    Dashboard
                  </div>
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const selected_sprint_ids = get_selected_sprint_ids(state, PAGE_KEY__SPRINTS_PAGE)
    const sprint = (selected_sprint_ids && selected_sprint_ids.length > 0 && getSprint(state, selected_sprint_ids[0])) || {}
    const selected_project_ids = get_selected_project_ids(state, PAGE_KEY__SPRINTS_PAGE)
    const project = (selected_project_ids && selected_project_ids.length > 0 && getProject(state, selected_project_ids[0])) || {}
    const display_all = get_display_all(state, PAGE_KEY__SPRINTS_TOOLBAR)
    const selected_sprint_type_filter = (getListFilter(state, LIST_KEY__SPRINT_LIST) || {}).sprint_type || "_all_"
    const sprint_type_filter_options = concat( [{value:'_all_', label: 'all'}], map(project.allowed_sprint_type_names, (name) => ( {value: name, label: name })))
    
    return {
        sprint_ids: selected_sprint_ids,
        sprint: sprint,
        last_selected_sprint_id: sprint.id,
        project_id: project.id,
        display_all: display_all,
        selected_sprint_type_filter,
        sprint_type_filter_options
    }
}

export default connect(mapStateToProps)(SprintsToolbarPanel)
