import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import Breadcrumb from './Breadcrumb'
import { areBreadcrumbsActive, getBreadcrumbs } from '../actions/Breadcrumbs'
import styled from 'react-emotion'

const BreadcrumbsDiv = styled('div')(props => (({opacity: props.is_active ? 1: 0.2})))

class Breadcrumbs extends Component {

    render() {
        const {breadcrumbs, is_active} = this.props
        return (
            <BreadcrumbsDiv is_active={is_active}>
              { map(breadcrumbs, (breadcrumb, index) =>
                  <Breadcrumb key={index} breadcrumb={breadcrumb} is_last={index + 1 === breadcrumbs.length}/>
              )}
            </BreadcrumbsDiv>
        )
    }
}

function mapStateToProps(state, props) {

    const is_active = areBreadcrumbsActive(state)
    const breadcrumbs = getBreadcrumbs(state)
    
    return {
        is_active: is_active,
        breadcrumbs: breadcrumbs
    }
}

export default connect(mapStateToProps)(Breadcrumbs)
