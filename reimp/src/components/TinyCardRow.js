import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class TinyCardRow extends Component {
    
    render() {
        const { children } = this.props
        return (
            <div className={ content_row }>
              {children}
            </div>
        )
    }
}

export default TinyCardRow

const content_row = css`
display: flex;
flex: 1;
flex-direction: row;
justify-content: space-between;
padding: 24px;
border-bottom: 1px solid #E6E6E6;
font: ${theme.fonts.regular_huge};
`
