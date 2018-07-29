import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class PopupPanelHeading extends Component {

    render() {
        const { children } = this.props
        return (
            <div className={css`font: ${theme.fonts.semibold_large};
                                color: ${theme.fonts.strong_text};
                                margin-top: 12px;
                                margin-bottom: 18px;
                                text-align: left;
                                justify-content: center;
                                `}>
                 {children}
            </div>
        )
    }
    
}

export default PopupPanelHeading

