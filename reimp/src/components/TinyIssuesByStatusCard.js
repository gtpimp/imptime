import React, {Component} from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { countBy, map } from 'lodash'
import TinyCard from './TinyCard'
import TinyCardRow from './TinyCardRow'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { ensureSprintsLoaded, getSprint } from '../actions/Sprints'
import { fetchIssuesIfNeeded } from '../actions/Issues'
import { setCardBreadcrumbsHelper } from '../actions/Breadcrumbs'
import { makeSelIssues } from '../selectors/IssueListSelectors'
import { update_list_filter } from '../actions/ItemList'

class TinyIssuesByStatusCard extends Component {

    componentDidMount() {
        const {sprint_id, sprint, project_id, project, dispatch, list_key} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(update_list_filter(list_key, {sprint_id: sprint_id}))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { sprint_id, project_id, dispatch, list_key } = new_props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(fetchIssuesIfNeeded(list_key))
        if (new_props.sprint.id !== this.props.sprint.id ||
            new_props.sprint.name !== this.props.sprint.name ||
            new_props.project.name !== this.props.project.name) {
            this.refresh(new_props.sprint, new_props.project)
        }
    }

    refresh(sprint, project) {
        const { dispatch } = this.props
        if (project && sprint) {
            const card = {id: 'issues_by_status',
                          name: 'Issues By Status'}
            dispatch(setCardBreadcrumbsHelper(project, sprint, card))
        }
    }

    render() {
        const { sprint_name, project_name, count_issues_by_status } = this.props
        return (
            <TinyCard title="Issues By Status" project_name={project_name} sprint_name={sprint_name}>
              {map (count_issues_by_status, function(value, key) {
                  return (
                      <TinyCardRow>
                        <span>{key}</span><span>{value}</span>
                      </TinyCardRow>
                  )
              })
              }
            </TinyCard>
        )
    }
}

const makeMapStateToProps = () => {
    const selIssues = makeSelIssues()

    function mapStateToProps(state, props) {
        const { list_key } = props
        const project_id = props.match.params.projectId
        const sprint_id = props.match.params.sprintId
        const sprint = getSprint(state, sprint_id) || {}
        const project = getProject(state, project_id) || {}
        const sprint_name = sprint.name
        const project_name = project.name
        const issues = selIssues(state, props)
        const count_issues_by_status = countBy(issues, "status_name")

        return {
            list_key,
            project_id,
            sprint_id,
            sprint,
            project,
            issues,
            sprint_name,
            project_name,
            count_issues_by_status
        }
    }
    return mapStateToProps
}

export default withRouter(connect(makeMapStateToProps)(TinyIssuesByStatusCard))
