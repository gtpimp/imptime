import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

const heading = css`
font: ${theme.fonts.semibold_huge};
margin: 0;
padding: 0;
`

class PageSubTitle extends Component {
    render() {
        const { children } = this.props
        return (
            <h1 className={ heading }>{ children }</h1>
        )
    }
}
export default PageSubTitle
