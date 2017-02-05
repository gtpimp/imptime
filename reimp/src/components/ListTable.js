import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/list-table.css'
class ListTable extends Component {

    render() {
        return (
            <div className="list-table">
                <div className="list-table__inner">
                    <table className="table table--list-table">
                        { this.props.renderHeader &&
                        <thead>
                        {this.props.renderHeader()}
                        </thead>
                        }
                        <tbody>
                        {this.props.children}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(ListTable)