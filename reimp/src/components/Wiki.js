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

        const { wiki, is_loading } = this.props
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
                <div className="wiki-header__commercially_sensitive">
                  <ToggleButton value={wiki.money_sensitive}
                                onChange={this.onCommerciallySensitiveClick}
                                on_label={"Sensitive"}
                                off_label={"Safe"} />
                </div>
              </div>
              <div className="wiki__content">
                <EditableWikiContent wiki_id={wiki.id} />
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { wiki_id } = props
    const wiki = getWiki(state, wiki_id) || {}

    return {
        wiki,
        is_loading: !wiki.id
    }
}

export default connect(mapStateToProps)(Wiki)
