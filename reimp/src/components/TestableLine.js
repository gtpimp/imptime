import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { cx, css } from 'emotion'

class TestableLine extends Component {

    constructor(props) {
        super(props)
        this.state = { is_hovered: false }
    }

    onHover = () => {
        this.setState({ is_hovered: true })
    }

    onUnhover = () => {
        this.setState({ is_hovered: false })
    }
    
    render() {
        const { testable_line, onDelete } = this.props
        const { is_hovered } = this.state

        return (
            <div className="issue-testable"
                 onMouseEnter={this.onHover}
                 onMouseLeave={this.onUnhover}
            >

              <div className={cx({[div_is_hovered]: is_hovered})}>
                {testable_line.order}&nbsp;
                {testable_line.instruction}
              </div>
              
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

const div_is_hovered = css`
  text-decoration: underline;
`
