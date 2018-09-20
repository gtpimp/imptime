import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

const style = css`
display: flex;
padding: ${theme.spacing.three};
flex-direction: column;
flex: 1;
`

class SidebarContainer extends Component {
    render() {
        const { children } = this.props
        return (
            <div className={style}>
              {children}
            </div>
        )
    }
}
export default SidebarContainer
