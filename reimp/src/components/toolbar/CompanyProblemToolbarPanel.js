import '../../sass/toolbar-panel.css'
import React, {Component} from 'react'
import { connect } from 'react-redux'
import { recalculateCompanyProblems, isRecalculating } from '../../actions/CompanyProblems'

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
        const { is_recalculating } = this.props
        return (
            <div className="toolbar-panel">
              <div className="button toolbar-button--small button--large button--primary"
                   onClick={this.onRecalculateClicked}>
                Recalculate
                { is_recalculating &&
                  <div className="icon--loading"/>
                }
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const is_recalculating = isRecalculating(state)

    return {
        is_recalculating
    }
}


export default connect(mapStateToProps)(CompanyProblemToolbarPanel)
