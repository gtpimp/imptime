import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import Sidebar from './Sidebar'
import {
    getCandidateWiki,
    updateCandidateName,
    cancelCandidateWiki,
    saveCandidateWiki
} from '../actions/Wikis'
import NewWikiForm from './form/NewWikiForm'

class NewWikiSidebar extends Component {

    constructor(props) {
        super(props)
        this.onSaveCandidateWiki = this.onSaveCandidateWiki.bind(this)
        this.keyDown = this.keyDown.bind(this)
    }

    keyDown(event) {
        const { dispatch } = this.props
        if (event.keyCode === 27) {
            event.preventDefault()
            dispatch(cancelCandidateWiki())
        }
    }

    onSaveCandidateWiki(new_value) {
        const {onCreatedWiki, dispatch} = this.props
        dispatch(updateCandidateName(new_value.name))
        
        const onDone = function(wiki_id) {
            onCreatedWiki(wiki_id)
        }
        dispatch(saveCandidateWiki(onDone))
    }

    render() {

        const { project_id } = this.props
        
        return (
            <Sidebar>
              <PropertyStack>
                <div onKeyDown={this.keyDown}>
                  <div>
                    <NewWikiForm onSubmitted={this.onSaveCandidateWiki}
                                 project_id={project_id} />
                  </div>
                </div>
              </PropertyStack>
            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {
    const { onCreatedWiki, project_id, sprint_id } = props

    const candidate_wiki = getCandidateWiki(state) || null
    return {
        candidate_wiki: candidate_wiki,
        onCreatedWiki,
        project_id,
        sprint_id
    }
}

export default connect(mapStateToProps)(NewWikiSidebar)
