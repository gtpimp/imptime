import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'

class SimplifiedTitle extends Component {

    render() {
        const { children } = this.props
        return (
            <div className= { title_row }>
              <div className={ title }>
                { children }
              </div>
            </div>
        )
        
    }
}

const title_row = css`
display: flex;
flex: 1;
align-items: center;
justify-content: flex-start;
`

const title = css`
font: ${theme.fonts.semibold_massive};
`

export default SimplifiedTitle
