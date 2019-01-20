import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'

class TestableLine extends Component {

    render() {
        const { testable_line, onDelete } = this.props

        return (
            <div className="issue-testable">

              <div className="issue-testable__info" >
                { testable_line.quality_error &&
                  <div className={classNames("issue_sidebar--textarea--readonly",
                                             {"issue-testable__quality_error":testable_line.quality_error})}>
                    { testable_line.quality_error &&
                      <div className="issue_testable__quality_error_reason">
                        Low quality testable line: {testable_line.quality_error}
                      </div>
                    }
                  </div>      
                }
                <div className="issue_sidebar__options">
                  { onDelete &&
                    <div onClick={onDelete} className="issue_sidebar__options__left">
                      <span className="issue_sidebar__options__spacer">|</span>
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
    
    const { testable_line, onDelete } = props
    
    return {
        testable_line,
        onDelete
    }
}

export default connect(mapStateToProps)(TestableLine)
