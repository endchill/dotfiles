import AstalBattery from "gi://AstalBattery"
import { createBinding } from "ags"
import { readFile } from "ags/file"

const settings = JSON.parse(readFile("./settings.json"))
const battery = AstalBattery.get_default()

export function BatterySystemStatus() {
    return (
        <box name="battery" $type="center">
            <image
                iconName={createBinding(battery, "iconName")}
                pixelSize={`${settings.scale * 24}`}
            />
        </box>
    )
}

export function BatteryEntry() {
    return (
        <box name="batteryEntry">
            <image
                iconName={createBinding(battery, "iconName")}
                pixelSize={`${settings.scale * 24}`}
                css={`margin-right: ${settings.scale * 8}px;`}
            />
            <label
                label={createBinding(battery, "percentage")((p) => {
                    return `${Math.floor(p * 100)}%`
                })}
            />
        </box>
    )
}
