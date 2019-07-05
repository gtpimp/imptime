import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'

import DataHistoryList from '../components/DataHistoryList';
import Splitter from '../components/Splitter'

class DataHistoryPage extends Component {

    render() {

        return (
            <div className="auto-clock-list">
              <Splitter>
                <div>
                  <DataHistoryList />
                </div>
                {null}
              </Splitter>
            </div>
        )
    }
}

function mapStateToProps() {
    return {
    }
}

export default withRouter(connect(mapStateToProps)(DataHistoryPage))
