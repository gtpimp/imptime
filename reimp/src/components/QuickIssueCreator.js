import React, {Component} from 'react'
import IssueSelectorForm from './form/IssueSelectorForm'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import NavMenuItem from './NavMenuItem'
import ModalDialog from './ModalDialog'

class QuickIssueCreator extends Component {

    constructor(props) {
        super(props)
        this.onIssueCreated = this.onIssueCreated.bind(this)
        this.state = { visible: false }
    }

    show = () => {
        this.setState({visible:true})
    }
    
    hide = () => {
        this.setState({visible:false})
    }

    toggle = () => {
        const { visible } = this.state
        if ( visible ) {
            this.hide()
        } else {
            this.show()
        }
    }

    onIssueCreated(new_issue) {
        this.hide()
    }

    renderIssueCreator() {
        return (
            <ModalDialog isOpen={true}
                         onClose={this.hide}
                         title="Create issue"
                         variant="full">
              <IssueSelectorForm onSubmitted={this.onIssueCreated}
                                 initial_mode="create" />
            </ModalDialog>
        )
    }
    
    render() {
        const { visible } = this.state
        return (
            <NavMenuItem isActive={visible}>
              <div onClick={this.toggle}>+ Issue</div>
              { visible && this.renderIssueCreator() }
            </NavMenuItem>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}

export default withRouter(connect(mapStateToProps)(QuickIssueCreator))


