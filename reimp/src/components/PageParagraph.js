import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

const paragraph = css`
margin-bottom: ${theme.spacing.vertical_section_gap};
margin-top: ${theme.spacing.two}
`

class PageParagraph extends Component {
    render() {
        const { children } = this.props
        return (
            <div className={paragraph}>{ children }</div>
        )
    }
}
export default PageParagraph
