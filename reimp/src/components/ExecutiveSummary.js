import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css, cx } from 'emotion'
import { default_theme as theme } from '../theme/default'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
} from 'recharts'

import {
    ensureProjectsLoaded,
    getProject
} from '../actions/Projects'
import {
    ensureSprintsLoaded,
    getSprint,
    getExecutiveSummaryUrl
} from '../actions/Sprints'
import {
    getCostSummary,
    ensureCostSummaryLoaded,
    isLoadingCostSummary
} from '../actions/CostSummary'
import { has_permission } from '../actions/Users'
import { showMoney } from '../actions/Mien'
import placeholder from '../images/executive_summary_placeholder.jpg'

const resource_data = [
    {name: 'resources', spent: 7500, remaining: 2500}
];

const status_data = [
    {name: 'status', ontime: 200, warning: 300, danger: 400}
];

class ExecutiveSummary extends Component {

    componentDidMount() {
        const {dispatch, sprint_id, project_id, sprint} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        if (sprint && sprint.sprint_type_is_clockable) {
            dispatch(ensureCostSummaryLoaded(sprint_id))
        }
    }

    renderResourceChart = () => {
        return (
            <ResponsiveContainer>
              <BarChart data={resource_data}
                        margin={{top: 0, right: 0, left: 0, bottom: 0}}
                        layout="vertical">
                <XAxis type="number" hide={ true } />
                <YAxis dataKey="name" type="category" hide={ true } />
                <Bar
                    isAnimationActive={ false }
                    dataKey="spent"
                    stackId="a"
                    fill="#1e3f75" />
                <Bar
                    isAnimationActive={ false }
                    dataKey="remaining"
                    stackId="a"
                    fill="#e6e6e6" />
              </BarChart>
            </ResponsiveContainer>
        );
    }

    renderStatusChart = () => {
        return (
            <ResponsiveContainer>
              <BarChart data={status_data}
                        margin={{top: 0, right: 0, left: 0, bottom: 0}}
                        layout="vertical">
                <XAxis type="number" hide={ true } />
                <YAxis dataKey="name" type="category" hide={ true } />
                <Bar
                    isAnimationActive={ false }
                    dataKey="ontime"
                    stackId="a"
                    fill="#249134" />
              </BarChart>
            </ResponsiveContainer>
        );
    }
    
    render() {
        const { sprint, cost_summary } = this.props
        return (
            <div className={ main }>
              <div className={ box }>
                <div className={ summary_header }>
                  <div className={ title_row }>
                    <span className={ circle }></span>
                    <span className={ card_title }>{sprint.name}</span>
                  </div>
                  <div className={ status_row }>
                    <span className={ status_text }>Under budget</span>
                    <span className={ spacer }>|</span>
                    <span className={ cx(status_text, red_text) }>Likely to miss deadline</span>
                  </div>
                </div>
                <div className={ image_section }>
                  <img className={ placeholder_image } src={ placeholder } />
                </div>
                <div className={ summary_content }>
                  <div className={ deadline_row }>
                    <span className={content_title}>Deadline</span>
                    <span>24 Sept 2018</span>
                    <span>ETA: 28 Sept 2018</span>
                    <span className={ css`width: 100px;`}></span>
                  </div>
                  <div className={ content_row }>
                    <div className={ left_content }>
                      <span className={content_title}>Resource usage</span>
                      <span>R7,500/R10,000 (75%)</span>
                    </div>
                    <div className={ bar_container }>
                      { this.renderResourceChart() }
                    </div>
                  </div>
                  <div className={ content_row }>
                    <div className={ left_content }>
                      <span className={content_title}>How are we doing</span>
                      <span>+5,000 (150%)</span>
                    </div>
                    <div className={ bar_container }>
                      { this.renderStatusChart() }
                    </div>
                  </div>
                  <div className={context_description}>
                    <span className={content_title}>Description</span>
                    <span className={ description_text }>{ sprint.description || 'No description'}</span>
                  </div>
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const sprint_id = props.sprint_id
    const project_id = props.project_id
    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const cost_summary = getCostSummary(state, sprint_id)
    const show_money = sprint && showMoney(state, sprint.project_id)
    const can_view_budget = show_money && sprint && has_permission(state, sprint.project_id, 'has_view_budget')

    return {
        sprint_id: sprint_id,
        project_id: project_id,
        project: project,
        sprint: sprint,
        cost_summary: cost_summary
    }
}

export default connect(mapStateToProps)(ExecutiveSummary)

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

const summary_header = css`
padding: 24px;
`

const card_title = css`
font: ${theme.fonts.semibold_massive};
`

const circle = css`
width: 21px; 
height: 21px; 
border-radius: 50%;
margin-right: 5px;
background-color: ${theme.colours.red}
`

const title_row = css`
display: flex;
flex: 1;
align-items: center;
justify-content: flex-start;
`

const status_row = css`
display: flex;
flex: 1;
align-items: center;
justify-content: flex-start;
`

const status_text = css`
font: ${theme.fonts.regular_huge};
`

const red_text = css`
color: ${theme.colours.red}
`

const spacer = css`
color: ${theme.colours.button_background};
padding: 0 10px 0 10px;
font-size: 18px;
`

const image_section = css`
display: flex;
flex: 1;

`

const placeholder_image = css`
width: 100%;
height: 300px;
`

const summary_content = css`
display: flex;
flex: 1;
flex-direction: column;
`

const content_title = css`
font: ${theme.fonts.semibold_big};
`

const context_description = css`
display: flex;
flex-direction: column;
padding: 24px;
`

const content_row = css`
display: flex;
flex: 1;
flex-direction: column;
padding: 24px;
border-bottom: 1px solid #E6E6E6;
font: ${theme.fonts.regular_huge};
`

const deadline_row = css`
display: flex;
flex: 1;
justify-content: space-between;
align-items: space-between;
padding: 24px;
border-bottom: 1px solid #E6E6E6;
font: ${theme.fonts.regular_huge};
`

const left_content = css`
display: flex;
flex: 5;
justify-content: space-between;
align-items: space-between;
`

const bar_container = css`
display: flex;
width: 100%;
height: 15px;
margin-top: 10px;
`

const description_text = css`
margin-top: 10px;
`
