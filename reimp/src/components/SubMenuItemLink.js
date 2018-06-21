import React, {Component} from 'react'
import {withRouter, Link} from 'react-router-dom'
import glamorous from 'glamorous'
import { default_theme as theme } from '../glamorous/theme'

const navbar_submenu_item = {color: theme.colours.link,
                             font: theme.fonts.links,
                             marginTop: '12px',
                             textTransform: 'none',
                             paddingLeft: '12px',
                             borderBottom: '1px solid #eee',

                             ':hover': {
                                 color: '#333',
                                 backgroundColor: '#eee',
                                 cursor: 'pointer',
                                 border: '1px solid red',
                             }}

const GlamLink = glamorous(Link)(navbar_submenu_item)

class SubMenuItemLink extends Component {
    render() {
        <GlamLink to={to}>
    }
}
