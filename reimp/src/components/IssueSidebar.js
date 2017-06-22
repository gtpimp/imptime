import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {browserHistory} from 'react-router'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import EditableIssueTitle from '../components/EditableIssueTitle'
import EditableIssueDescription from '../components/EditableIssueDescription'
import EditableIssueAssignedUser from '../components/EditableIssueAssignedUser'
import EditableIssueComment from '../components/EditableIssueComment'
import EditableIssueAttachment from '../components/EditableIssueAttachment'
import EditableIssueInSprint from '../components/EditableIssueInSprint'
import EditableIssueStatus from '../components/EditableIssueStatus'
// import IssueDescription from './IssueDescription'
import Timestamp from './Timestamp'
import moment from 'moment'
import Sidebar from './Sidebar'
import {
    ensureIssuesLoaded,
    getIssue,
    populateEstimates
} from '../actions/Issues'
import { ensureUsersLoaded } from '../actions/Users'
import {format_hours} from '../actions/lib'
import {getProject} from '../actions/Projects'

class IssueSidebar extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.refresh(this.props)
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(props) {
        const {dispatch, issue_id, assignable_user_ids} = props
        dispatch(ensureIssuesLoaded([issue_id]))
        dispatch(ensureUsersLoaded(assignable_user_ids))
    }

    renderEstimates() {
        const {issue} = this.props
        return map(issue.all_estimates, function (estimate, index) {
            if (estimate.estimate_hours && estimate.estimate_user) {
                return (
                    <div key={estimate.estimate_user.id}>
                        {estimate.estimate_user.username}:{format_hours(estimate.estimate_hours)}
                    </div>
                )
            } else {
                return null
            }
        })
    }

    render() {

        const {issue, comments, attachments} = this.props

        if (issue && issue.id) {
            return (

                <Sidebar>
                    <PropertyStack>
                        { issue.id &&
                        <div>
                            <PropertyStackComponent>
                                <div className="text-component--readonly">
                                    #{issue.number}
                                </div>
                            </PropertyStackComponent>

                            <PropertyStackComponent>
                                <EditableIssueTitle issue_id={issue.id}/>
                            </PropertyStackComponent>

                            <PropertyStackComponent>
                                <EditableIssueDescription issue_id={issue.id}/>
                            </PropertyStackComponent>

                            <PropertyStackComponent title="Testables">
                            </PropertyStackComponent>

                            <PropertyStackComponent title="Assigned User">
                                <EditableIssueAssignedUser issue_ids={[issue.id]} project_id={issue.project_id}/>
                            </PropertyStackComponent>

                            <PropertyStackComponent title="Issue Status">
                                <EditableIssueStatus issue_ids={[issue.id]} project_id={issue.project_id}/>
                            </PropertyStackComponent>

                            <PropertyStackComponent title="Sprint Name">
                                <EditableIssueInSprint issue_ids={[issue.id]}/>
                            </PropertyStackComponent>

                            <PropertyStackComponent title="Attachments">
                                { map(attachments, function (attachment, index) {
                                    return <EditableIssueAttachment key={attachment.id} issue_id={issue.id} attachment_id={attachment.id}/>
                                })
                                }
                                <EditableIssueAttachment issue_id={issue.id} attachment_id={null}/>
                            </PropertyStackComponent>

                            <PropertyStackComponent title="Comments">
                            {/* { map(comments, function (comment, index) {
                             *     return <EditableIssueComment key={comment.id} issue_id={issue.id} comment_id={comment.id}/>
                             * })
                             * }*/}
                                <EditableIssueComment issue_id={issue.id} comment_id={null}/>
                            </PropertyStackComponent>

                            <PropertyStackComponent>
                                { this.renderEstimates() }
                                <button onClick={this.openEstimateEditor}>Estimates</button>
                            </PropertyStackComponent>
                        </div>
                        }
                    </PropertyStack>
                </Sidebar>
            )
        } else {
            return null
        }
    }
}

function mapStateToProps(state, props) {
    const {issue_id, sprint_id, project_id} = props
    const issue = getIssue(state, issue_id) || {}
    const project = getProject(state, project_id) || {}
    const assignable_user_ids = project.allowed_user_ids || []
    populateEstimates(state, issue)

    return {
        issue: issue || {},
        issue_id: issue_id,
        comments: issue.comments,
        attachments: issue.attachments,
        sprint_id: sprint_id,
        project_id: project_id,
        assignable_user_ids: assignable_user_ids,
    }
}

export default connect(mapStateToProps)(IssueSidebar)


/*{ { false &&
 <PropertyStack>
 <PropertyStackComponent>
 <IssueTitle issue={issue} mode='view-value'/>
 <IssueTitle issue={issue} mode='view-empty-state'/>
 <IssueTitle issue={issue} mode='edit'/>
 </PropertyStackComponent>
 <PropertyStackComponent>
 <IssueDescription issue={issue} mode='view-value'/>
 <IssueDescription issue={issue} mode='view-empty-state'/>
 <IssueDescription issue={issue} mode='edit'/>
 </PropertyStackComponent>
 </PropertyStack>
 }
 { false &&
 <div>
 <PropertyStackComponent>
 <div className="property--parent-title">
 <div className="property-label-1">Katalyst</div>
 </div>
 <div className="property--title">
 <div className="property-label-2">Sprinasdfdsafdasfdsafasfasfdasfasfasfdsaasfasft 3</div>
 </div>
 </PropertyStackComponent>
 <PropertyStackComponent>
 <div className="property-text">Interactive Prototype and develppment of Nunc a adipiscing parturient ullamcorper parturient adipiscing scelerisque donec risus penatibus
 parturient.
 </div>
 </PropertyStackComponent>
 <PropertyStackComponent>
 <div className="named-property">
 <div className="named-property__name">Created</div>
 <div className="named-property__value"><Timestamp format="short-date" value={moment()}/></div>
 </div>
 </PropertyStackComponent>
 <PropertyStackComponent>
 <div className="named-property">
 <div className="named-property__name">First Activity</div>
 <div className="named-property__value"><Timestamp format="short-date" value={moment()}/></div>
 </div>
 </PropertyStackComponent>
 <PropertyStackComponent>
 I am your issues sidebar for {issue_id}
 </PropertyStackComponent>
 </div> }
 }*/
