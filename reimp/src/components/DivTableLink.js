import React, {Component} from 'react'
import { css } from 'emotion'
import {Link} from 'react-router-dom'

class DivTableLink extends Component {

    render() {
        let { onClick, to, extra_style } = this.props
        onClick = onClick || null
        extra_style = extra_style = {}
        return (

            <Link to={to}
                  className={css`flex: ${extra_style.flex || "0 0 190px"};
                                 max-width: ${extra_style.maxWidth || "auto"};
                                 cursor=pointer;
                                 &:hover { 
                                   text-decoration: underline; 
                                 }`}
                  onClick={onClick}
            >
                 {this.props.children}
            </Link>
        )
    }
}

export default DivTableLink

