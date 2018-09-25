import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

const style = css`
font: ${theme.fonts.regular_normal};
color: ${theme.colours.normal_text};
margin: 0;
padding: 0;
padding-top: ${theme.spacing.two};
`

class SidebarSectionTitle extends Component {

    render() {
        const { title } = this.props
        return (
            <p className={style}>{title}</p>
        )
    }
    
}
export default SidebarSectionTitle
