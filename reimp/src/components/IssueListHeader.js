import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map, includes } from 'lodash'
import { getCellStyle } from '../actions/ItemListKeyRegistry'
import OtherUser from './OtherUser'
import '../sass/sticky-header.scss'
import {
    isDirty
} from 'redux-form'

class IssueListHeader extends Component {

    constructor(props) {
        super(props)
        this.onPrimaryButtonClick = this.onPrimaryButtonClick.bind(this)
        this.onSecondaryButtonClick = this.onSecondaryButtonClick.bind(this)
        this.onTertiaryButtonClick = this.onTertiaryButtonClick.bind(this)
        this.state = {
            headerPosition: 100
        }
    }

    onPrimaryButtonClick() {
        if (this.props.on_primary_button_click) {
            this.props.on_primary_button_click()
        }
    }

    onSecondaryButtonClick() {
        if (this.props.on_secondary_button_click) {
            this.props.on_secondary_button_click()
        }
    }

    onTertiaryButtonClick() {
        if (this.props.on_tertiary_button_click) {
            this.props.on_tertiary_button_click()
        }
    }

    render() {
        const { header_list, tag_category_names, sprint, logged_in_user_id } = this.props
        
        return(
            <div className="div-table__header_row">
              { map(header_list, function(v, index) {
                    const k = v.key
                    const react_key = ""+ k + index
                    if ( k === "tag_columns" ) {
                        return (
                            map(tag_category_names, (tag_category_name) => (
                                <div key={tag_category_name}
                                     className="div-table__header_cell issue-list__header_call__tag_category"
                                     style={getCellStyle(v)}>
                                  {tag_category_name}
                                </div>
                            ))
                        )
                    } else if ( k === "estimate_columns" ) {
                        return (
                            map(sprint.user_ids_who_can_estimate, (user_id) => (
                                <div key={user_id}
                                     className="div-table__header_cell issue-list__header_call__user_estimate"
                                     style={getCellStyle(v)}>
                                  <OtherUser user_id={user_id}
                                             render_mode="inline--small"
                                             display_mode="username" />
                                </div>
                            ))
                        )
                    } else if ( k === "my_estimate" ) {
                        const user_id = (includes(sprint.user_ids_who_can_estimate, logged_in_user_id) && logged_in_user_id) || null
                        if ( user_id ) {
                            return (
                                <div key={user_id}
                                     className="div-table__header_cell issue-list__header_call__user_estimate"
                                     style={getCellStyle(v)}>
                                  <OtherUser user_id={user_id}
                                             render_mode="inline--small"
                                             display_mode="username" />
                                </div>
                            )
                        } else {
                            return null
                        }
                    } else {
                        return (
                            <div key={react_key}
                                 className="div-table__header_cell"
                                 style={getCellStyle(v)}>
                              {v.label }
                            </div>
                        )
                    }
                })
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { form_name, altButtons, header_list } = props

    let context = {
        show_primary_button: props.primary_button_label,
        show_secondary_button: props.secondary_button_label,
        show_tertiary_button: props.tertiary_button_label,
        header_list
    }
    
    if (form_name) {
        if (altButtons) {
            if (!isDirty(form_name)(state)) {
                context.show_primary_button = false;
                context.show_secondary_button = false;
            }
        }
    }

    return context;
}

export default connect(mapStateToProps)(IssueListHeader)
