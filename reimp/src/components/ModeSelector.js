import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router'
import '../sass/mode-selector.css'
class Breadcrumb extends Component {

    render() {
        return (
            <div className="mode-selector">
              <select className="mode-selector__options">
                <option>Dev</option>
                <option>Manager</option>
                <option>Finance</option>
                <option>Client</option>
                <option>Spec</option>
              </select>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
}

export default connect(mapStateToProps)(withRouter(Breadcrumb))
