import React, {Component} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import { map, size, get, keys } from 'lodash'
import { cx, css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import { getCellStyle } from '../actions/ItemListKeyRegistry'
import {
    ensureSprintsLoaded,
    getSprint,
    ALL_AVAILABLE_SPRINT_RECON_HEADERS
} from '../actions/Sprints'
import { HEADER_LIST_NAME__SPRINT_RECON } from '../actions/ItemListKeyRegistry'
import {
    initList,
    getVisibleItemIds,
    update_list_filter,
    getListFilter
} from '../actions/ItemList'
import {ensureEstimateSummaryLoaded,
        getEstimateSummary
} from '../actions/EstimateSummary'
import { showMoney, doesMienHaveHeader } from '../actions/Mien'
import { ensureUsersLoaded } from '../actions/Users'
import SprintName from './SprintName'
import IssueName from './IssueName'
import IssueStatus from './IssueStatus'
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

class SprintRecon extends Component {

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
                  Recon for
                  <h2>
                    <SprintName sprint_id={sprint_id}/>
                  </h2>
                </div>
                { sprint.description && 
                  <div>
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
              <PrintTitle>Recon parameters</PrintTitle>
              <p>
                This recon is for comparing estimates and actuals for a sprint.
              </p>
              <p>
                All estimated costs arise from developer estimates with adjustments. (For details on how estimates are calculated, refer to the
                proposal for this sprint.)
              </p>
              <p>
                All actual costs arise from clocked entries by people involved in the project.
              </p>
              <p>
                If this is a quote, then the final cost will be the budget including uncertainty, not the actual cost.
              </p>
            </div>
        )
    }

    renderCostTotals(active_headers) {
        const { show_money, cost_summary, show_hours_in_total } = this.props
        const totals = get(cost_summary, ["breakdown", "totals"], {}) || {}

        return ( 
            <div className="print__page">
              <PrintTitle>
                { show_money && <span>Costing</span> }
                { !show_money && <span>Summary</span> }
              </PrintTitle>
              { cost_summary.breakdown &&

                <div>
                  <p>
                    These costs do not include South African VAT. If VAT is applicable, then it will be added during invoicing.
                  </p>

                  <DivTable renderHeader={this.renderCostTotalsHeader}>
                    {show_money && cost_summary.spendable_budget &&
                      <DivTableRow key={`spendable_budget`}>
                        <DivTableCell>Sprint budget</DivTableCell>
                        <DivTableCell>
                          <CurrencyValue value={cost_summary.budget} float_direction="none" />
                        </DivTableCell>
                      </DivTableRow>
                    }
                    { show_hours_in_total &&
                      <DivTableRow key={`estimated_hours`}>
                        <DivTableCell>Estimated hours</DivTableCell>
                        <DivTableCell>
                          <div>{totals.estimated_hours}</div>
                          &nbsp;(approximately {Math.ceil(totals.estimated_hours/8)} man days)
                        </DivTableCell>
                      </DivTableRow>
                    }
                      
                    { show_money &&
                      <div>
                        <DivTableRow key={`estimated_cost`}>
                          <DivTableCell>Estimated cost</DivTableCell>
                          <DivTableCell>
                            <CurrencyValue value={totals.estimated_cost} float_direction="none" />
                          </DivTableCell>
                        </DivTableRow>
                        
                        <DivTableRow key={`contingency`}>
                          <DivTableCell>Estimated Contingency</DivTableCell>
                          <DivTableCell>
                            <CurrencyValue value={totals.scope_creep} float_direction="none" />
                            &nbsp;&nbsp;(@ {totals.scope_creep_percentage}%)
                          </DivTableCell>
                        </DivTableRow>
                        
                        <DivTableRow key={'total'}>
                          <DivTableCell>
                            <div className={css`font: ${theme.fonts.bold_large}`}>
                              Estimated total cost
                            </div>
                          </DivTableCell>
                          <DivTableCell>
                            <div className={css`font: ${theme.fonts.bold_large}`}>
                              <CurrencyValue value={totals.grand_total} float_direction="none" />
                            </div>
                          </DivTableCell>
                        </DivTableRow>
                        
                        { show_hours_in_total &&
                          <DivTableRow key={'actual_hours'}>
                            <DivTableCell>Actual hours</DivTableCell>
                            <DivTableCell>
                              <div><Hours hours={cost_summary.hours_used} /></div>
                              &nbsp;(approximately {Math.ceil(cost_summary.hours_used/8)} man days)
                            </DivTableCell>
                          </DivTableRow>
                        }
                          
                        <DivTableRow key={'actual_total_cost'}>
                          <DivTableCell>
                            <div className={css`font: ${theme.fonts.bold_large}`}>
                              Actual total cost
                            </div>
                          </DivTableCell>
                          <DivTableCell>
                            <div className={css`font: ${theme.fonts.bold_large}`}>
                              <CurrencyValue value={cost_summary.spent} float_direction="none" />
                            </div>
                          </DivTableCell>
                        </DivTableRow>
                      </div>
                    }
                  </DivTable>
                </div>
              }
            </div>
        )
    }

    renderCostTotalsHeader = (header_list) => {
        return (
            <DivTableHeaderRow>
              <DivTableHeaderCell key="item" />
              <DivTableHeaderCell key="amount" />
            </DivTableHeaderRow>
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

    renderIssueContents(header_list) {
        const { cost_summary, issues, show_money } = this.props

        return (
            <div className="print__page">
              <PrintTitle>
                Issues
              </PrintTitle>
              <DivTable renderHeader={() => this.renderIssueContentsHeader(header_list)}>
                {map(issues, (issue) => {
                    const issue_costs = get(cost_summary, ["breakdown", "estimates_by_issue", issue.id], {})
                    const actuals_for_user = get(cost_summary, ["breakdown", "actuals_by_issue_and_user", issue.id], {})
                    const actuals_for_issue = get(cost_summary, ["breakdown", "actuals_by_issue", issue.id], {})
                    return (
                         <DivTableRow key={`sprint_recon__div_table__${issue.id}`}>

                           { map(header_list, (header) => {
                                 const header_key = header.key
                                 let content = null
                                 switch(header_key) {
                                     case "number":
                                         content = (
                                             <DivTableCell key="number" extra_style={getCellStyle(header)}>
                                               {issue.number}
                                             </DivTableCell>
                                         )
                                         break
                                     case "name":
                                         content = (
                                             <DivTableCell key="name" extra_style={getCellStyle(header)}>
                                               <IssueName issue_id={issue.id} />
                                             </DivTableCell>
                                         )
                                         break
                                     case "status":
                                         content = (
                                             <DivTableCell key="status" extra_style={getCellStyle(header)}>
                                               <IssueStatus issue_id={issue.id} />
                                             </DivTableCell>
                                         )
                                         break
                                     case "estimates_by_assignee":
                                         content = (
                                             <DivTableCell key="estimates_by_assignee" extra_style={getCellStyle(header)}>
                                               <Hours hours={issue_costs.velocity_adjusted_estimate} />
                                             </DivTableCell>
                                         )
                                         break
                                     case "estimated_cost_by_assignee":
                                         if ( show_money ) {
                                             content = (
                                                 <DivTableCell key="estimated_cost_by_assignee" extra_style={getCellStyle(header)}>
                                                   <CurrencyValue value={issue_costs.velocity_adjusted_cost} />
                                                 </DivTableCell>
                                             )
                                         }
                                         break
                                     case "actual_cost":
                                         if ( show_money ) {
                                             content = (
                                                 <DivTableCell key="actual_cost" extra_style={getCellStyle(header)}>
                                                   <CurrencyValue value={actuals_for_issue.cost_with_commission} />
                                                 </DivTableCell>
                                             )
                                         }
                                         break
                                     case "actual_cost_by_user":
                                         if ( show_money ) {
                                             content = (
                                                 <DivTableCell key="actual_cost_by_user" extra_style={getCellStyle(header)}>
                                                   {map(keys(actuals_for_user), function(user_id) {
                                                        const actual_for_user = actuals_for_user[user_id]
                                                        return (
                                                            <div>
                                                              <OtherUser user_id={user_id}/>
                                                              <CurrencyValue value={actual_for_user.cost_with_commission} />
                                                            </div>
                                                        )
                                                    })}
                                                            { size(actuals_for_user) === 0 &&
                                                              <CurrencyValue value="0.0" />
                                                            }
                                                 </DivTableCell>
                                             )
                                         }
                                         break
                                     case "actual_hours_by_user":
                                         content = (
                                             <DivTableCell key="actual_cost_by_user" extra_style={getCellStyle(header)}>
                                               {map(keys(actuals_for_user), function(user_id) {
                                                    const actual_for_user = actuals_for_user[user_id]
                                                    return (
                                                        <div>
                                                          <OtherUser user_id={user_id}/>
                                                          <Hours hours={actual_for_user.hours} />
                                                        </div>
                                                    )
                                                })}
                                                { size(actuals_for_user) === 0 &&
                                                  <Hours hours="0.0" />
                                                }
                                             </DivTableCell>
                                         )
                                         break
                                     case "assignee":
                                         content = (
                                             <DivTableCell key="assignee" extra_style={getCellStyle(header)}>
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
                  <div key={`issue_testable_${testable.id}`} className={css`margin-left: 30px; margin-right: 30px;`}>
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
                This is the definition of what this recon actually delivers.
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
        const { sprint } = this.props

        if ( ! sprint ) {
            return (<Loading/>)
        }
        
        return (
            <div>

              <MienListColumnConfigurable all_headers={ALL_AVAILABLE_SPRINT_RECON_HEADERS}
                                          header_list_name={HEADER_LIST_NAME__SPRINT_RECON}
              >
                {({active_headers}) => (
                     <div className={css`margin-left: 20px; margin-right: 20px`}>
                       { this.renderHeader() }
                       { this.renderDevelopmentMethodology() }
                       { this.renderCostTotals(active_headers) }
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
        const show_hours_in_total = sprint && doesMienHaveHeader(state, HEADER_LIST_NAME__SPRINT_RECON, 'estimates_by_assignee')
        
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
            show_money,
            show_hours_in_total
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(SprintRecon)
