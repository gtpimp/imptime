import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {browserHistory} from 'react-router'
import classNames from 'classnames'
import {
    ensureWikisLoaded,
    getWiki,
    updateWikiMoneySensitive
} from '../actions/Wikis'

import { isLoadingItems } from '../actions/Item'
import ProjectName from './ProjectName'
import Timestamp from './Timestamp'
import ReactMarkdown from 'react-markdown'
import EditableWikiContent from './EditableWikiContent'
import EditableWikiName from './EditableWikiName'
import ToggleButton from './toolbar/ToggleButton'
import { has_permission } from '../actions/Users'

class Wiki extends Component {

    constructor(props) {
        super(props)
        this.onCommerciallySensitiveClick = this.onCommerciallySensitiveClick.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, wiki_id } = this.props
	dispatch(ensureWikisLoaded([wiki_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, wiki_id } = new_props
	dispatch(ensureWikisLoaded([wiki_id]))
    }

    onCommerciallySensitiveClick(is_commercially_sensitive) {
        const { dispatch, wiki_id } = this.props
        dispatch(updateWikiMoneySensitive(wiki_id, is_commercially_sensitive))
    }
    
    render() {

        const { wiki, is_loading, can_edit, can_view_sensitive_wikis } = this.props
        const that = this

        if ( ! wiki.id ) {
            return null
        }
        
        return (
            <div className="wiki">
              <div className="wiki-header">
                <div className="wiki-header__name"> 
                  <EditableWikiName wiki_id={wiki.id} />
                </div>
                { can_edit && can_view_sensitive_wikis && 
                  <div className="wiki-header__commercially_sensitive">
                    <ToggleButton value={wiki.money_sensitive}
                                  onChange={this.onCommerciallySensitiveClick}
                                  on_label={"Sensitive"}
                                  off_label={"Safe"} />
                  </div>
                }
              </div>
              <div className="wiki__content">
                { !can_view_sensitive_wikis && wiki.money_sensitive &&
                  <div className="error">Sensitive content hidden</div>
                }

                { (can_view_sensitive_wikis || !wiki.money_sensitive) &&
                  <EditableWikiContent wiki_id={wiki.id} />
                }
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { wiki_id } = props
    const wiki = getWiki(state, wiki_id) || {}
    const can_edit = has_permission(state, wiki.project_id, 'has_edit_business_comments')
    const can_view_sensitive_wikis = has_permission(state, wiki.project_id, 'has_view_ctc_billable_rates')

    return {
        wiki,
        is_loading: !wiki.id,
        can_edit,
        can_view_sensitive_wikis
    }
}

export default connect(mapStateToProps)(Wiki)
