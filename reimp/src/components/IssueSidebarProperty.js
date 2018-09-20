import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

const style = css`
display: flex;
flex-direction: column;
position: relative;
padding-top: ${theme.spacing.one};
padding-bottom: ${theme.spacing.one};
`

class IssueSidebarProperty extends Component {

    render() {
        const { title, children } = this.props
        return (
            <div className={ style }>
              {children}
            </div>
        )
    }
}
export default IssueSidebarProperty
