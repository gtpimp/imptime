import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Route, Switch, withRouter } from 'react-router-dom'
import { setBrowserTitle } from '../../actions/Page'
import SimplifiedExecutiveSummaryPage from './SimplifiedExecutiveSummaryPage'
import SimplifiedWelcomePage from './SimplifiedWelcomePage'

class MobileRouter extends Component {

    render() {

        setBrowserTitle('ImpTime')
        
        return (
            <Switch>
              <Route path="/wd/" component={SimplifiedWelcomePage} />
              <Route path="/wd/projects/:projectId/sprints/:sprintId/executive_summary" component={SimplifiedExecutiveSummaryPage} />
            </Switch>
        )
    }
    
}

function mapStateToProps(state) {
    return {}
}

export default withRouter(connect(mapStateToProps)(MobileRouter))
