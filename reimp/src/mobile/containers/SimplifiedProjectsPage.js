import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import SimplifiedProjectList from '../components/SimplifiedProjectList'
import SimplifiedPage from './SimplifiedPage'
import {
    LIST_KEY__PROJECT_LIST,
} from '../../actions/ItemListKeyRegistry'

class SimplifiedProjectsPage extends Component {

    render() {
        return (
            <SimplifiedPage title="Projects">
              <SimplifiedProjectList list_key={LIST_KEY__PROJECT_LIST} />
            </SimplifiedPage>
        )
    }
}

function mapStateToProps(state, props) {
}

export default withRouter(connect(mapStateToProps)(SimplifiedProjectsPage))
