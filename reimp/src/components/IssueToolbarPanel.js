import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import { get_selected_issue_ids } from '../actions/Page'
import { ensureIssuesLoaded, getIssue } from '../actions/Issues'
import { PAGE_KEY__ISSUES_PAGE } from '../actions/ItemListKeyRegistry'
import {
    reorderIssue,
    startCandidateIssue,
    updateCandidateSubject,
    cancelCandidateIssue,
    saveCandidateIssue,
    updateIssueToggleAsFeature,
    groupIssuesIntoFeature,
    ungroupIssuesIntoFeature
} from '../actions/Issue'

class IssueToolbarPanel extends Component {

    constructor(props) {
        super(props)
        /* this.reorderIssue = this.reorderIssue.bind(this)
         * this.onStartCandidateIssue = this.onStartCandidateIssue.bind(this)
         * this.onSaveCandidateIssue = this.onSaveCandidateIssue.bind(this)
         * this.onCancelCandidateIssue = this.onCancelCandidateIssue.bind(this)*/
        this.onMakeFeatureClick = this.onMakeFeatureClick.bind(this)
        this.onUnmakeFeatureClick = this.onUnmakeFeatureClick.bind(this)
        /* this.toggleExpandFeatures = this.toggleExpandFeatures.bind(this)
         * this.groupTogether = this.groupTogether.bind(this)
         * this.ungroupTogether = this.ungroupTogether.bind(this)
         * this.openTagEditor = this.openTagEditor.bind(this)
         * this.closeTagEditor = this.closeTagEditor.bind(this)
         * this.openEstimateEditor = this.openEstimateEditor.bind(this)
         * this.closeEstimateEditor = this.closeEstimateEditor.bind(this)*/
    }

    componentDidMount() {
        const {dispatch, sprint_id, issue_ids} = this.props
        dispatch(ensureIssuesLoaded(issue_ids))
    }

    componentWillReceiveProps() {
        const {dispatch, issue_ids} = this.props
        dispatch(ensureIssuesLoaded(issue_ids))
    }
    
    onNewLabelClick() {
        console.log('new label clicked')
    }

    onCollapseFeaturesClick() {
        console.log('collapse features clicked')
    }

    onExpandFeaturesClick() {
        console.log('expand features clicked')
    }

    onExpandFeaturesClick() {
        console.log('expand features clicked')
    }

    onMakeFeatureClick() {
        event.stopPropagation()
        const {dispatch, issue_ids} = this.props
        dispatch(updateIssueToggleAsFeature(issue_ids, true))
    }

    onUnmakeFeatureClick() {
        event.stopPropagation()
        const {dispatch, issue_ids} = this.props
        dispatch(updateIssueToggleAsFeature(issue_ids, false))
    }

    onGroupClick() {
        console.log('group clicked')
    }

    onUngroupClick() {
        console.log('ungroup clicked')
    }

    onAttachClick() {
        console.log('attach clicked')
    }

    onAssignClick() {
        console.log('assign clicked')
    }

    onEstimateClick() {
        console.log('estimate clicked')
    }

    render() {

        const { issue_ids, issue } = this.props
        
        if (issue_ids.length == 0 ) {
            return null
        }
        if ( ! issue ) {
            return null
        } 
        
        return (
            <div className="toolbar-panel">
                Issue:
                <ToolbarButton flavour="toggle" icon="stars" isEnabled={issue.can_group_issues} onEnable={this.onMakeFeatureClick} onDisable={this.onUnmakeFeatureClick}/>
                <ToolbarButton icon="label" onClick={this.onNewLabelClick}/>
                <ToolbarButton icon="expand_more" onClick={this.onExpandFeaturesClick}/>
                <ToolbarButton icon="expand_less" onClick={this.onCollapseFeaturesClick}/>
                <ToolbarButton icon="call_merge" onClick={this.onGroupClick}/>
                <ToolbarButton icon="call_split" onClick={this.onUngroupClick}/>
                <ToolbarButton icon="attach_file" onClick={this.onAttachClick}/>
                <ToolbarButton icon="exit_to_app" onClick={this.onAssignClick}/>
                <ToolbarButton icon="alarm" onClick={this.onEstimateClick}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const selected_issue_ids = get_selected_issue_ids(state, PAGE_KEY__ISSUES_PAGE)
    const issue = selected_issue_ids && selected_issue_ids.length > 0 && getIssue(state, selected_issue_ids[0])
    
    return {
        issue_ids: selected_issue_ids,
        issue: issue
    }
}


export default connect(mapStateToProps)(IssueToolbarPanel)
