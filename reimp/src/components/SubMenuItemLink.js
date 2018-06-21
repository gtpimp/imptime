import React, {Component} from 'react'
import {withRouter, Link} from 'react-router-dom'
import glamorous from 'glamorous'
import { default_theme as theme } from '../glamorous/theme'


const GlamLink = glamorous(Link)({color: theme.colours.link,
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
                                  }})

class SubMenuItemLink extends Component {

    render() {
        const { to, label } = this.props
        
        <GlamLink to={to} label={label}>
    }
}
