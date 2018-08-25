import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import PropertyStack from '../components/PropertyStack'
import PropertyStackComponent from '../components/PropertyStackComponent'
import Timestamp from '../components/Timestamp'
import MienFeature from './MienFeature'
import moment from 'moment'
import { getCostSummary, ensureCostSummaryLoaded } from '../actions/CostSummary'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import EditableSprintName from '../components/EditableSprintName'
import EditableSprintStatus from '../components/EditableSprintStatus'
import EditableSprintType from '../components/EditableSprintType'
import EditableSprintDeadline from '../components/EditableSprintDeadline'
//import EditableSprintReviewCycle from '../components/EditableSprintReviewCycle'
import SprintName from './SprintName'
import SprintReviewPanel from './SprintReviewPanel'
import { has_permission } from '../actions/Users'
import MultipleIssueSummary from './MultipleIssueSummary'
import Hours from './Hours'
import CurrencyValue from './CurrencyValue'

class SprintSidebar extends Component {

    constructor(props) {
        super(props)
        this.showEmacsSprint = this.showEmacsSprint.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, project_id, sprint_id } = this.props
	if ( project_id ) {
	    dispatch(ensureProjectsLoaded([project_id]))
	}
	if ( sprint_id ) {
	    dispatch(ensureSprintsLoaded([sprint_id]))
            dispatch(ensureCostSummaryLoaded(sprint_id))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { project_id, sprint_id } = new_props
	if ( project_id ) {
	    dispatch(ensureProjectsLoaded([project_id]))
	}
	if ( sprint_id ) {
	    dispatch(ensureSprintsLoaded([sprint_id]))
            dispatch(ensureCostSummaryLoaded(sprint_id))
	}
    }

    showEmacsSprint() {
        const { sprint } = this.props
        const text = "** sprint#" + sprint.id + " " + sprint.name
        window.prompt("Press Ctrl+C then Enter, then paste into emacs:", text);
    }

    renderCloneInfo() {
        const { sprint } = this.props
        
        return (
            <PropertyStackComponent>
              { sprint.sprint_template_id &&
                <div className="property-text">
                  Cloned from <SprintName sprint_id={sprint.sprint_template_id} />
                </div>
              }
            </PropertyStackComponent>
        )
    }
    
    render() {

        const { sprint_id, sprint, has_view_review_cycle_permission, cost_summary, can_view_costs } = this.props
        
        return (
            <div className="sidebar sprint-sidebar">
              <PropertyStack>

                { this.renderCloneInfo() }
                
                <PropertyStackComponent>
                  <div className="property--title">
                    <EditableSprintName sprint_id={sprint_id} />
                  </div>
                </PropertyStackComponent>
                <PropertyStackComponent>
                  <div className="property-text">{sprint.description}
                  </div>
                </PropertyStackComponent>

                <MienFeature feature_name="emacs">
                  <PropertyStackComponent>
                    <div onClick={this.showEmacsSprint}>
                      Sprint
                      <div className="sprint_sidebar__emacs_copy_img" />
                    </div>
                  </PropertyStackComponent>
                </MienFeature>
                
                <PropertyStackComponent>
                  <div className="property-text">
                    Status: <EditableSprintStatus sprint_ids={[sprint.id]} project_id={sprint.project_id} />
                  </div>
                </PropertyStackComponent>

                <PropertyStackComponent>
                  <div className="property-text">
                    Type: <EditableSprintType sprint_ids={[sprint.id]} project_id={sprint.project_id} />
                  </div>
                </PropertyStackComponent>
                
                <PropertyStackComponent>
                  <div className="named-property">
                    <div className="named-property__name">Created</div>
                    <div className="named-property__value"><Timestamp format="short-date" value={moment(sprint.created)}/></div>
                  </div>
                </PropertyStackComponent>
                <PropertyStackComponent>
                  <div className="named-property">
                    <div className="named-property__name">First Activity</div>
                    <div className="named-property__value"><Timestamp format="short-date" value={sprint.first_entry && moment(sprint.first_entry.start_time)}/></div>
                  </div>
                </PropertyStackComponent>
                <PropertyStackComponent>
                  <div className="named-property">
                    <div className="named-property__name">Last Activity</div>
                    <div className="named-property__value"><Timestamp format="short-date" value={sprint.last_entry && moment(sprint.last_entry.end_time)}/></div>
                  </div>
                </PropertyStackComponent>

                { has_view_review_cycle_permission &&
                  <MienFeature feature_name="review_schedule">
                    <PropertyStackComponent title="Reviews">
                      <SprintReviewPanel sprint_id={sprint.id} />
                    </PropertyStackComponent>
                  </MienFeature>
                }

                { cost_summary &&
                  <PropertyStackComponent>
                    <div className="property--title">
                      Experimental, do not trust these numbers
                    </div>
                    <div className="named-property">
                      <div className="named-property__name">Estimated dev hours (original velocity)</div>
                      <div className="named-property__value"><Hours hours={cost_summary.projections.original_dev_hours}/></div>
                    </div>
                    { can_view_costs && 
                      <div className="named-property">
                        <div className="named-property__name">Estimated dev cost (original velocity)</div>
                        <div className="named-property__value"><CurrencyValue value={cost_summary.projections.original_dev_commission_cost}/></div>
                      </div>
                    }
                    <div className="named-property">
                      <div className="named-property__name">Estimated dev hours (actual velocity)</div>
                      <div className="named-property__value"><Hours hours={cost_summary.projections.revised_dev_hours}/></div>
                    </div>
                    { can_view_costs && 
                      <div className="named-property">
                        <div className="named-property__name">Estimated dev cost (actual velocity)</div>
                        <div className="named-property__value"><CurrencyValue value={cost_summary.projections.revised_dev_commission_cost}/></div>
                      </div>
                    }
                  </PropertyStackComponent>
                }

                <MienFeature feature_name="deadlines">
                  <PropertyStackComponent title="Deadlines">
                    { map(sprint.deadline_ids, function (deadline_id, index) {
                          return <EditableSprintDeadline key={sprint.id} sprint_id={sprint.id} deadline_id={deadline_id}/>
                      })
                    }
                    <EditableSprintDeadline sprint_id={sprint.id} deadline_id={null}/>
                  </PropertyStackComponent>
                </MienFeature>
                  
                <MienFeature feature_name="multiple_issue_summary">
                  <MultipleIssueSummary sprint_id={sprint_id}  project_id={sprint.project_id} />
                </MienFeature>

              </PropertyStack>
            </div>
        )
    }
}

export function mapStateToProps(state, props) {
    const { sprint_id, project_id } = props
    const project = getProject(state, project_id)
    const sprint = getSprint(state, sprint_id) || {}
    const cost_summary = getCostSummary(state, sprint_id)
    const has_view_review_cycle_permission = has_permission(state, project_id, 'has_view_review_cycle')
    const can_view_costs = sprint && has_permission(state, sprint.project_id, 'has_view_ctc_billable_rates')
    
    return {
        sprint_id,
        sprint,
        cost_summary,
        project_id,
        project,
        has_view_review_cycle_permission,
        can_view_costs
    }
}

export default connect(mapStateToProps)(SprintSidebar)

