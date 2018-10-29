import React, {Component} from 'react'
import { css } from 'emotion'

import { default_theme as theme } from '../theme/default'

const style = css`
display: flex;
flex-direction: column;
text-align: center;
font: ${theme.fonts.bold_huge}
`

class PrintTitle extends Component {

    render() {
        const { children } = this.props
        return (
            <div className={ style }>
              { children }
            </div>
        )
    }
}
export default PrintTitle
