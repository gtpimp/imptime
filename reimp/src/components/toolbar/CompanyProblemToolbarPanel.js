import '../../sass/toolbar-panel.css'
import React, {Component} from 'react'
import { connect } from 'react-redux'
import { recalculateCompanyProblems } from '../../actions/CompanyProblems'

class CompanyProblemToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onRecalculateClicked = this.onRecalculateClicked.bind(this)
    }

    onRecalculateClicked() {
        const { dispatch } = this.props
        dispatch(recalculateCompanyProblems())
    }

    render() {
        return (
            <div className="toolbar-panel">
              <div className="button toolbar-button--small button--large button--primary"
                             onClick={this.onRecalculateClicked}>Recalculate</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
    }
}


export default connect(mapStateToProps)(CompanyProblemToolbarPanel)
