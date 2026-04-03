import { toggleQuickSettings } from "../../quick_settings.tsx"
import { WifiSystemStatus } from "../network/wifi.tsx"
import { BatterySystemStatus } from "../battery/main.tsx"

export function SystemStatus() {
    return (
        <button name="systemStatus"
            onClicked={() => toggleQuickSettings()}
        >
            <centerbox >
                <BatterySystemStatus/>
                <WifiSystemStatus/>
            </centerbox>
        </button>
    )
}
