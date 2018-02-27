import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/breadcrumb.css'

class BreadcrumbMenu extends Component {

    render() {
        return (
            <div>
              <ul>
                <li>list item one</li>
                <li>list item two</li>
              </ul>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
}

export default connect(mapStateToProps)(BreadcrumbMenu)
