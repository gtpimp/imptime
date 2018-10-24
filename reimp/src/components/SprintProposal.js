import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, size, get } from 'lodash'
import { cx, css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import {
    ensureSprintsLoaded,
    getSprint
} from '../actions/Sprints'
import {
    initList,
    getVisibleItemIds,
    update_list_filter,
    getListFilter
} from '../actions/ItemList'
import {ensureEstimateSummaryLoaded,
        getEstimateSummary
} from '../actions/EstimateSummary'
import { showMoney } from '../actions/Mien'
import { ensureUsersLoaded } from '../actions/Users'
import SprintName from './SprintName'
import IssueName from './IssueName'
import CurrencyValue from './CurrencyValue'
import {
    makeSelIssues,
    makeSelTagIdsForIssues,
    makeSelInvalidatedIssueIds,
    makeSelIssuesById,
    makeSelLoadingIssueIds,
} from '../selectors/IssueListSelectors'
import { selGetAllTagsById } from '../selectors/IssueSelectors'
import {
    fetchIssuesIfNeeded
} from '../actions/Issues'
import {ensureCostSummaryLoaded, getCostSummary} from '../actions/CostSummary'
import { ensureTagsLoaded } from '../actions/Tags'
import Testable from './Testable'
import VisualSpecDocumentGallery from './visual_spec/VisualSpecDocumentGallery'
import RenderedMarkdown from './RenderedMarkdown'
import PrintTitle from './PrintTitle'
import OtherUser from './OtherUser'
import Hours from './Hours'

class SprintProposal extends Component {

    componentDidMount() {
        const { dispatch, list_key } = this.props
        dispatch(initList(list_key))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, list_key, sprint_id, tag_ids, filter, estimate_summary } = props

        if ( filter.sprint_id !== sprint_id ) {
            dispatch(update_list_filter(list_key, {sprint_id: sprint_id}))
        }

        if ( sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
            dispatch(ensureEstimateSummaryLoaded(sprint_id))
            dispatch(ensureCostSummaryLoaded(sprint_id))
        }
        
        if ( estimate_summary ) {
            dispatch(ensureUsersLoaded(estimate_summary.all_user_ids))
        }
        if ( filter.sprint_id ) {
            dispatch(ensureTagsLoaded(tag_ids))
            dispatch(fetchIssuesIfNeeded(list_key))
        }
    }

    renderHeader() {
        const { sprint_id } = this.props
        return (
            <div>
              <PrintTitle>
                <div className={css`display:flex`}>
                  Proposal for &nbsp;<SprintName sprint_id={sprint_id}/>
                </div>
              </PrintTitle>
            </div>
        )
    }

    renderCostTotals() {
        const { cost_summary } = this.props
        return (
            <div className="print__page">
              <PrintTitle>
                Cost summary
              </PrintTitle>
              { cost_summary.spendable_budget &&
                <div>
                  Sprint budget: 
                  <CurrencyValue value={cost_summary.spendable_budget} />
                </div>
              }
              <div>
                Cost based on estimates:
                <CurrencyValue value={cost_summary.estimated_cost} />
              </div>
            </div>
        )
    }

    renderIssueContents() {
        const { issues } = this.props
        return (
            <div className="print__page">
              <PrintTitle>
                Issues
              </PrintTitle>
              { map(issues, (issue) => {
                    return (
                        <div key={`issue_contents_${issue.id}`}>
                          <IssueName issue_id={issue.id} />
                          { this.renderIssueSummary(issue) }
                        </div>
                    )
              }) }
            </div>
        )
    }

    renderIssueImages(issue) {
        return (
            <div className={css`display: flex; flex-wrap: wrap; margin-bottom: 20px;`}>
              <VisualSpecDocumentGallery annotated_visual_spec_document_ids={issue.annotated_visual_spec_document_ids}
                                         render_quality="hires"
                                         image_class="visual_spec_document_gallery__image--large_preview"
                                         allow_edit={false} />
            </div>
        )
    }

    renderIssueTestables(issue) {
        return (
            <div className={css`display: flex; flex-wrap: wrap;`}>
              { map(issue.testables, (testable) =>
                  <div key={`issue_testable_${testable.id}`} className={css`max-width:25%; margin-left: 30px; margin-right: 30px;`}>
                    <Testable key={`testable_${testable.id}`} testable={testable} />
                  </div>
                ) }
            </div>
        )
    }

    renderIssueDescription(issue) {
        return (
            <div className={cx("text-component--readonly text-component--description",
                               css`background-color: ${theme.colours.sub_nav_bar};
                                   border-top: 1px solid ${theme.colours.border_strong}`)}>
              
              { size(issue.description) !== 0 && 
                <RenderedMarkdown content={issue.enriched_description || issue.description} />
              }
            </div>
        )
    }

    renderIssueSummary(issue) {
        const { cost_summary, show_money } = this.props
        const issue_costs = get(cost_summary, ["breakdown", "estimates_by_issue", issue.id], {})
        return (
            <div>
              <div className={css`display:flex`}>
                Assigned to: <OtherUser user_id={issue.assigned_to_id}/>
              </div>
              <div className={css`display:flex`}>
                Estimate: <Hours hours={issue_costs.velocity_adjusted_estimate} />
              </div>
              { show_money && 
                <div className={css`display:flex`}>
                  Estimated cost: <CurrencyValue value={issue_costs.velocity_adjusted_cost} />
                </div>
              }
            </div>
        )        
    }

    renderIssues() {
        const { issues } = this.props
        return (
            <div className="print__page">
              <PrintTitle>
                Issue details
              </PrintTitle>
              { map(issues, (issue) => {
                    return (
                        <div className="print__contiguous_section" key={`issue_list_${issue.id}`}>
                          <div>
                            <IssueName issue_id={issue.id} />
                            { this.renderIssueSummary(issue) }
                          </div>
                          <div>{this.renderIssueDescription(issue)}</div>
                          <div>{this.renderIssueImages(issue)}</div>
                          <div>{this.renderIssueTestables(issue)}</div>
                        </div>
                    )
                }) }
            </div>
        )
    }

    render() {
        const { show_money } = this.props
        return (
            <div>
              { this.renderHeader() }
              { show_money && this.renderCostTotals() }
              { this.renderIssueContents() }
              { this.renderIssues() }
            </div>
        )
    }    
}

