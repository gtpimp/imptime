import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { css } from 'emotion'
import Loading from './Loading'
import { getCostSummary, ensureCostSummaryLoaded, isLoadingCostSummary } from '../actions/CostSummary'
import {
    ensureMultipleIssueSummaryLoaded,
    getMultipleIssueSummary,
    isLoadingMultipleIssueSummary,
    downloadActualsByIssue
} from '../actions/MultipleIssueSummary'
import BreakdownSummary from './BreakdownSummary'
import SidebarPrimaryButton from './SidebarPrimaryButton'

const summary_button_block = css`
padding: 12px 0 12px 0;
`

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
        const {auto_load} = props

        if ( auto_load ) {
            this.loadSummary(null, props)
        }
    }

    loadSummary = (event, these_props) => {
        const props = these_props || this.props
        const {dispatch, filter, sprint_id} = props

        if ( ! filter && sprint_id ) {
            dispatch(ensureCostSummaryLoaded(sprint_id))
        } else {
            dispatch(ensureMultipleIssueSummaryLoaded(filter))
        }
    }

    download_actuals_by_issue(event) {
        const { filter, project_id, sprint_id, dispatch  } = this.props
        event.preventDefault()
        dispatch(downloadActualsByIssue(filter || { sprint_ids: [sprint_id]}, project_id))
    }

    render() {
        const {loading, auto_load, summary, container_class_name, project_id} = this.props

        if ( loading ) {
            return <Loading />
        }

        if (!auto_load && ! summary ) {
            return (
                <div className={ summary_button_block }>
                  <SidebarPrimaryButton onButtonClick={this.loadSummary} label="Load summary" />
                </div>
            )
        }
        
        return (
            <div className={classNames("multiple-issue-summary", container_class_name)}>
              <BreakdownSummary summary={summary}
                                project_id={project_id}
                                onDownload={this.download_actuals_by_issue} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {filter, sprint_id, project_id, container_class_name, auto_load} = props

    let summary
    let loading

    if ( !filter && sprint_id ) {
        // It's more efficient to use the cost summary embedded in the
        // sprint cost summary if we're fetching for a single sprint,
        // because it saves an api call and caches better.
        const cost_summary = getCostSummary(state, sprint_id)
        if ( cost_summary ) {
            summary = cost_summary.breakdown
        }
        loading = isLoadingCostSummary(state, sprint_id)
    } else {
        summary = getMultipleIssueSummary(state, filter)
        loading = isLoadingMultipleIssueSummary(state, filter)
    }
    
    return {
        summary: summary,
        filter,
        sprint_id,
        project_id,
        container_class_name,
        auto_load: auto_load !== false,
        loading
    }
}

export default connect(mapStateToProps)(MultipleIssueSummary)
