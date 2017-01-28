import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/breadcrumb.css'
class PropertyStackComponent extends Component {

    render() {
        return (
            <div className="property-stack-component">
                <div className="property-stack-component__content">
                    {this.props.children}
                </div>
                <div className="property-stack-component__icons">
                    <div className="property-stack-component__icon"><i className="material-icons">edit</i></div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
    }
}


export default connect(mapStateToProps)(PropertyStackComponent)