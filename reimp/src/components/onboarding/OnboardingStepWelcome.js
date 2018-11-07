import React, {Component, Fragment} from 'react'
import OnboardingPage from './OnboardingPage'
import PageSubTitle from '../PageSubTitle'
import OnboardingWizard from './OnboardingWizard'

class OnboardingStepWelcome extends Component {
    render() {

        return (
            <OnboardingPage>
              <OnboardingWizard current_step={1}
                                next_step={2}
                                prev_step={null}
                                next_step_label="Start"
              >
                <Fragment>
                  <PageSubTitle>Welcome to ImpTime</PageSubTitle>
                  <p>Just a few more steps to finalise your account.</p>
                </Fragment>
              </OnboardingWizard>
            </OnboardingPage>
        )
    }
}
export default OnboardingStepWelcome
