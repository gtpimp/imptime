import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import RenderedMarkdown from './RenderedMarkdown'
import classNames from 'classnames'

class IssueTestable extends Component {

    componentDidMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    render() {
        const { testable, onDelete, onPromoteToIssue } = this.props

        return (
            <div className="issue-testable">

              <div className="issue-testable__text" >
                <RenderedMarkdown content={testable.enriched_steps || testable.steps} />
              </div>

              <div className="issue-testable__info" >
                { testable.quality_error &&
                  <div className={classNames("issue_sidebar--textarea--readonly",
                                             {"issue-testable__quality_error":testable.quality_error})}>
                    <h1 className="issue-testable__testable-name">{testable.name}</h1>
                    { testable.quality_error &&
                      <div className="issue_testable__quality_error_reason">
                        Low quality testable: {testable.quality_error}
                      </div>
                    }
                  </div>      
                }
                <div className="issue-testable__options">
                  { onPromoteToIssue &&
                    <div onClick={onPromoteToIssue} className="issue-testable__options__left">
                      Promote to issue
                    </div>
                  }
                  { onDelete &&
                    <div onClick={onDelete} className="issue-testable__options__right">
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
    
    const { issue_id, testable, onDelete } = props
    const issue = getIssue(state, issue_id)
    
    return {
        issue,
        testable,
        onDelete
    }
}


export default connect(mapStateToProps)(IssueTestable)
