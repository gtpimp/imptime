import React, {Component} from 'react'
import {withRouter, Link} from 'react-router-dom'
import styled from 'react-emotion'
import { default_theme as theme } from '../theme/default'


const GlamLink = styled('div')(props => ({color: theme.colours.link,
                                          font: theme.fonts.links,
                                          marginTop: '12px',
                                          textTransform: 'none',
                                          paddingLeft: '12px',
                                          borderBottom: '1px solid #eee',

                                          ':hover': {
                                              backgroundColor: '#eee',
                                              cursor: 'pointer',
                                          }}))

class SubMenuItemLink extends Component {

    render() {
        return (
            <GlamLink { ...this.props } > { this.props.children } </GlamLink>
        )
    }
}

export default SubMenuItemLink;
