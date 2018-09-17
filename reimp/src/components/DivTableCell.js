import React, {Component} from 'react'
import { cx, css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class DivTableCell extends Component {

    render() {

        let { onClick, extra_style, secondary } = this.props

        onClick = onClick || null
        extra_style = extra_style || {}
        secondary = secondary || false
        
        return (

            <div className={cx(css`display: flex;
                                font: ${theme.fonts.list_items};
                                padding-left: 6px;
                                vertical-align: middle;
                                align-items: center;
                                margin-left: 6px;
                                margin-right: 6px;
                                flex: ${extra_style.flex || "0 0 190px"};
                                max-width: ${extra_style.maxWidth || "auto"};
                                opacity: ${secondary ? 0.5 : 1.0};
                                color: ${theme.colours.normal_text};
                               `, extra_style)}
                 onClick={onClick}>
                 {this.props.children}
            </div>
        )
    }
    
}

export default DivTableCell

