import React, {Component, Fragment} from 'react'
import {connect} from 'react-redux'
import PageSubTitle from '../PageSubTitle'
import OnboardingPage from './OnboardingPage'
import OnboardingWizard from './OnboardingWizard'
import OnboardingProfileForm from './OnboardingProfileForm'
import { submit } from 'redux-form'
import { update_profile, logged_in_user } from '../../actions/Auth'
import { ensureUsersLoaded, getUser } from '../../actions/Users'
import Loading from '../Loading'

class OnboardingStepUserDetails extends Component {

    componentDidMount() {
        const { dispatch, user_id } = this.props
        dispatch(ensureUsersLoaded([user_id]))
    }
    
    onNext = (onAfterNext) => {
        const { dispatch } = this.props
        this.onAfterNext = onAfterNext
        dispatch(submit('onboarding_profile_form'))
    }

    onSubmit = ({ first_name, last_name }) => {
        const { dispatch } = this.props
        dispatch(update_profile({first_name, last_name, on_done: this.onAfterNext}))
    }
    
    render() {
        const { user } = this.props
        return (
            <OnboardingPage>
              <OnboardingWizard current_step={2}
                                next_step={3}
                                prev_step={1}
                                onNextHook={this.onNext}
              >
                <Fragment>
                  <PageSubTitle>Set your profile</PageSubTitle>
                  <p>This is how you will appear to other users in the system</p>

                  { user && 
                  <OnboardingProfileForm onSubmit={this.onSubmit}
                                         initialValues={{first_name: user.first_name,
                                                         last_name: user.last_name}}
                  />
                  }
                  { ! user && <Loading/> }
                  
                </Fragment>
              </OnboardingWizard>
            </OnboardingPage>
        )
    }
}

function mapStateToProps(state, props) {

    let user = logged_in_user(state)
    const user_id = user.user_id
    if ( user_id ) {
        user = Object.assign({}, user, getUser(state, user_id))
    }
    
    return {
        user_id,
        user
    }
}

export default connect(mapStateToProps)(OnboardingStepUserDetails)