function makeMapStateToProps(state, props) {
    const selIssues = makeSelIssues()
    const selTagIdsForIssues = makeSelTagIdsForIssues()
    const selInvalidatedIssueIds = makeSelInvalidatedIssueIds()
    const selLoadingIssueIds = makeSelLoadingIssueIds()
    const selIssuesById = makeSelIssuesById()

    const mapStateToProps = (state, props) => {
        
        const { sprint_id, list_key } = props
        const sprint = getSprint(state, sprint_id)
        const visible_issue_ids = getVisibleItemIds(state, list_key)
        const issues = selIssues(state, props)
        const issues_by_id = selIssuesById(state, props)
        const tag_ids = selTagIdsForIssues(state, list_key)
        const all_tags_by_id = selGetAllTagsById(state, props)
        const filter = getListFilter(state, list_key)
        const invalidated_issue_ids = selInvalidatedIssueIds(state, props)
        const loading_issue_ids = selLoadingIssueIds(state, props)
        const estimate_summary = getEstimateSummary(state, sprint_id) || {}
        const cost_summary = getCostSummary(state, sprint_id) || {}
        const show_money = sprint && showMoney(state, sprint.project_id)
        
        return {
            sprint_id,
            sprint,
            visible_issue_ids,
            issues,
            issues_by_id,
            list_key,
            tag_ids,
            all_tags_by_id,
            filter,
            invalidated_issue_ids,
            loading_issue_ids,
            estimate_summary,
            cost_summary,
            show_money
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(SprintProposal)
