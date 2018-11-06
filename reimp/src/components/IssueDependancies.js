import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import map from 'lodash/map'

import { default_theme as theme } from '../theme/default'
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

import SidebarProperty from './SidebarProperty'
import SidebarAddButton from './SidebarAddButton'

const info_tip = css`
color: ${theme.colours.normal_text};
padding: ${theme.spacing.one} 0 ${theme.spacing.one} 0;
font-size: 12px;
}
`

const issue_link = css`
width: 100%;
color: ${theme.colours.strong_text};
padding: ${theme.spacing.one} 0 ${theme.spacing.one} 0;
}
`

const remove_link = css`
display: inline-block;
color: ${theme.colours.notok};
padding-left: 5px;
cursor: pointer;
`

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

    renderIssueRow = (issue_id) => {
        return (
            <div key={issue_id}>
              <div className={ issue_link }>
                <IssueName issue_id={issue_id} /> (<IssueStatus issue_id={issue_id} />)
            <div className={ remove_link } onClick={() => this.onDeleteNeedsIssue(issue_id)}>
              Remove
            </div>
              </div>
            </div>
        )
    }

    renderDependantIssueRow = (issue_id) => {
        return (
            <div key={issue_id}>
              <div className={ issue_link }>
                <IssueName issue_id={issue_id} /> (<IssueStatus issue_id={issue_id} />)
            <div className={ remove_link } onClick={() => this.onDeleteIssueNeedingUs(issue_id)}>
              Remove
            </div>
              </div>
            </div>
        )
    }

    renderPredecessorIssues = () => {
        const { issue } = this.props
        return (
            <SidebarProperty key="predecessorissues">
              <div className={ info_tip }>
                Required issues that must be closed first.
              </div>
              <div>
                { map(issue.needs_issue_ids, (issue_id) =>
                    this.renderIssueRow(issue_id)
                )}
                <SidebarAddButton
                    onButtonClick={this.onStartAddingNeedsIssue}
                    label="Add required issue" />
              </div>
            </SidebarProperty>
        )
    }

    renderDependantIssues = () => {
        const { issue } = this.props
        return (
            <SidebarProperty key="dependantissues">
              <div className={ info_tip }>
                Waiting issues that can't be worked on until closing this issue.
              </div>
              <div>
                { map(issue.issue_ids_needing_us, (issue_id) =>
                    this.renderDependantIssueRow(issue_id)
                )}
              </div>
              <SidebarAddButton
                  onButtonClick={this.onStartAddingIssueNeedingUs}
                  label="Add waiting issue" />
            </SidebarProperty>
        )
    }

    renderModals = () => {
        const { issue } = this.props
        const { adding_issue_needs_us, adding_needs_issue } = this.state
        return (
            <div key="issuedependencymodals">
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
            </div>
        )
    }
    
    render() {
        return (
            [
                this.renderPredecessorIssues(),
                this.renderDependantIssues(),
                this.renderModals()
            ]
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
