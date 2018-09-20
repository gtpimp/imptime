import React, {Component} from 'react'
import { css } from 'emotion'

import { default_theme as theme } from '../theme/default'
import EditableIssueTitle from './EditableIssueTitle'

const style = css`
display: flex;
flex-direction: column;
font: ${theme.fonts.bold_huge}
`

class IssueSidebarTitle extends Component {

    render() {
        const { issue_id, children } = this.props
        return (
            <div className={ style }>
              <EditableIssueTitle issue_id={issue_id} />
              { children }
            </div>
        )
    }
}
export default IssueSidebarTitle
