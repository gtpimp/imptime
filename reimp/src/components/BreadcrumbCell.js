import React, {Component} from 'react'
import {css} from 'emotion'
import { default_theme as theme } from '../theme/default'

class BreadcrumbCell extends Component {

    render() {

        const {children, onMouseLeave} = this.props

        return (
            <div className={css`display: inline-flex;
                            cursor: pointer;
                            text-decoration: none;
                            align-items: center;
                            color: ${theme.colours.strong_text};
                            ':last-child': {
                              font: ${theme.fonts.breadcrumb_selected};
                            }
                        `}
                 onMouseLeave={onMouseLeave}
            >
              {children}
            </div>
        )
    }
    
}

export default BreadcrumbCell
