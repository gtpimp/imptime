import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { getCostSummary, ensureCostSummaryLoaded } from '../actions/CostSummary'
import {
    ensureMultipleIssueSummaryLoaded,
    getMultipleIssueSummary,
    downloadActualsByIssue
} from '../actions/MultipleIssueSummary'
import BreakdownSummary from './BreakdownSummary'

class MultipleIssueSummary extends Component {

    constructor(props) {
        super(props)
        this.download_actuals_by_issue = this.download_actuals_by_issue.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, filter, sprint_id} = props

        if ( ! filter && sprint_id ) {
            dispatch(ensureCostSummaryLoaded(sprint_id))
        } else {
            dispatch(ensureMultipleIssueSummaryLoaded(filter))
        }
    }

    download_actuals_by_issue(event) {
        const { filter, project_id, dispatch  } = this.props
        event.preventDefault()
        dispatch(downloadActualsByIssue(filter, project_id))
    }

    render() {
        const {summary, container_class_name, project_id} = this.props
        return (
            <div className={classNames("multiple-issue-summary", container_class_name)}>
              <BreakdownSummary summary={summary} project_id={project_id} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {filter, sprint_id, project_id, container_class_name} = props

    let summary
    
    if ( !filter && sprint_id ) {
        // It's more efficient to use the cost summary embedded in the
        // sprint cost summary if we're fetching for a single sprint,
        // because it saves an api call and caches better.
        const cost_summary = getCostSummary(state, sprint_id)
        if ( cost_summary ) {
            summary = cost_summary.breakdown
        }
    } else {
        summary = getMultipleIssueSummary(state, filter)
    }
    
    return {
        summary: summary || {},
        filter : filter || { sprint_ids: [sprint_id]},
        sprint_id,
        project_id,
        container_class_name
    }
}

export default connect(mapStateToProps)(MultipleIssueSummary)
