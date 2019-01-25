import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { cx, css } from 'emotion'
import {default_theme as theme} from '../theme/default'

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

    onCreateLineAbove = (evt) => {
        const { onCreateLine, testable_line } = this.props
        evt.stopPropagation()
        onCreateLine(testable_line.order)
    }

    onCreateLineBelow = (evt) => {
        const { onCreateLine, testable_line } = this.props
        evt.stopPropagation()
        onCreateLine(testable_line.order+1)
    }

    render_hover_menu() {
        const { onDelete, onCreateLine } = this.props
        return (
            <div className={cx("issue_sidebar__options", hover_menu)}>
              <div className={hover_menu_item}>
                { onDelete &&
                  <div onClick={onDelete} className="issue_sidebar__options__left">
                    <span className="issue_sidebar__options__spacer">|</span>
                    Remove
                  </div>
                }
              </div>
              <div className={hover_menu_item}>
                { onCreateLine &&
                  <div onClick={this.onCreateLineAbove} className="issue_sidebar__options__left">
                    <span className="issue_sidebar__options__spacer">|</span>
                    Add above
                  </div>
                }
              </div>
              <div className={hover_menu_item}>
                { onCreateLine &&
                  <div onClick={this.onCreateLineBelow} className="issue_sidebar__options__left">
                    <span className="issue_sidebar__options__spacer">|</span>
                    Add below
                  </div>
                }
              </div>
            </div>
        )
    }
    
    render() {
        const { testable_line } = this.props
        const { is_hovered } = this.state

        return (
            <div className={issue_testable_line}
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

                { is_hovered && this.render_hover_menu() }
                  
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { testable_line, onDelete, onCreateLine } = props
    
    return {
        testable_line,
        onDelete,
        onCreateLine
    }
}

export default connect(mapStateToProps)(TestableLine)

const div_is_hovered = css`
text-decoration: underline;
`

const issue_testable_line = css`
display: flex;
justify-content: space-between;
`

const hover_menu = css`
display: flex;
`

const hover_menu_item = css`
padding-left: ${theme.spacing.horizontal_row_space_tight}
`
