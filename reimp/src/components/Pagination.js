import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import {
    update_list_pagination
} from "../actions/ItemList"

class Pagination extends Component {

    constructor(props) {
        super(props)
        this.on_next_page = this.on_next_page.bind(this)
        this.on_prev_page = this.on_prev_page.bind(this)
    }

    on_next_page(event) {
        const { dispatch, list_key } = this.props
        if (this.props.has_next_page) {
	    dispatch(update_list_pagination(list_key, {current_page: this.props.current_page + 1}))
	    this.props.on_changed()
	    event.stopPropagation()
        }
    }

    on_prev_page(event) {
        const { dispatch, list_key } = this.props
        if (this.props.has_prev_page) {
	    dispatch(update_list_pagination(list_key, {current_page: this.props.current_page - 1}))
	    this.props.on_changed()
	    event.stopPropagation()
        }
    }

    render() {
        const { hide_if_one_page, is_loading, received_at, first_item_index, last_item_index,
                num_items, has_prev_page, has_next_page } = this.props

        if ( hide_if_one_page && ! has_prev_page && ! has_next_page ) {
            return null
        }
        
        return (
            <div className="pager">
                <div className="pager__last-updated">
                    { is_loading &&
                      <div>Loading...</div>
                    }
                      { !is_loading &&
                        <div>As at {received_at}</div>
                      }
                </div>
                <div className="pager__text">
		  Showing {first_item_index} to {last_item_index} out of {num_items}
		</div>
                { has_prev_page &&
                  <div className="icon icon--previous-page" onClick={this.on_prev_page}>
		      &nbsp;
		  </div>
                }
		{ has_next_page &&
		  <div className="icon icon--next-page" onClick={this.on_next_page}>
		      &nbsp;
		  </div>
		}
            </div>
        )

    }
}

function mapStateToProps(state, props) {

    const { item_list } = state
    const { list_key, on_changed, hide_if_one_page } = props
    const l = (item_list && item_list[list_key]) || {}
    const pagination = l.pagination || {}

    return {
        list_key: list_key,
        min_page_num: 1,
        current_page: pagination.current_page || 1,
        num_pages: pagination.num_pages || 0,
        num_items: pagination.num_items || 0,
	first_item_index: pagination.first_item_index || 1,
	last_item_index: pagination.last_item_index || 1,
	has_prev_page: pagination.has_prev_page || false,
	has_next_page: pagination.has_next_page || false,
        is_loading: l.is_loading,
	received_at: moment(l.received_at).format('h:mm:ss a'),
        on_changed,
        hide_if_one_page: hide_if_one_page || false
    }

}

export default connect(mapStateToProps)(Pagination)
