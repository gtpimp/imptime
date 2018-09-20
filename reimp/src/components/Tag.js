import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'

import { getTag, ensureTagsLoaded } from '../actions/Tags'
import { default_theme as theme } from '../theme/default'
import delete_outline from '../images/delete_outline.svg'

const tag_container = css`
display: inline-flex;
flex-direction: row;
align-items: center;
justify-content: flex-start;
background-color: ${theme.colours.subtle_background};
padding: ${theme.spacing.one};
border-radius: 5px;
margin: 0 ${theme.spacing.one} ${theme.spacing.one} 0;
`

const tag_container_text = css`
display: flex;

color: ${theme.colours.strong_text};
margin-right: 5px;
`

const remove_icon = css`
display: inline-block;
height: 18px;
width: 18px;
-webkit-mask: url(${delete_outline}) no-repeat center;
mask: url(${delete_outline}) no-repeat center;
background-color: ${theme.colours.normal_text};
background-size: ${theme.spacing.two};
`

class Tag extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { tag_id, dispatch } = props
        if ( tag_id ) {
            dispatch(ensureTagsLoaded([tag_id]))
        }
    }

    render() {
        const {tag, onDelete} = this.props

        if ( ! tag.id ) {
            return null
        }

        return (
            <div className={tag_container}>
              <div className={tag_container_text}>{tag.category_name}</div>
              <div className={tag_container_text}>{tag.name}</div>
              { onDelete &&
                <div className={ remove_icon } onClick={onDelete}></div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { tag_id, onDelete } = props
    const tag = getTag(state, tag_id) || {}

    return {
        tag_id,
        tag,
        onDelete
    }

}

export default connect(mapStateToProps)(Tag)
