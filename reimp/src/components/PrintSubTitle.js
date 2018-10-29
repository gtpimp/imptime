import React, {Component} from 'react'
import { css } from 'emotion'

import { default_theme as theme } from '../theme/default'

const style = css`
display: flex;
flex-direction: column;
font: ${theme.fonts.bold_large}
`

class PrintSubTitle extends Component {

    render() {
        const { children } = this.props
        return (
            <div className={ style }>
              { children }
            </div>
        )
    }
}
export default PrintSubTitle
