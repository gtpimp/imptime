import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

const style = css`
font: ${theme.fonts.regular_normal};
color: ${theme.colours.normal_text};
padding-bottom: ${theme.spacing.one};
`

class IssueSidebarSectionTitle extends Component {

    render() {
        const { children } = this.props
        return (
            <div className={style}>
                {children}
            </div>
        )
    }
    
}
export default IssueSidebarSectionTitle
