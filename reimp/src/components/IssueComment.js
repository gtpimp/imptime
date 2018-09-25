import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getIssue, ensureIssuesLoaded, generateReadOnlyIssueCommentLink } from '../actions/Issues'
import Modal from 'react-modal';
import OtherUser from '../components/OtherUser'
import RenderedMarkdown from './RenderedMarkdown'
import { has_permission } from '../actions/Users'
import { startGlobalCommentAnnotation } from '../actions/GlobalCommentAnnotation'

class IssueComment extends Component {

    constructor(props) {
        super(props)
        this.onAnnotate = this.onAnnotate.bind(this)
        this.onShare = this.onShare.bind(this)
        this.onCloseShareModal = this.onCloseShareModal.bind(this)
        this.state = {show_share_link: false}
    }
    
    componentDidMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    onAnnotate(event) {
        const { dispatch, issue_id, comment } = this.props
        if ( event ) {
            event.preventDefault()
            event.stopPropagation()
        }
        dispatch(startGlobalCommentAnnotation(issue_id, comment.id))
    }

    onShare(event) {
        const { dispatch, issue_id, comment } = this.props
        if ( event ) {
            event.preventDefault()
            event.stopPropagation()
        }
        dispatch(generateReadOnlyIssueCommentLink(issue_id, comment.id))
        this.setState({show_share_link: true})
    }

    onCloseShareModal(event) {
        this.setState({show_share_link: false})
    }

    renderShareModal() {
        const { issue, comment } = this.props
        const loading = !comment.share_ref
        const share_link = window.location.protocol + "//" + window.location.host + "/share/issue_comment/" + issue.share_ref + "/" + comment.share_ref
        
        return (
            <Modal isOpen={true}
                   className="share-modal"
                   overlayClassName="share-modal__overlay"
                   onRequestClose={this.onCloseShareModal}
                   contentLabel={"Share issue comment"}>
              <div>
                <div className="share-modal__row share-modal__row--header">
                  <label htmlFor="assigned" className="share-modal__title">Share issue comment</label>
                  <div className="share-modal__close">
                    <i className="material-icons" onClick={this.onCloseShareModal}>
                      close
                    </i>
                  </div>
                </div>
                <div className="share-modal__content">
                  { loading && <div>Loading...</div> }
                  { ! loading &&
                    <div>
                      Share the following link:
                      <br/>
                      <a target="_blank" href="{ share_link }">{ share_link }</a>
                    </div>
                  }
                </div>
              </div>
            </Modal>
        )
    }
    
    render() {
        const { comment, onDelete, can_annotate, can_share } = this.props
        const { show_share_link } = this.state

        return (
            <div className="issue-comment">
              { show_share_link && this.renderShareModal() }
              <div className="issue-comment__info">
                <div className="issue_sidebar--comment_author">
                  <div className="issue_sidebar--comment_author__name">
                    <span>Comment by:</span>
                    <OtherUser user_id={comment.author_id} />
                  </div>
                  <div className="issue_sidebar--comment_modified_date">
                    {comment.modified}
                  </div>
                </div>
                <div className="issue-comment__text" >
                  <RenderedMarkdown content={comment.enriched_comment || comment.comment} />
                </div>
                <div className="issue_sidebar__options">
                  { can_share &&
                    <div onClick={this.onShare} className="issue_sidebar__options__left">
                      Share
                      <span className="issue_sidebar__options__spacer">|</span>
                    </div>
                  }
                  { can_annotate &&
                    <div onClick={this.onAnnotate} className="issue_sidebar__options__left">
                      Annotate
                      <span className="issue_sidebar__options__spacer">|</span>
                    </div>
                  }
                  { onDelete &&
                    <div onClick={onDelete} className="issue_sidebar__options__left">
                      Remove
                    </div>
                  }
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { issue_id, comment, onDelete } = props
    const issue = getIssue(state, issue_id)
    const can_annotate = has_permission(state, issue.project_id, 'has_add_issue')
    const can_share = has_permission(state, issue.project_id, 'has_share_issues')
    
    return {
        issue,
        comment,
        onDelete,
        can_annotate,
        can_share
    }
}

export default connect(mapStateToProps)(IssueComment)
