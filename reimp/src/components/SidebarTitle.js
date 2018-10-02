import React, {Component} from 'react'
import { css } from 'emotion'

import { default_theme as theme } from '../theme/default'
import EditableIssueTitle from './EditableIssueTitle'
import EditableSprintName from '../components/EditableSprintName'

const style = css`
display: flex;
flex-direction: column;
font: ${theme.fonts.bold_huge}
`

class SidebarTitle extends Component {

    render() {
        const { variant, variant_id, children } = this.props
        return (
            <div className={ style }>
              { variant === 'issue' &&
                <EditableIssueTitle issue_id={variant_id} />
              }
              { variant === 'sprint' &&
                <EditableSprintName sprint_id={variant_id} />
              }
              { children }
            </div>
        )
    }
}
export default SidebarTitle
