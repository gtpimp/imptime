import React, {Component, Fragment} from 'react'
import OnboardingPage from './OnboardingPage'
import PageSubTitle from '../PageSubTitle'
import OnboardingWizard from './OnboardingWizard'

class OnboardingStepWelcome extends Component {

    render() {
        return (
            <OnboardingPage>
              <OnboardingWizard current_step={4}
                                is_final_step={true}
                                next_step={true}
                                prev_step={3}
                                next_step_label="Close">
                <Fragment>
                  <PageSubTitle>Thanks for becoming an early adopter</PageSubTitle>
                  <p>
                    Now that you're registered, we'll be in touch to guide you through your first steps.
                  </p>
                  <div>
                    <ul>
                      <li>We know it still looks rough</li>
                      <li>Under the hood it's very powerful</li>
                      <li>We're highly responsive to changes</li>
                      <li>Ask and we'll fix it</li>
                    </ul>
                  </div>
                </Fragment>
              </OnboardingWizard>
            </OnboardingPage>
        )
    }
}
export default OnboardingStepWelcome
