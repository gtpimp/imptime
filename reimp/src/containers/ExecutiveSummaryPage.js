import React, {Component, Fragment} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import ExecutiveSummary from '../components/ExecutiveSummary'
import PrimaryButton from '../components/PrimaryButton'
import { css } from 'emotion'

class SimplifiedExecutiveSummaryPage extends Component {

    onShareExecutiveSummary = () => {
        console.log("SHARE")
    }

    render() {
        return (
            <div className={ main }>
              <div className={ actions }>
                <PrimaryButton
                    label="Share Executive Summary"
                    onButtonClick={this.onShareExecutiveSummary} />
              </div>
              <div className={ content }>
                <ExecutiveSummary />
              </div>
            </div>
        )
    }
}
function mapStateToProps(state, props) {
    return {}
}
export default withRouter(connect(mapStateToProps)(SimplifiedExecutiveSummaryPage))

const main = css`
display: flex;
flex: 1;
flex-direction: column;
`

const actions = css`
display: flex;
height: 40px;
justify-content: center;
align-items: center;
background-color: #c8d3d6;
`

const content = css`
display: flex;
flex: 11;
`
