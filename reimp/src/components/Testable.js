import React, {Component} from 'react'
import {connect} from 'react-redux'
import RenderedMarkdown from './RenderedMarkdown'
import classNames from 'classnames'

class Testable extends Component {

    render() {
        const { testable, onDelete, onPromoteToIssue } = this.props

        return (
            <div className="issue-testable">

              <div>
                {testable.name}
              </div>
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
                { onDelete &&
                  <div onClick={onDelete} className="icon--small-delete" />
                }
                { onPromoteToIssue &&
                  <div className="button button-secondary" onClick={onPromoteToIssue}>
                    Promote to issue
                  </div>
                }
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { testable, onDelete, onPromoteToIssue } = props
    
    return {
        testable,
        onDelete,
        onPromoteToIssue
    }
}

export default connect(mapStateToProps)(Testable)
