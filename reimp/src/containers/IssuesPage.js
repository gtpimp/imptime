import React, {Component} from 'react'
import {connect} from 'react-redux'
import concat from 'lodash/concat'
import includes from 'lodash/includes'
import IssueSidebar from '../components/IssueSidebar'
import IssueList from '../components/IssueList'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    LIST_KEY__ISSUE_LIST,
    PAGE_KEY__ISSUES_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    expand_list,
    selectItems,
    update_list_filter,
    invalidateList
} from '../actions/ItemList'
// import {setActions} from '../actions/Toolbar'
import {
    set_toolbars,
    select_issues
} from '../actions/Page'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'

class IssuesPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectIssues = this.onSelectIssues.bind(this)
    }
    
    componentDidMount() {
        const {sprint_id, project_id, sprint, project, dispatch} = this.props
        dispatch(update_list_filter(LIST_KEY__ISSUE_LIST, {sprint_id:-1}))
        dispatch(set_toolbars(PAGE_KEY__ISSUES_PAGE, ['issues', 'issue']))
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, selected_issues, toolbars } = this.props
        const selected_a = new_props.selected_issues || []
        const selected_b = this.props.selected_issues || []
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))
        
        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name != this.props.sprint.name ||
             new_props.project.name != this.props.project.name) {
                this.refresh(new_props.sprint, new_props.project)
        }
    }

    refresh(sprint, project) {
        const {dispatch, selected_issues, toolbars } = this.props
        if ( sprint.id ) {
            dispatch(update_list_filter(LIST_KEY__ISSUE_LIST, {sprint_id:sprint.id}))
            dispatch(invalidateList(LIST_KEY__ISSUE_LIST))
            //dispatch(expand_list(LIST_KEY__ISSUE_LIST))
            dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                      {to: '/projects/'+project.id, label: project.name},
                                      {to: '/projects/'+project.id+'/sprints', label: 'All Sprints'},
                                      {to: '/projects/'+project.id+'/sprints/'+sprint.id, label: sprint.name},
                                      {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues', label: 'All Issues'}]))

            /* dispatch(setActions([
             *     {
             *         icon: 'toggle-as-feature',
             *         onClick: this.toggleAsFeature
             *     },
             *     {
             *         icon: 'group-together',
             *         onClick: this.groupTogether
             *     },
             *     {
             *         icon: 'ungroup-together',
             *         onClick: this.ungroupTogether
             *     },
             *     {
             *         icon: 'expand_features',
             *         onClick: this.toggleExpandFeatures
             *     },
             *     {
             *         icon: 'add_tag',
             *         onClick: this.openTagEditor
             *     },
             *     {
             *         icon: 'add',
             *         onClick: this.onStartCandidateIssue
             *     }
             * ]))*/

        }
    }

    onSelectIssues(issue_ids) {
        const { dispatch } = this.props
        dispatch(selectItems(LIST_KEY__ISSUE_LIST, issue_ids))
        dispatch(select_issues(PAGE_KEY__ISSUES_PAGE, issue_ids))
    }

    render() {

        const { sprint_id, project_id, selected_issues } = this.props

        const selected_issue = ( selected_issues && selected_issues.length > 0 && selected_issues[0] ) || null

        return (
            <div className="list-layout">
                <div className="list-layout__list">
                    <IssueList list_key={LIST_KEY__ISSUE_LIST}
                               onSelectIssues={this.onSelectIssues}
                    />
                </div>
                { sprint_id && selected_issue &&
                <div className="list-layout__sidebar">
                    <IssueSidebar issue_id={selected_issue.id} sprint_id={sprint_id} project_id={project_id}/>
                </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const {issue, item_list, page} = state
    const items_by_id = (issue && issue.items_by_id) || {}
    const l = (item_list && item_list[LIST_KEY__ISSUE_LIST]) || {}
    const selected_items = items_by_id && l.selected_ids && l.selected_ids.map( function(selected_id, index) {
	return items_by_id[selected_id] || { 'id': selected_id,
					     'loaded': false }
    })

    const sprint_id = props.params.sprintId
    const project_id = props.params.projectId
    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    
    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        selected_issues: selected_items,
        toolbars: page.toolbar_names
    }
}

export default connect(mapStateToProps)(IssuesPage)
