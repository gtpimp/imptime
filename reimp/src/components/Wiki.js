import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {browserHistory} from 'react-router'
import classNames from 'classnames'
import {
    ensureWikisLoaded,
    getWiki
} from '../actions/Wikis'

import { isLoadingItems } from '../actions/Item'
import ProjectName from './ProjectName'
import Timestamp from './Timestamp'
import ReactMarkdown from 'react-markdown'

const renderers = {
    link: (props) => {
        return (
          <a href={props.href}
             target="_blank"
             onClick={(event) => event.stopPropagation()}>
             {(props.children && props.children[0]) || props.href}
          </a> 
        )
    }
}

class Wiki extends Component {

    constructor(props) {
        super(props)
    }
    
    componentDidMount() {
	const { dispatch, wiki_id } = this.props
	dispatch(ensureWikisLoaded([wiki_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, wiki_id } = new_props
	dispatch(ensureWikisLoaded([wiki_id]))
    }

    render() {

        const { wiki, is_loading, onClickedWiki } = this.props
        const that = this

        if ( ! wiki.id ) {
            return null
        }
        
        return (
            <div className="wiki">
              <div className={classNames("wiki__link")} onClick={onClickedWiki}>
                {wiki.name}
              </div>
              <div className="wiki__content">
                <ReactMarkdown source={wiki.content} renderers={renderers} />
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { wiki_id, onClickedWiki } = props
    const wiki = getWiki(state, wiki_id) || {}

    return {
        wiki,
        is_loading: !wiki.id,
        onClickedWiki
    }
}

export default connect(mapStateToProps)(Wiki)
