import React, {Component} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import { map, size, get } from 'lodash'
import { css } from 'emotion'
import { getCellStyle } from '../actions/ItemListKeyRegistry'
import {
    ensureProjectsLoaded,
    getProject,
} from '../actions/Projects'
import { ALL_AVAILABLE_MULTIPLE_SPRINT_RECON_HEADERS } from '../actions/Sprints'
import { HEADER_LIST_NAME__PROJECT_RECON } from '../actions/ItemListKeyRegistry'
import {
    initList,
    getVisibleItemIds,
    getListFilter
} from '../actions/ItemList'
import { showMoney } from '../actions/Mien'
import ProjectName from './ProjectName'
import SprintName from './SprintName'
import {getCostSummaries, fetchCostSummariesIfNeeded} from '../actions/CostSummary'
import { ensureSprintsLoaded, getSprints } from '../actions/Sprints'
import PrintTitle from './PrintTitle'
import CurrencyValue from './CurrencyValue'
import DivTable from './DivTable'
import DivTableHeaderRow from './DivTableHeaderRow'
import DivTableHeaderCell from './DivTableHeaderCell'
import DivTableRow from './DivTableRow'
import DivTableCell from './DivTableCell'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import Loading from './Loading'
import Timestamp from './Timestamp'

class MultipleSprintRecon extends Component {

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
        const { dispatch, list_key, filter, project_id, cost_summaries } = props
        if ( project_id && filter.project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(fetchCostSummariesIfNeeded(list_key))
        }
        if ( size(cost_summaries)>0 ) {
            dispatch(ensureSprintsLoaded(map(cost_summaries, (cost_summary) => cost_summary.sprint_id)))
        }
    }

    renderIntro() {
        const { project_id, project } = this.props
        return (
            <div>
              <PrintTitle>
                <div>
                  Recon for project
                  <h2>
                    <ProjectName project_id={project_id}/>
                  </h2>
                </div>
                { project.description && 
                  <div>
                    <p>
                      {project.description}
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

    renderSprintsHeader(header_list) {
        return (
            <DivTableHeaderRow>
              { map(header_list, (v, k) => (
                    <DivTableHeaderCell key={k}
                                        extra_style={getCellStyle(v)}>
                      {v.label }
                    </DivTableHeaderCell>
                ))}
            </DivTableHeaderRow>
        )
    }

    renderCostSummaryForSprint(header_list, cost_summary) {
        const { show_money } = this.props
        const totals = get(cost_summary, ["breakdown", "totals"], {}) || {}
        return (
            <DivTableRow key={`multiple_sprint_recon__div_table__${cost_summary.id}`}>
              { map(header_list, (header) => {
                    const header_key = header.key
                    let content = null
                    switch(header_key) {
                        case "sprint_name":
                            content = (
                                <DivTableCell>
                                  <SprintName sprint_id={cost_summary.sprint_id} />
                                </DivTableCell>
                            )
                            break
                        case "budget":
                            if (show_money && cost_summary.budget) {
                                content = (
                                      <DivTableCell>
                                        <CurrencyValue value={cost_summary.budget} float_direction="none" />
                                      </DivTableCell>
                                )
                            }
                            break
                        case "estimated_hours":
                            content = (
                                <DivTableCell>
                                  <span>{totals.estimated_hours}</span>
                                </DivTableCell>
                            )
                            break
                        case "estimated_cost":
                            if ( show_money ) {
                                content = (
                                    <DivTableCell>
                                      <CurrencyValue value={totals.estimated_cost} float_direction="none" />
                                    </DivTableCell>
                                )
                            }
                            break
                        case "estimated_cost_with_contingency":
                            if ( show_money ) {
                                content = (
                                    <DivTableCell>
                                      <CurrencyValue value={totals.grand_total} float_direction="none" />
                                    </DivTableCell>
                                )
                            }
                            break
                        case "actual_hours":
                            content = (
                                <DivTableCell>
                                  {cost_summary.hours_used}
                                </DivTableCell>
                            )
                            break
                        case "actual_cost":
                            content = (
                                <DivTableCell>
                                  <CurrencyValue value={cost_summary.spent} float_direction="none" />
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

    render() {
        const { project, cost_summaries } = this.props

        if ( ! project ) {
            return (<Loading/>)
        }
        
        return (
            <div>

              {this.renderIntro()}
              <MienListColumnConfigurable all_headers={ALL_AVAILABLE_MULTIPLE_SPRINT_RECON_HEADERS}
                                          header_list_name={HEADER_LIST_NAME__PROJECT_RECON}
              >
                {({active_headers}) => (
                     <DivTable renderHeader={() => this.renderSprintsHeader(active_headers)}>
                       {cost_summaries.map((cost_summary) => this.renderCostSummaryForSprint(active_headers, cost_summary))}
                     </DivTable>
                 )}
              </MienListColumnConfigurable>
            </div>
        )
    }
}

const mapStateToProps = (state, props) => {
    const { list_key } = props
    const filter = getListFilter(state, list_key)
    const project_id = filter.project_id
    const project = project_id && getProject(state, project_id)
    const visible_sprint_ids = getVisibleItemIds(state, list_key)
    const real_only = true
    const cost_summaries = getCostSummaries(state, visible_sprint_ids, real_only)
    const show_money = project && showMoney(state, project.project_id)
    const sprints = cost_summaries && getSprints(state, cost_summaries.all_sprints_ids)
    
    return {
        project_id,
        project,
        visible_sprint_ids,
        list_key,
        filter,
        cost_summaries,
        show_money,
        sprints
    }
}

export default connect(mapStateToProps)(MultipleSprintRecon)
