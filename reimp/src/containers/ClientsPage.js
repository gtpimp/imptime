import React, {Component} from 'react'
import {connect} from 'react-redux'

class ClientsPage extends Component {

    render() {

        return (
            <div>
                {/*<ProjectList key="projects" list_key={LIST_KEY__PROJECT_LIST}/>*/}
                Clients
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {}
}

export default connect(mapStateToProps)(ClientsPage)

