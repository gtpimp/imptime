import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class PopupPanelLink extends Component {

    render() {
        const { children, active } = this.props
        return (
            <div className={css`color: ${theme.colours.link};
                                font: ${theme.fonts.link};
                                font-weight: ${active ? "bold" : "normal"};
                                text-transform: none;
                                padding-top: 12px;
                                text-align: left;
                                justify-content: center;
                                cursor: pointer;
                                &:hover {
                                    font-weight: bold;
                                    cursor: 'pointer';
                                }`}>
                 {children}
            </div>
        )
    }
    
}

export default PopupPanelLink

