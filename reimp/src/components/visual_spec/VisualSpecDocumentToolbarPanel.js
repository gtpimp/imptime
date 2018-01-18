import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import '../../sass/toolbar-panel.css'
import ToolbarButton from '../toolbar/ToolbarButton'
import ReactTooltip from 'react-tooltip'
import { invalidateAllVisualSpecDocuments } from '../../actions/VisualSpecDocuments'
import { invalidateAllVisualSpecIssueAnnotations } from '../../actions/VisualSpecIssueAnnotations'
import VisualSpecIssueAnnotation from './VisualSpecIssueAnnotation'
import {
    cloneIssueForVisualSpec
} from '../../actions/VisualSpecDocuments'
import {
    getPageFlag
} from '../../actions/Page'
import { getIssue } from '../../actions/Issues'
import {
    selectItems,
    getSelectedItemIds
} from '../../actions/ItemList'
import {
    LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST,
    PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE
} from '../../actions/ItemListKeyRegistry.js'

class VisualSpecDocumentToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.invalidateComponents = this.invalidateComponents.bind(this)
        this.onCloneIssueClick = this.onCloneIssueClick.bind(this)
    }

    invalidateComponents() {
        const { dispatch } = this.props
        dispatch(invalidateAllVisualSpecDocuments())
        dispatch(invalidateAllVisualSpecIssueAnnotations())
    }

    onCloneIssueClick() {
        const { dispatch, selected_issue, active_visual_spec_document_id } = this.props
        dispatch(cloneIssueForVisualSpec(active_visual_spec_document_id, selected_issue.id,
                                         function(new_visual_spec_document_id, new_issue_id) {
                                             browserHistory.push('/projects/' + selected_issue.project_id +
                                                                 '/sprints/' + selected_issue.sprint_id +
                                                                 '/issues/' + new_issue_id +
                                                                 '/visualSpec/' + new_visual_spec_document_id)
                                             dispatch(selectItems(LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST, [new_issue_id]))
                                         })
        )
    }

    render() {
        const { selected_issue_id, active_visual_spec_document_id } = this.props
        return (
            <div className="toolbar-panel">
              { selected_issue_id && active_visual_spec_document_id &&
                <div className="button toolbar-button--small button--large button--primary"
                     onClick={this.onCloneIssueClick}>
                  + Copy
                </div>
              }
              <ToolbarButton tooltip="Refresh" icon="refresh" onClick={this.invalidateComponents}/>
              <ReactTooltip place="bottom" type="info" />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {} = props

    const selected_issue_ids = getSelectedItemIds(state, LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST)
    const selected_issue_id = (selected_issue_ids && selected_issue_ids.length > 0 && selected_issue_ids[0]) || null
    const selected_issue = getIssue(state, selected_issue_id) || {}
    const active_visual_spec_document_id = getPageFlag(state, PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                                       "active_visual_spec_document_id")

    return {
        selected_issue_id,
        selected_issue,
        active_visual_spec_document_id
    }
}


export default connect(mapStateToProps)(VisualSpecDocumentToolbarPanel)
