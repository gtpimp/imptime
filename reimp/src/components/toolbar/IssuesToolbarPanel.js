import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'
import '../../sass/icon.css'
import {
    startCandidateIssue,
    ensureIssuesLoaded,
    getIssue,
    getIssues
} from '../../actions/Issues'
import {
    PAGE_KEY__ISSUES_PAGE
} from '../../actions/ItemListKeyRegistry'
import {
    get_selected_issue_ids,
    get_selected_sprint_ids
} from '../../actions/Page'
import { ensureSprintsLoaded, getSprint } from '../../actions/Sprints'
import {getVisibleItemIds, setItemFlag} from '../../actions/ItemList'
import forEach from 'lodash/forEach'

class IssuesToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onNewIssueClick = this.onNewIssueClick.bind(this)
        this.onCollapseAllFeaturesClick = this.onCollapseAllFeaturesClick.bind(this)
        this.onExpandAllFeaturesClick = this.onExpandAllFeaturesClick.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps() {
        this.refresh()
    }

    refresh() {
        const {dispatch, issue_ids, sprint_id} = this.props
        dispatch(ensureIssuesLoaded(issue_ids))
        dispatch(ensureSprintsLoaded([sprint_id]))
    }

    onNewIssueClick() {
        const { dispatch, last_selected_issue_id, sprint_id, selected_issue_ids } = this.props
        dispatch(startCandidateIssue(sprint_id, last_selected_issue_id, selected_issue_ids))
    }

    getParents() {
        const { issues } = this.props
        const parent_issue_ids = []

        forEach(issues, function(issue) {
            if((issue.parent_group_id === null) && (issue.group_children.length !== 0)) {
                parent_issue_ids.push(issue.id)
            }
        })
        return parent_issue_ids
    }

    onCollapseAllFeaturesClick() {
        const { dispatch } = this.props
        const parents = this.getParents()
        dispatch(setItemFlag('issues', parents, 'expanded_issues', false))
    }

    onExpandAllFeaturesClick() {
        const { dispatch } = this.props
        const parents = this.getParents()
        dispatch(setItemFlag('issues', parents, 'expanded_issues', true))
    }
    
    render() {
        return (
            <div className="toolbar-panel">
              <div className="button toolbar-button--small button--large button--default"
                   onClick={this.onExpandAllFeaturesClick} title="Expand All">Expand all
              </div>
              <div className="button toolbar-button--small button--large button--default"
                   onClick={this.onCollapseAllFeaturesClick} title="Collapse All">Collapse all
              </div>
              
              <div className="button toolbar-button--small button--large button--primary" onClick={this.onNewIssueClick}>+ New Issue</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const selected_issue_ids = get_selected_issue_ids(state, PAGE_KEY__ISSUES_PAGE)
    const issue = (selected_issue_ids && selected_issue_ids.length > 0 && getIssue(state, selected_issue_ids[selected_issue_ids.length-1])) || {}
    const selected_sprint_ids = get_selected_sprint_ids(state, PAGE_KEY__ISSUES_PAGE)
    const sprint = (selected_sprint_ids && selected_sprint_ids.length > 0 && getSprint(state, selected_sprint_ids[selected_sprint_ids.length-1])) || {}
    const visible_item_ids = getVisibleItemIds(state, 'issues')
    const issues = getIssues(state, visible_item_ids)

    return {
        issue_ids: selected_issue_ids,
        selected_issue_ids,
        last_selected_issue_id: issue.id,
        sprint_id: sprint.id || null,
        project_id: sprint.project_id,
        visible_item_ids,
        issues: issues
    }
}

export default connect(mapStateToProps)(IssuesToolbarPanel)
