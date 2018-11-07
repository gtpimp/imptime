import React, {Component, Fragment} from 'react'
import {connect} from 'react-redux'
import { size } from 'lodash'
import PageSubTitle from '../PageSubTitle'
import OnboardingPage from './OnboardingPage'
import OnboardingWizard from './OnboardingWizard'
import OnboardingPasswordForm from './OnboardingPasswordForm'
import { submit } from 'redux-form'
import { update_profile, change_password, logged_in_user } from '../../actions/Auth'
import { ensureUsersLoaded, getUser } from '../../actions/Users'
import Loading from '../Loading'

class OnboardingStepPassword extends Component {

    componentDidMount() {
        const { dispatch, user_id } = this.props
        dispatch(ensureUsersLoaded([user_id]))
    }
    
    onNext = (onAfterNext) => {
        const { dispatch } = this.props
        this.onAfterNext = onAfterNext
        dispatch(submit('onboarding_password_form'))
    }

    onSubmit = ({ new_password, mobile_phone_number, enable_mobile_phone_number_pin }) => {
        const { dispatch } = this.props

        if ( ! enable_mobile_phone_number_pin ) {
            mobile_phone_number = ''
        }
        
        dispatch(update_profile({mobile_phone_number, on_done: () =>
            dispatch(change_password({new_password}, this.onAfterNext))
        }))
    }
    
    render() {
        const { user, mobile_phone_number } = this.props
        return (
            <OnboardingPage>
              <OnboardingWizard current_step={3}
                                next_step={4}
                                prev_step={2}
                                onNextHook={this.onNext}
              >
                <Fragment>
                  <PageSubTitle>Secure your account</PageSubTitle>

                  { user && 
                    <OnboardingPasswordForm onSubmit={this.onSubmit}
                                            initially_show_mobile_phone_number_section={size(mobile_phone_number)>0}
                                            initialValues={{mobile_phone_number}}
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

    let user = logged_in_user()
    const user_id = user.user_id
    if ( user_id ) {
        user = Object.assign({}, user, getUser(state, user_id))
    }
    
    return {
        user_id,
        user,
        mobile_phone_number: user.mobile_phone_number
    }
}

export default connect(mapStateToProps)(OnboardingStepPassword)
