import React, {Component} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import { map, size, get } from 'lodash'
import { cx, css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import { getCellStyle } from '../actions/ItemListKeyRegistry'
import {
    ensureSprintsLoaded,
    getSprint,
    ALL_AVAILABLE_SPRINT_PROPOSAL_HEADERS
} from '../actions/Sprints'
import { HEADER_LIST_NAME__SPRINT_PROPOSAL } from '../actions/ItemListKeyRegistry'
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
import PrintSubTitle from './PrintSubTitle'
import OtherUser from './OtherUser'
import Hours from './Hours'
import DivTable from './DivTable'
import DivTableHeaderRow from './DivTableHeaderRow'
import DivTableHeaderCell from './DivTableHeaderCell'
import DivTableRow from './DivTableRow'
import DivTableCell from './DivTableCell'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import Loading from './Loading'
import Timestamp from './Timestamp'

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
        const { sprint_id, sprint } = this.props
        return (
            <div>
              <PrintTitle>
                <div>
                  Proposal for
                  <h2>
                    <SprintName sprint_id={sprint_id}/>
                  </h2>
                </div>
                { sprint.description && 
                  <div>
                    <h2>Sprint description</h2>
                    <p>
                      {sprint.description}
                    </p>
                  </div>
                }
              </PrintTitle>
              <div className={css`display:flex`}>
                Generated at&nbsp;<Timestamp value={moment()} format='dateshort-time' />
              </div>
            </div>
        )
    }

    renderDevelopmentMethodology() {
        return (
            <div className="print__page">
              <PrintTitle>Development methodology</PrintTitle>
              <p>
                ImplicitDesign uses the agile software development methodology, which
                allows for a flexible specification and on-going client-liason.
              </p>
              <p>
                We assist the client in managing the project budget, by identifying where
                costs can be reduced or functionality can be streamlined.
              </p>
              <p>
                We bill by the hour, for a number of reasons:
                <ul>
                  <li>it allows the final cost of the project to match exactly the effort involved,
                    ie no quote padding is required</li>
                  <li>
                    scope changes to the project are easily managed as a normal part of the
                    development process</li>
                </ul>
              </p>
              <p>
                Therefore the project is not open-ended, but rather managed in an ongoing
                manner.
              </p>
            </div>
        )
    }

    renderCostMethodology() {
        return (
            <div>
              <p>
                The following costing is based on the list of issues given later in this document.
              </p>
              <p>
                The final cost will be invoiced as the actual billable time taken, which may be
                less than the minimum estimate or more than the maximum estimate.
              </p>
              <p>
                To manage the budget expectations and overruns, the client can request to be
                notified at certain budget milestones, for example half-way through the sprint
                budget.
              </p>
              <p>
                The total estimated cost is a formula including testing, uncertainty and management.
              </p>
            </div>
        )
    }

    renderCostTotals() {
        const { cost_summary } = this.props
        return (
            <div className="print__page">
              <PrintTitle>
                Costing
              </PrintTitle>
              { this.renderCostMethodology() }
              <div className={css`font: ${theme.fonts.bold_large}`}>
                <p>
                  These costs do NOT include South African VAT. If VAT is applicable, then it will be added during invoicing.
                </p>
                { cost_summary.spendable_budget &&
                  <div className={css`display: flex`}>
                    Sprint budget: 
                    <CurrencyValue value={cost_summary.spendable_budget} float_direction="none" />
                  </div>
                }
                <div className={css`display: flex`}>
                  Total estimated cost
                  <CurrencyValue value={cost_summary.estimated_cost} float_direction="none" />
                </div>
              </div>
            </div>
        )
    }

    renderIssueContentsHeader = (header_list) => {
        return (
            <DivTableHeaderRow>
              { map(header_list, (v, k) => (
                    <DivTableHeaderCell key={k}
                                        className="div-table__header_cell"
                                        extra_style={getCellStyle(v)}>
                      {v.label }
                    </DivTableHeaderCell>
                ))}
            </DivTableHeaderRow>
        )
    }

    renderIssueMethodology() {
        return (
            <div>
              <p>
                The following list of issues represents the work agreed to be done within the
                cost given above. This list is flexible to on-going change as determined
                through feedback with the client.
              </p>
              <p>
                Each issue is assigned an expected duration to complete, typically in the
                range of a few hours. By estimating at such a granular resolution we find that
                complexities inherent in the project are identified in the specification phase
                which greatly reduces risk.
              </p>
              <p>
                Our estimates are usually slightly high. Usually this is balanced out by smaller
                tweaks or adjustments that are identified during testing. In general these
                estimates are a realistic reflection of the cost to deliver the requirements,
                rather than optimistic or pessimistic.
              </p>
            </div>
        )
    }

    renderIssueContents(header_list) {
        const { cost_summary, issues } = this.props
        return (
            <div className="print__page">
              <PrintTitle>
                Issues
              </PrintTitle>
              { this.renderIssueMethodology() }
              <DivTable renderHeader={() => this.renderIssueContentsHeader(header_list)}>
                {map(issues, (issue) => {
                     const issue_costs = get(cost_summary, ["breakdown", "estimates_by_issue", issue.id], {})
                     return (
                         <DivTableRow key={`sprint_proposal__div_table__${issue.id}`}>

                           { map(header_list, (header) => {
                                 const header_key = header.key
                                 let content = null
                                 switch(header_key) {
                                     case "number":
                                         content = (
                                             <DivTableCell extra_style={getCellStyle(header)}>
                                               {issue.number}
                                             </DivTableCell>
                                         )
                                         break
                                     case "name":
                                         content = (
                                             <DivTableCell extra_style={getCellStyle(header)}>
                                               <IssueName issue_id={issue.id} />
                                             </DivTableCell>
                                         )
                                         break
                                     case "estimates_by_assignee":
                                         content = (
                                             <DivTableCell extra_style={getCellStyle(header)}>
                                               <Hours hours={issue_costs.velocity_adjusted_estimate} />
                                             </DivTableCell>
                                         )
                                         break
                                     case "cost_by_assignee":
                                         content = (
                                             <DivTableCell extra_style={getCellStyle(header)}>
                                               <CurrencyValue value={issue_costs.velocity_adjusted_cost} />
                                             </DivTableCell>
                                         )
                                         break
                                     case "assignee":
                                         content = (
                                             <DivTableCell extra_style={getCellStyle(header)}>
                                               <OtherUser user_id={issue.assigned_to_id}/>
                                             </DivTableCell>
                                         )
                                         break
                                     default:
                                         console.error("Unknown header: " + header_key)
                                 }
                                 return content
                             }
                             )}
                         </DivTableRow>
                     )
                 }
                 )}
              </DivTable>
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
                    <Testable key={`testable_${testable.id}`} testable={testable} can_edit={false} />
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

              <PrintSubTitle>
                <IssueName issue_id={issue.id} />
              </PrintSubTitle>
              
              { size(issue.description) !== 0 && 
                <RenderedMarkdown content={issue.enriched_description || issue.description} />
              }
            </div>
        )
    }

    renderIssueDescriptionMethodology() {
        return (
            <div>
              <p>
                This section contains a detailed breakdown of each issue,
                including images (if available) and the steps taken to verify the issue is complete.
              </p>
              <p>
                This is the definition of what this proposal actually delivers.
              </p>
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
              { this.renderIssueDescriptionMethodology() }
              { map(issues, (issue) => {
                    return (
                        <div className="print__contiguous_section" key={`issue_list_${issue.id}`}>
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
        const { show_money, sprint } = this.props

        if ( ! sprint ) {
            return (<Loading/>)
        }
        
        return (
            <div>

              <MienListColumnConfigurable all_headers={ALL_AVAILABLE_SPRINT_PROPOSAL_HEADERS}
                                          header_list_name={HEADER_LIST_NAME__SPRINT_PROPOSAL}
              >
                {({active_headers}) => (
                     <div className={css`margin-left: 20px; margin-right: 20px`}>
                       { this.renderHeader() }
                       { this.renderDevelopmentMethodology() }
                       { show_money && this.renderCostTotals() }
                       { this.renderIssueContents(active_headers) }
                       { this.renderIssues() }
                     </div>
                 )}
              </MienListColumnConfigurable>
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
