import React, {Component} from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import CurrencyValue from './CurrencyValue'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import { setSprintBreadcrumbsHelper } from '../actions/Breadcrumbs'

class BudgetCard extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {sprint_id, sprint, project_id, project, dispatch} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { sprint_id, project_id, dispatch } = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))

        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name) {
            this.refresh(new_props.sprint, new_props.project)
        }
    }
    
    refresh(sprint, project) {
        const { dispatch } = this.props
        dispatch(setSprintBreadcrumbsHelper(project, sprint))
    }
    
    render() {
        const { budget } = this.props
        return (
            <div className={ main }>
              <div className={ box }>
                <div className={ header }>
                  <div className={ title_row }>
                    <span className={ card_title }>Budget</span>
                  </div>
                </div>
                <div className={ content }>
                  <div className={ content_row }>
                    {budget == 0  ? <span>None</span> : <CurrencyValue value={budget}/>}
                  </div>
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.match.params.projectId
    const sprint_id = props.match.params.sprintId
    const sprint = getSprint(state, sprint_id) || {}
    const project = getProject(state, project_id) || {}
    const budget = sprint.budget

    return {
        project_id,
        sprint_id,
        sprint,
        project,
        budget
    }
}

export default withRouter(connect(mapStateToProps)(BudgetCard))

const main = css`
display: flex;
flex: 1;
flex-direction: column;
min-height: 100vh;
background-color: ${theme.colours.page_background};
align-items: center;
`

const box = css`
width: 560px;
background-color: ${theme.colours.white};
margin-top: 50px;
box-shadow: ${theme.box_shadows.main};

@media (max-width: ${theme.breakpoints.mobile}) {
    width: 100%;
    height: 100%;
    box-shadow: none;
    border-radius: 0;
    border: none;
    position: absolute;
    left: 0;
    top: 0;
    margin-top: 0;
}
`

const header = css`
padding: 24px;
`
const title_row = css`
display: flex;
flex: 1;
align-items: center;
justify-content: flex-start;
`

const card_title = css`
font: ${theme.fonts.semibold_massive};
`

const content = css`
display: flex;
flex: 1;
flex-direction: column;
`

const content_row = css`
display: flex;
flex: 1;
flex-direction: column;
padding: 24px;
border-bottom: 1px solid #E6E6E6;
font: ${theme.fonts.regular_huge};
`
