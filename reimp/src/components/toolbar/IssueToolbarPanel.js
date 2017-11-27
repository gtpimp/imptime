import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import ReactTooltip from 'react-tooltip'
import { get_selected_issue_ids } from '../../actions/Page'
import { LIST_KEY__ISSUE_LIST, PAGE_KEY__ISSUES_PAGE } from '../../actions/ItemListKeyRegistry'
import {
    ensureIssuesLoaded,
    getIssue,
    groupUnsortedIssuesIntoFeature,
    updateIssueToggleAsFeature,
    ungroupIssuesIntoFeature
} from '../../actions/Issues'
import {
    setItemFlag
} from '../../actions/ItemList'
import {
    setPageFlag,
    getPageFlag
} from '../../actions/Page'
import ToggleButton from './ToggleButton'

class IssueToolbarPanel extends Component {

    constructor(props) {
        super(props)
        /* this.reorderIssue = this.reorderIssue.bind(this)
         * this.onStartCandidateIssue = this.onStartCandidateIssue.bind(this)
         * this.onSaveCandidateIssue = this.onSaveCandidateIssue.bind(this)
         * this.onCancelCandidateIssue = this.onCancelCandidateIssue.bind(this)*/
        this.onMakeFeatureClick = this.onMakeFeatureClick.bind(this)
        this.onUnmakeFeatureClick = this.onUnmakeFeatureClick.bind(this)
        this.onCollapseFeaturesClick = this.onCollapseFeaturesClick.bind(this)
        this.onExpandFeaturesClick = this.onExpandFeaturesClick.bind(this)
        this.onGroupClick = this.onGroupClick.bind(this)
        this.onUngroupClick = this.onUngroupClick.bind(this)
        this.onIssueSidebarToggleClick = this.onIssueSidebarToggleClick.bind(this)
        /* this.toggleExpandFeatures = this.toggleExpandFeatures.bind(this)
         * this.groupTogether = this.groupTogether.bind(this)
         * this.ungroupTogether = this.ungroupTogether.bind(this)
         * this.openTagEditor = this.openTagEditor.bind(this)
         * this.closeTagEditor = this.closeTagEditor.bind(this)
         * this.openEstimateEditor = this.openEstimateEditor.bind(this)
         * this.closeEstimateEditor = this.closeEstimateEditor.bind(this)*/
    }

    componentDidMount() {
        const {dispatch, issue_ids} = this.props
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
        const {dispatch, issue_ids} = this.props
        dispatch(setItemFlag(LIST_KEY__ISSUE_LIST, issue_ids, 'expanded_issues', false))
    }

    onExpandFeaturesClick() {
        const {dispatch, issue_ids} = this.props
        dispatch(setItemFlag(LIST_KEY__ISSUE_LIST, issue_ids, 'expanded_issues', true))
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
        const {issue_ids, dispatch} = this.props
        dispatch(groupUnsortedIssuesIntoFeature(issue_ids))
    }

    onUngroupClick() {
        const {issue_ids, dispatch} = this.props
        dispatch(ungroupIssuesIntoFeature(issue_ids))
    }

    onIssueSidebarToggleClick(show_sidebar) {
        const { dispatch } = this.props
        dispatch(setPageFlag(PAGE_KEY__ISSUES_PAGE, "show_sidebar", show_sidebar))
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

        const { issue_ids, issue, show_sidebar } = this.props

        if (issue_ids.length === 0 ) {
            return null
        }
        if ( ! issue ) {
            return null
        }

        return (
            <div className="toolbar-panel">
              <ToggleButton value={show_sidebar}
                            onChange={this.onIssueSidebarToggleClick}
                            on_label={"Sidebar"}
                            off_label={"No sidebar"}
              />
              <ToolbarButton flavour="toggle" tooltip="Favourite" icon="stars" isEnabled={issue.can_group_issues} onEnable={this.onMakeFeatureClick} onDisable={this.onUnmakeFeatureClick}/>
              <ToolbarButton tooltip="Label" icon="label" onClick={this.onNewLabelClick}/>
              <ToolbarButton tooltip="Expand" icon="expand_more" onClick={this.onExpandFeaturesClick}/>
              <ToolbarButton tooltip="Contract" icon="expand_less" onClick={this.onCollapseFeaturesClick}/>
              <ToolbarButton tooltip="Merge" icon="call_merge" onClick={this.onGroupClick}/>
              <ToolbarButton tooltip="Split" icon="call_split" onClick={this.onUngroupClick}/>
              <ToolbarButton tooltip="Attach" icon="attach_file" onClick={this.onAttachClick}/>
              <ToolbarButton tooltip="Exit" icon="exit_to_app" onClick={this.onAssignClick}/>
              <ToolbarButton tooltip="Alarm" icon="alarm" onClick={this.onEstimateClick}/>
              <ReactTooltip place="bottom" type="info" />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const selected_issue_ids = get_selected_issue_ids(state, PAGE_KEY__ISSUES_PAGE)
    const issue = selected_issue_ids && selected_issue_ids.length > 0 && getIssue(state, selected_issue_ids[0])
    const show_sidebar = getPageFlag(state, PAGE_KEY__ISSUES_PAGE, "show_sidebar", false)

    return {
        issue_ids: selected_issue_ids,
        issue: issue,
        show_sidebar
    }
}


export default connect(mapStateToProps)(IssueToolbarPanel)
