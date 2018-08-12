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
import IssueStatus from './IssueStatus'
import IssueSelectorForm from './form/IssueSelectorForm'
import ModalDialog from './ModalDialog'
import PopupPanelHeading from './PopupPanelHeading'

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

    onCreateNeedsIssue(new_values) {
        const { dispatch, issue_id } = this.props
        const other_issue_id = new_values.issue_id
        dispatch(addIssueNeedsAnother(issue_id, other_issue_id))
        this.onStopAddingIssueDependancy()
    }
    
    onCreateIssueNeedingUs(new_values) {
        const { dispatch, issue_id } = this.props
        const other_issue_id = new_values.issue_id
        dispatch(addIssueNeedsAnother(other_issue_id, issue_id))
        this.onStopAddingIssueDependancy()
    }
    
    onDeleteNeedsIssue(other_issue_id) {
        const { dispatch, issue_id } = this.props
        if ( ! window.confirm("Remove this dependancy?" ) ) {
            return false
        }
        dispatch(removeIssueNeedsAnother(issue_id, other_issue_id))
    }
    
    onDeleteIssueNeedingUs(other_issue_id) {
        const { dispatch, issue_id } = this.props
        if ( ! window.confirm("Remove this dependancy?" ) ) {
            return false
        }
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
            <PropertyStackComponent>
              <div className="property-label">
                Other issues needed by this issue
              </div>
              <div className="property-value">
                { map(issue.needs_issue_ids, (issue_id) =>
                    <div className="property-row" key={issue_id}>
                      <IssueName issue_id={issue_id} />
                      &nbsp;(<IssueStatus issue_id={issue_id} />)
                      <div onClick={() => this.onDeleteNeedsIssue(issue_id)}
                           className="icon--small-delete" />
                    </div>
                  )}
                    <div className="icon--add" onClick={this.onStartAddingNeedsIssue}></div>
              </div>
              <div className="property-label">
                Other issues that need this issue
              </div>
              <div className="property-value">
                { map(issue.issue_ids_needing_us, (issue_id) =>
                    <div className="property-row" key={issue_id}>
                      <IssueName issue_id={issue_id} />
                      &nbsp;(<IssueStatus issue_id={issue_id} />)
                      <div onClick={() => this.onDeleteIssueNeedingUs(issue_id)}
                           className="icon--small-delete" />
                    </div>
                  )}
              </div>
              <div className="icon--add" onClick={this.onStartAddingIssueNeedingUs}></div>
              { adding_needs_issue &&
                <ModalDialog isOpen={true}
                             onClose={this.onStopAddingIssueDependancy}
                             title={"Adding issue dependancy"}
                             variant="large">
                  <PopupPanelHeading>
                    Select an issue that is needed by issue
                    <IssueName issue_id={issue.id} />
                  </PopupPanelHeading>
                  <IssueSelectorForm onSubmitted={this.onCreateNeedsIssue} />
                </ModalDialog>
              }
              { adding_issue_needs_us &&
                <ModalDialog isOpen={true}
                             onClose={this.onStopAddingIssueDependancy}
                             title={"Adding issue dependancy"}
                             variant="large">
                  <PopupPanelHeading>
                    Select an issue that needs issue
                    <IssueName issue_id={issue.id} />
                  </PopupPanelHeading>
                  <IssueSelectorForm onSubmitted={this.onCreateIssueNeedingUs} />
                </ModalDialog>
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
