import React, {Component} from 'react'
import {connect} from 'react-redux'
import ToggleButton from '../toolbar/ToggleButton'

class ProjectArchivedForm extends Component {

    render() {

        const { archived, onSubmitted, onCancel } = this.props

        return (
            <div>
              <div>
                <div className="project_sidebar--textarea">

                  <ToggleButton value={archived}
                                onChange={onSubmitted}
                                on_label={"Archived"}
                                off_label={"Active"}
                  />
                </div>
              </div>
              <div className="project_sidebar__button_row">
                <button className="button project_sidebar--textarea" type="button" onClick={() => onCancel()}>Cancel</button>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onCancel, initial_value } = props

    return {
        archived: initial_value,
        onSubmitted,
        onCancel
    }
}

export default connect(mapStateToProps)(ProjectArchivedForm)
