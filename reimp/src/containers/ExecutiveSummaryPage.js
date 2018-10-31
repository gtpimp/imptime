import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import ExecutiveSummary from '../components/ExecutiveSummary'
import ExecutiveSummaryShareButton from '../components/ExecutiveSummaryShareButton'
import { css } from 'emotion'

class ExecutiveSummaryPage extends Component {

    render() {
        const { project_id, sprint_id, project, sprint } = this.props
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
    return {
        sprint_id: sprint_id,
        project_id: project_id
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
