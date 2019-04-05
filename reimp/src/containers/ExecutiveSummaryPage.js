import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import ExecutiveSummary from '../mobile/components/ExecutiveSummary'
import ExecutiveSummaryShareButton from '../components/ExecutiveSummaryShareButton'
import { css } from 'emotion'
import {
    ensureProjectsLoaded,
    getProject
} from '../actions/Projects'
import {
    ensureSprintsLoaded,
    getSprint
} from '../actions/Sprints'

class ExecutiveSummaryPage extends Component {


    constructor(props) {
        super(props)
        this.state = {deadline_shown: null}
    }

    componentDidMount() {
        this.refresh(this.props)
    }

    componentDidUpdate(prev_props) {
        this.refresh(prev_props)
    }

    async refresh(props) {
        const { dispatch, sprint_id, project_id } = props
        await dispatch(ensureProjectsLoaded([project_id]))
        await dispatch(ensureSprintsLoaded([sprint_id]))
    }

    render() {
        const { project_id, sprint_id, project, sprint } = this.props

        if (!project.id || !sprint.id) {
            return null
        }
        console.log(project.id, sprint.id)
        return (
            <div className={ main }>
              <div className={ actions }>
                <ExecutiveSummaryShareButton project_id={ project_id } sprint_id={ sprint_id } />
              </div>
              <div className={ content }>
                <ExecutiveSummary project_id={ project_id } sprint_id={ sprint_id } />
              </div>
            </div>
        )
    }
}
function mapStateToProps(state, props) {
    const sprint_id = props.match.params.sprintId
    const project_id = props.match.params.projectId

    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}

    return {
        sprint_id: sprint_id,
        project_id: project_id,
        project: project,
        sprint: sprint
    }
}
export default withRouter(connect(mapStateToProps)(ExecutiveSummaryPage))

const main = css`
display: flex;
flex: 1;
flex-direction: column;
`

const actions = css`
display: flex;
height: 40px;
justify-content: center;
align-items: center;
background-color: #c8d3d6;
`

const content = css`
display: flex;
flex: 11;
`
