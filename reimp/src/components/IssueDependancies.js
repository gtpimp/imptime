import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import PropertyStackComponent from './PropertyStackComponent'
import {
    ensureIssuesLoaded,
    getIssue,
    addIssueNeedsAnother,
    removeIssueNeedsAnother
} from '../actions/Issues'
import IssueName from './IssueName'
import IssueSelectorForm from './form/IssueSelectorForm'

class IssueDependancies extends Component {

    constructor(props) {
        super(props)
        this.onCreateIssueNeedingUs = this.onCreateIssueNeedingUs.bind(this)
        this.onCreateNeedsIssue = this.onCreateNeedsIssue.bind(this)
        this.onDeleteIssueNeedingUs = this.onDeleteIssueNeedingUs.bind(this)
        this.onDeleteNeedsIssue = this.onDeleteNeedsIssue.bind(this)
        this.onStartAddingNeedsIssue = this.onStartAddingNeedsIssue.bind(this)
        this.onStartAddingIssueNeedingUs = this.onStartAddingIssueNeedingUs.bind(this)
        this.onStopAddingIssueDependancy = this.onStopAddingIssueDependancy.bind(this)
        this.state = ({adding_needs_issue:false,
                       adding_issue_needs_us: false})
    }
    
    componentDidMount() {
        this.refresh(this.props)
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    onStartAddingNeedsIssue() {
        this.setState({adding_needs_issue:true})
    }

    onStartAddingIssueNeedingUs() {
        this.setState({adding_issue_needs_us:true})
    }
    
    onStopAddingIssueDependancy() {
        this.setState({adding_needs_issue:false,
                       adding_issue_needs_us: false})
    }

    onCreateIssueNeedingUs(new_values) {
        const { dispatch, issue_id } = this.props
        const other_issue_id = new_values.issue_id
        dispatch(addIssueNeedsAnother(issue_id, other_issue_id))
        this.onStopSelectingIssue()
    }
    
    onCreateNeedsIssue(new_values) {
        const { dispatch, issue_id } = this.props
        const other_issue_id = new_values.issue_id
        dispatch(addIssueNeedsAnother(other_issue_id, issue_id))
        this.onStopAddingIssueDependancy()
    }
    
    onDeleteIssueNeedingUs(other_issue_id) {
        const { dispatch, issue_id } = this.props
        dispatch(removeIssueNeedsAnother(issue_id, other_issue_id))
    }

    onDeleteNeedsIssue(other_issue_id) {
        const { dispatch, issue_id } = this.props
        dispatch(removeIssueNeedsAnother(other_issue_id, issue_id))
    }
    
    refresh(props) {
        const {dispatch, issue_id, issue} = props
        dispatch(ensureIssuesLoaded([issue_id]))
        if ( issue.issue_ids_needing_us ) {
            dispatch(ensureIssuesLoaded(issue.issue_ids_needing_us))
        }
        if ( issue.needs_issue_ids ) {
            dispatch(ensureIssuesLoaded(issue.needs_issue_ids))
        }
    }
    
    render() {
        const { issue } = this.props
        const { adding_issue_needs_us, adding_needs_issue } = this.state
        return (
            <PropertyStackComponent title="Dependancies">
              <div className="property-label">
                Other issues needed by this issue
              </div>
              <div className="property-value">
                { map(issue.needs_issues, (issue_id) =>
                    <div className="property-row">
                      <IssueName issue_id={issue_id} />
                      <div onClick={() => this.onDeleteNeedsIssue(issue_id)}
                           className="icon--small-delete" />
                    </div>
                  )}
                    <button className="button button--primary" onClick={this.onStartAddingIssueDependancy}>Add</button>
              </div>
              <div className="property-label">
                Other issues that need this issue
              </div>
              <div className="property-value">
                { map(issue.issues_needing_us, (issue_id) =>
                    <div className="property-row">
                      <IssueName issue_id={issue_id} />
                      <div onClick={() => this.onDeleteIssueNeedingUs(issue_id)}
                           className="icon--small-delete" />
                    </div>
                  )}
              </div>
              <button className="button button--primary" onClick={this.onStartAddingIssueDependancy}>Add</button>
              { adding_issue_needs_us &&
                <IssueSelectorForm onSubmitted={this.onCreateIssueNeedingUs} />
              }
              { adding_needs_issue &&
                <IssueSelectorForm onSubmitted={this.onCreateNeedsIssue} />
              }
            </PropertyStackComponent>
        )
    }  
}

function mapStateToProps(state, props) {

    const { issue_id } = props
    const issue = issue_id && getIssue(state, issue_id)
    
    return {
        issue_id,
        issue
    }
}

export default connect(mapStateToProps)(IssueDependancies)
