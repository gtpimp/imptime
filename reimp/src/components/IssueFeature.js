import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { filter, first } from 'lodash'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import FeatureName from './FeatureName'
import Floater from "react-floater"
import Testable from './Testable'
import { css } from 'emotion'

class IssueFeature extends Component {

    componentDidMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    onFeatureClicked = (evt) => {
        const { history, issue, feature_id } = this.props
        evt.preventDefault()
        const project_id = issue.project_id
        history.push(`/projects/${project_id}/features/${feature_id}`)
    }

    render() {
        const { onDelete, feature_id, feature_testable } = this.props

        return (
            <div className="issue-feature">

              { feature_testable && 
                <Floater key={`feature_testable_${feature_id}`}
                         title={<div>This issue implements part of feature <FeatureName feature_id={feature_id} /></div>}
                         disableHoverToClick
                         event="hover"
                         eventDelay={0}
                         placement="bottom"
                         content={
                             <Testable key={`feature_testable_${feature_testable.id}`}
                                                       testable={feature_testable}
                                                       feature_id={feature_id}
                                                                  />
                                 }
                >
                             <div className={css`display: flex`} onClick={this.onFeatureClicked}>
                               <FeatureName feature_id={feature_id} />&nbsp;-&nbsp;{feature_testable.name}
                             </div>
                </Floater>
              }
              <div className="issue-feature__info">
                <div className="issue_sidebar__options">
                  { onDelete &&
                    <div onClick={onDelete} className="issue_sidebar__options__left">
                      Remove
                    </div>
                  }
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { issue_id, feature_id, feature_testable_id, onDelete } = props
    const issue = getIssue(state, issue_id)
    const feature_testables = issue.feature_testables
    const feature_testable = first(filter(feature_testables, (ft) => ft.id=feature_testable_id))
    
    return {
        issue,
        onDelete,
        feature_testable,
        feature_id
    }
}

export default withRouter(connect(mapStateToProps)(IssueFeature))
