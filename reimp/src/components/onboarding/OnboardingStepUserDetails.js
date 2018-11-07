import React, {Component, Fragment} from 'react'
import PageSubTitle from '../PageSubTitle'
import OnboardingPage from './OnboardingPage'
import OnboardingWizard from './OnboardingWizard'
import OnboardingProfileForm from './OnboardingProfileForm'

class OnboardingStepUserDetails extends Component {
    render() {
        return (
            <OnboardingPage>
              <OnboardingWizard current_step={1}
                                next_step={2}
                                prev_step={null}
                                next_step_label="Start"
              >
                <Fragment>
                  <PageSubTitle>Set your profile</PageSubTitle>
                  <p>This is how you will appear to other users in the system</p>

                  <OnboardingProfileForm />
                  
                </Fragment>
              </OnboardingWizard>
            </OnboardingPage>
        )
    }
}
export default OnboardingStepUserDetails
