import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'

class SimplifiedParagraph extends Component {

    render() {
        const { children } = this.props
        return (
            <div className={css`color: ${theme.colours.normal_text};
                                font: ${theme.fonts.regular_normal};
                                font-weight: normal;
                                text-transform: none;
                                padding-bottom: 12px;
                                text-align: left;
                                justify-content: center;
                                `}>
                 {children}
            </div>
        )
    }
    
}

export default SimplifiedParagraph

