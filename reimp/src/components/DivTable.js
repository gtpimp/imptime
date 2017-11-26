import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/div-table.css'
class DivTable extends Component {

    render() {
        return (
            <div className="div-table">
              { this.props.renderHeader &&
                <div className="div-table__header">
                  {this.props.renderHeader()}
                </div>
              }
              <div className="div-table__body">
                {this.props.children}
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(DivTable)
