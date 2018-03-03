import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import map from 'lodash/map'
import {browserHistory} from 'react-router'
import {
    invalidateMultipleIssueSummary,
    ensureMultipleIssueSummaryLoaded,
    getMultipleIssueSummary
} from '../actions/MultipleIssueSummary'

class MultipleIssueSummary extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, issue_ids} = props
        dispatch(ensureMultipleIssueSummaryLoaded(issue_ids))
    }

    renderEstimatesByUser(summary) {
        return (
            <table>
              <thead>
                <th>User</th>
                <th>Raw estimate</th>
              </thead>
              <tbody>
                { map(summary.estimates_by_user.raw_estimated_hours_by_user
              </tbody>
            </table>
        )
    }

    render() {
        const {issues, issue_ids, project_id, summary} = this.props
        return (
            <div className="multiple-issue-summary">
              <PropertyStack>
                <PropertyStackComponent>
                  Issue summary
                </PropertyStackComponent>
                <PropertyStackComponent>
                  {this.renderEstimatesByUser(summary)}
                </PropertyStackComponent>
              </PropertyStack>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {issue_ids} = props
    const summary = getMultipleIssueSummary(state, issue_ids) || {}
    return {
        summary: summary,
        issue_ids: issue_ids
    }
}

export default connect(mapStateToProps)(MultipleIssueSummary)
