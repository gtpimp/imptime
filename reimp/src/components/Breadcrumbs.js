import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/breadcrumbs.css'
import Breadcrumb from './Breadcrumb'

class Breadcrumbs extends Component {

    render() {
        const {breadcrumbs} = this.props

        return (
            <div className="breadcrumbs">
                { breadcrumbs.map((breadcrumb, index) =>
                    <Breadcrumb breadcrumb={breadcrumb} is_last={index + 1 === breadcrumbs.length}/>
                )}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(Breadcrumbs)