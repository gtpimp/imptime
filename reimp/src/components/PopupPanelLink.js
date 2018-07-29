import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class PopupPanelLink extends Component {

    render() {
        const { children } = this.props
        return (
            <div className={css`color: ${theme.colours.link};
                                font: ${theme.fonts.link};
                                text-transform: none;
                                font-weight: normal;
                                padding-top: 12px;
                                text-align: left;
                                justify-content: center;
                                cursor: pointer;
                                &:hover: {
                                    cursor: 'pointer';
                                }`}>
                 {children}
            </div>
        )
    }
    
}

export default PopupPanelLink

