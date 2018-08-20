import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import classNames from 'classnames'
import EditableProperty from './form/EditableProperty'
import IssueStatusForm from './form/IssueStatusForm'
import { getListFilter, update_list_filter } from '../actions/ItemList'

class EditableIssueStateFilter extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, list_key } = this.props
        dispatch(update_list_filter(list_key,
                                    {'status_names': new_value.issue_status_names}))
    }

    render() {
        const { filter, project_id } = this.props

        return (
            <EditableProperty property_key={'issue_state_filter'}
                              initial_value={filter.status_names}
                              onChange={this.onChange}
                              can_edit={true}
            >
              <IssueStatusForm project_id={project_id}
                               allow_multiselection={true}/>
              
              <div className={classNames("text-component--readonly")}>
                { map(filter.status_names, (status_name, index) =>
                    <div key={index} className={css`padding-right: ${theme.spacing.horizontal_space_inline}`}>
                      {status_name}
                    </div>
                  )}
                <br/>
                <a>Edit</a>
              </div>
              <div className="text-component--empty">
                Any status
              </div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key, project_id } = props

    const filter = getListFilter(state, list_key)
    
    return {
        list_key,
        project_id,
        filter
    }
}


export default connect(mapStateToProps)(EditableIssueStateFilter)
