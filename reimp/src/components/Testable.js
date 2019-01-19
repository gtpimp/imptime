import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import RenderedMarkdown from './RenderedMarkdown'
import classNames from 'classnames'

class Testable extends Component {

    render() {
        const { issue_id, testable, onDelete, onPromoteToIssue, extraActions } = this.props

        return (
            <div className="issue-testable">

              <div className="issue-testable__text" >
                <div>
                  {testable.name}
                </div>
                { map(testable.testable_steps, (testable_line) {
                      <EditableIssueTestableLine issue_id={issue_id}
                                                 testable_id={testable.id}
                                                 testable_line_id={testable_line.id} />
                })}

                !!old!!
                <RenderedMarkdown content={testable.enriched_steps || testable.steps} />
                !! old!!
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
                <div className="issue_sidebar__options">
                  { onPromoteToIssue &&
                    <div onClick={onPromoteToIssue} className="issue_sidebar__options__left">
                      Promote to issue
                    </div>
                  }
                  { onDelete &&
                    <div onClick={onDelete} className="issue_sidebar__options__left">
                      <span className="issue_sidebar__options__spacer">|</span>
                      Remove
                    </div>
                  }
                  { extraActions && map(extraActions, (extraAction, index) => {
                      return (
                          <div key={`testable_extra_actions_${testable.id}_${index}`}
                               onClick={extraAction.onClick}
                               className="issue_sidebar__options__left">
                            <span className="issue_sidebar__options__spacer">|</span>
                            {extraAction.label}
                          </div>
                          )
                    }
                  )}
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { issue_id, testable, onDelete, onPromoteToIssue, extraActions } = props
    
    return {
        testable,
        onDelete,
        onPromoteToIssue,
        extraActions
    }
}

export default connect(mapStateToProps)(Testable)
