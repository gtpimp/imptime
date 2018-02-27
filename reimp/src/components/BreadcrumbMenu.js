import React, {Component} from 'react'
import '../sass/breadcrumb.css'
import {connect} from 'react-redux'

class BreadcrumbMenu extends Component {

    render() {
        return (
            <div>
              <span className="breadcrumb-menu__item">list item one</span>
              <span className="breadcrumb-menu__item">list item two</span>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { label, to } = props
    const project_re = /(\/projects\/\d+)$/
    const sprint_re = /(\/sprints\/\d+)$/

    return {
    }
}

export default connect(mapStateToProps)(BreadcrumbMenu)
