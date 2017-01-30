import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import IssueTitle from './IssueTitle'
import IssueDescription from './IssueDescription'
import Timestamp from './Timestamp'
import moment from 'moment'
import Sidebar from './Sidebar'

class IssueSidebar extends Component {

    constructor(props) {
        super(props)
        this.navigateToIssuesPage = this.navigateToIssuesPage.bind(this)
    }

    navigateToIssuesPage() {
        const {project_id, sprint_id} = this.props
        browserHistory.push('/projects/' + project_id + '/sprints/' + sprint_id + '/issues');
    }

    render() {

        const {issue_id} = this.props
        const issue = { title: 'Make the thing '}
            // mode: 'stack-view' || 'stack-view-extended' || 'edit'
        return (

            <Sidebar>
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
                </div>
                }



            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {
    const {issue_id, sprint_id, project_id} = props
    return {
        issue_id: issue_id,
        sprint_id: sprint_id,
        project_id: project_id,
        mode: 'view-all' || 'view-populated'
    }
}

export default connect(mapStateToProps)(IssueSidebar)

