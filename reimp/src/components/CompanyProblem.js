import React, { Component } from 'react'
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'
import classNames from 'classnames'
import { map, keys, keyBy } from 'lodash'
import {
    ensureCompanyProblemsLoaded,
    getCompanyProblem,
    updateCompanyProblem
} from '../actions/CompanyProblems'

import SprintName from './SprintName'
import ProjectName from './ProjectName'
import OtherUser from './OtherUser'
import Timestamp from './Timestamp'
import { getCellStyle } from '../actions/ItemListKeyRegistry'

class CompanyProblem extends Component {

    constructor(props) {
        super(props)
        this.onClickCompanyProblem = this.onClickCompanyProblem.bind(this)
        this.onFixedCompanyProblem = this.onFixedCompanyProblem.bind(this)
        this.onCantFixCompanyProblem = this.onCantFixCompanyProblem.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, company_problem_id } = this.props
	dispatch(ensureCompanyProblemsLoaded([company_problem_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, company_problem_id } = new_props
	dispatch(ensureCompanyProblemsLoaded([company_problem_id]))
    }

    onClickCompanyProblem(event) {
        const { history, company_problem } = this.props
        if ( event ) {
            event.preventDefault()
        }

        if ( company_problem.problem_type === "missing_rate" ) {
            history.push('/projects/' + company_problem.project_id + '/sprints/' + company_problem.sprint_id + '/rates')
        } else {
            history.push('/projects/' + company_problem.project_id + '/sprints/' + company_problem.sprint_id)
        }
    }

    onFixedCompanyProblem(event) {
        const { dispatch, company_problem } = this.props
        if ( event ) {
            event.preventDefault()
        }
        dispatch(updateCompanyProblem([company_problem.id], 'status', 'closed'))
    }

    onCantFixCompanyProblem(event) {
        const { dispatch, company_problem } = this.props
        if ( event ) {
            event.preventDefault()
        }
        dispatch(updateCompanyProblem([company_problem.id], 'status', 'cant_fix'))
    }

    renderCompanyProblemType() {
        const { company_problem } = this.props
        switch(company_problem.problem_type) {
            case "missing_rate": return "Missing Rate"
            case "missing_budget": return "Missing Budget"
            default: return company_problem.problem_type
        }
    }

    renderCompanyProblemStatus() {
        const { company_problem } = this.props
        switch(company_problem.status) {
            case "open": return "Open"
            case "closed": return "Fixed"
            case "cant_fix": return "Can't fix"
            default: return company_problem.status
        }
    }

    render() {

        const { company_problem, is_loading, header_list } = this.props
        const headers_by_key = keyBy(header_list, "key")
        const visible_header_keys = keys(headers_by_key)
        const that = this

        if ( ! is_loading === false ) {
	    return (
		<div key={company_problem.id}
		     className={classNames("div-table__row")}
		>
		  <div className="div-table__cell">{company_problem && company_problem.id}</div>
		  <div className="div-table__cell">Loading...</div>
		</div>
	    )
        } else {
            return (
		<div key={this.key+"."+company_problem.id}
                     className={classNames('company_problem',
                                           'div-table__row')}
		>

                  { map(visible_header_keys, function(header_key) {
                        const header = headers_by_key[header_key]
                        switch(header_key) {
                            case "status":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div className={classNames({"icon__status--unresolved":company_problem.status === "open",
                                                                  "icon__status--resolved":company_problem.status === "closed",
                                                                  "icon__status--cant-resolve":company_problem.status === "cant_fix"})}/>
                                      {that.renderCompanyProblemStatus()}
                                    </div>
                                )
                            case "user":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div>
                                        {company_problem.user_id && <OtherUser user_id={company_problem.user_id}/>}
                                      </div>
                                    </div>
                                )
                            case "sprint":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div><SprintName sprint_id={company_problem.sprint_id}/></div>
                                    </div>
                                )
                            case "project":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div><ProjectName project_id={company_problem.project_id}/></div>
                                    </div>
                                )
                            case "created_at":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div><Timestamp value={company_problem.created} format="from_now"/></div>
                                    </div>
                                )
                            case "modified_at":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div><Timestamp value={company_problem.modified} format="from_now"/></div>
                                    </div>
                                )
                            case "problem_type":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div>
                                        { that.renderCompanyProblemType() }
                                      </div>
                                    </div>
                                )
                            case "description":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div>{company_problem.description}</div>
                                    </div>
                                )
                            case "action_buttons":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <button onClick={that.onClickCompanyProblem}>Show</button>
                                      <button onClick={that.onFixedCompanyProblem}>Fixed</button>
                                      <button onClick={that.onCantFixCompanyProblem}>Can't Fix</button>
                                    </div>
                                )
                            default:
                                console.error("Unknown header: " + header_key)
                                
                        }
                    }
                    )}
                </div>
            )
        }
    }
}

function mapStateToProps(state, props) {
    const { company_problem_id, header_list } = props
    const company_problem = getCompanyProblem(state, company_problem_id) || {}

    return {
        company_problem,
        is_loading: !company_problem.id,
        header_list
    }
}

export default withRouter(connect(mapStateToProps)(CompanyProblem))
