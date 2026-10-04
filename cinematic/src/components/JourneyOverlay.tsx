import { CloudControls } from './CloudControls'
import { IntroGreeting } from './IntroGreeting'

export function JourneyOverlay() {
  return <div className="journey-overlay">
    <IntroGreeting />
    <CloudControls />
  </div>
}
