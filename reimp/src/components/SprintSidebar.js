import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import Timestamp from '../components/Timestamp'
import MienFeature from './MienFeature'
import moment from 'moment'
// import { getCostSummary, ensureCostSummaryLoaded } from '../actions/CostSummary'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import EditableSprintStatus from '../components/EditableSprintStatus'
import EditableSprintType from '../components/EditableSprintType'
import EditableSprintDeadline from '../components/EditableSprintDeadline'
//import EditableSprintReviewCycle from '../components/EditableSprintReviewCycle'
import SprintName from './SprintName'
import SprintReviewPanel from './SprintReviewPanel'
import { has_permission } from '../actions/Users'
import MultipleIssueSummary from './MultipleIssueSummary'
import EditableSprintName from '../components/EditableSprintName'

import SidebarContainer from './SidebarContainer'
import SidebarProperty from './SidebarProperty'
import SidebarDetail from './SidebarDetail'
import SidebarTitle from './SidebarTitle'
import SidebarSectionTitle from './SidebarSectionTitle'

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
            // dispatch(ensureCostSummaryLoaded(sprint_id))
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
            // dispatch(ensureCostSummaryLoaded(sprint_id))
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
            <SidebarProperty key="clonestack">
              { sprint.sprint_template_id &&
                <div className="property-text">
                  Cloned from <SprintName sprint_id={sprint.sprint_template_id} />
                </div>
              }
            </SidebarProperty>
        )
    }

    renderTitleStack = () => {
        const { sprint_id } = this.props
        return (
            <SidebarProperty key="titlestack">
              <SidebarTitle>
                <EditableSprintName sprint_id={sprint_id} />
              </SidebarTitle>
            </SidebarProperty>
        )
    }

    renderDescriptionStack = () => {
        const { sprint } = this.props
        return (
            <SidebarProperty key="descriptionstack">
              <div className="property-text">{sprint.description}</div>
            </SidebarProperty>
        )
    }

    renderReviewStack = () => {
        const { sprint, has_view_review_cycle_permission } = this.props
        return (
            <div key="reviewstack">
              { has_view_review_cycle_permission &&
                <SidebarProperty>
                  <MienFeature feature_name="review_schedule">
                    <div>
                      <SidebarSectionTitle title="Reviews" />
                      <SprintReviewPanel sprint_id={sprint.id} />
                    </div>
                  </MienFeature>
                </SidebarProperty>
              }
            </div>
        )
    }

    renderInfoStack() {
        const { sprint } = this.props
        return (
            <SidebarProperty key="infostack">
              <SidebarDetail label="Status">
                <EditableSprintStatus sprint_ids={[sprint.id]} project_id={sprint.project_id} />
              </SidebarDetail>

              <SidebarDetail label="Type">
                <EditableSprintType sprint_ids={[sprint.id]} project_id={sprint.project_id} />
              </SidebarDetail>

              <SidebarDetail label="Created">
                <Timestamp format="short-date" value={moment(sprint.created)}/>
              </SidebarDetail>

              <SidebarDetail label="First Activity">
                <Timestamp format="short-date" value={sprint.first_entry && moment(sprint.first_entry.start_time)}/>
              </SidebarDetail>

              <SidebarDetail label="Last Activity">
                <Timestamp format="short-date" value={sprint.last_entry && moment(sprint.last_entry.end_time)}/>
              </SidebarDetail>
            </SidebarProperty>
        )
    }

    renderDeadlineStack() {
        const { sprint } = this.props
        return (
            <SidebarProperty key="deadlinestack">
              <MienFeature feature_name="deadlines">
                <div>
                  <SidebarSectionTitle title="Deadlines" />
                  { map(sprint.deadline_ids, function (deadline_id, index) {
                        return <EditableSprintDeadline key={sprint.id} sprint_id={sprint.id} deadline_id={deadline_id}/>
                    })
                  }
                  <EditableSprintDeadline sprint_id={sprint.id} deadline_id={null}/>
                </div>
              </MienFeature>
            </SidebarProperty>
        )
    }

    renderMultiSummerStack() {
        const { sprint, sprint_id } = this.props
        return (
            <SidebarProperty key="multisummarystack">
              <SidebarSectionTitle title="Multiple Issue Summary" />
              <MultipleIssueSummary sprint_id={sprint_id}  project_id={sprint.project_id} auto_load={false} />
            </SidebarProperty>
        )
    }

    /* renderMultiSummerStack() {
     *     const { sprint, sprint_id } = this.props
     *     return (
     *         <SidebarProperty key="multisummarystack">
     *           <MienFeature feature_name="multiple_issue_summary">
     *             <SidebarSectionTitle title="Multiple Issue Summary" />
     *             <MultipleIssueSummary sprint_id={sprint_id}  project_id={sprint.project_id} auto_load={false} />
     *           </MienFeature>
     *         </SidebarProperty>
     *     )
     * } */
    
    render() {
        return (
            <SidebarContainer>
              {
                  [
                      this.renderCloneInfo(),
                      this.renderTitleStack(),
                      this.renderDescriptionStack(),
                      this.renderInfoStack(),
                      this.renderReviewStack(),
                      this.renderDeadlineStack(),
                      this.renderMultiSummerStack()
                  ]
              }
            </SidebarContainer>
        )
    }
}

export function mapStateToProps(state, props) {
    const { sprint_id, project_id } = props
    const project = getProject(state, project_id)
    const sprint = getSprint(state, sprint_id) || {}
    const has_view_review_cycle_permission = has_permission(state, project_id, 'has_view_review_cycle')
    
    return {
        sprint_id,
        sprint,
        project_id,
        project,
        has_view_review_cycle_permission
    }
}

export default connect(mapStateToProps)(SprintSidebar)

