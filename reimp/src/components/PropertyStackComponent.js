import React, {Component} from 'react'
import {connect} from 'react-redux'
// import '../sass/breadcrumb.css'
class PropertyStackComponent extends Component {

    render() {
        return (
            <div className="property-stack-component">
                <div className="property-stack-component__inner">
                  { this.props.title &&
                    <div key="title" className="property-stack-component__title">
                      {this.props.title}
                    </div>
                  }
                  { this.props.children &&
                    <div key="content" className="property-stack-component__content">
                      {this.props.children}
                    </div>
                  }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(PropertyStackComponent)
