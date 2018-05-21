import React, { Component } from 'react'
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'
import classNames from 'classnames'
import {
    ensureCompanyProblemsLoaded,
    getCompanyProblem
} from '../actions/CompanyProblems'

import IssueName from './IssueName'
import SprintName from './SprintName'
import ProjectName from './ProjectName'
import Timestamp from './Timestamp'

class CompanyProblem extends Component {

    constructor(props) {
        super(props)
        this.onClickCompanyProblem = this.onClickCompanyProblem.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, company_problem_id } = this.props
	dispatch(ensureCompanyProblemsLoaded([company_problem_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, company_problem_id } = new_props
	dispatch(ensureCompanyProblemsLoaded([company_problem_id]))
    }

    onClickCompanyProblem() {
        const { history, company_problem } = this.props
        history.push('/projects/' + company_problem.project_id + '/sprints/' + company_problem.sprint_id + '/issues/' + company_problem.issue_id);
    }

    render() {

        const { company_problem } = this.props

        const reason_class_name = "company_problem__reason--" + company_problem.reason

        if ( ! company_problem.id ) {
            return null
        }
        
        return (
            <div className="company_problem" onClick={this.onClickCompanyProblem}>
              <div className="company_problem__title">
                <div className={classNames("company_problem__reason", reason_class_name)}>

                  <div className="company_problem__project">
                    <ProjectName project_id={company_problem.project_id} />
                  </div>
                  <div className="company_problem__sprint">
                    <SprintName sprint_id={company_problem.sprint_id} display_mode={["status", "type"]} />
                  </div>
                  
                </div>
              </div>
              <div className="company_problem__content">
                <div className="company_problem__header">
                  {company_problem.reason.replace(/_/g, " ")}
                </div>
                <div className="company_problem__issue">
                  <IssueName issue_id={company_problem.issue_id} />
                </div>
                <div className="company_problem__footer">
                  { company_problem.due_date_reason &&
                    <div className="company_problem__due_date">
                      <div>
                        {company_problem.due_date_reason}
                      </div>
                      <div className="company_problem__due_date__date">
                        { company_problem.due_date && <Timestamp value={company_problem.due_date} format="from_now" /> }
                        { !company_problem.due_date && <div>never</div> }
                      </div>
                    </div>
                  }
                  <div className="company_problem__description">
                    <div>
                      {company_problem.description}
                    </div>
                    <div className="company_problem__modified">
                      as of <Timestamp value={company_problem.modified} format="from_now" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { company_problem_id } = props
    const company_problem = getCompanyProblem(state, company_problem_id) || {}

    return {
        company_problem,
        is_loading: !company_problem.id
    }
}

export default withRouter(connect(mapStateToProps)(CompanyProblem))
