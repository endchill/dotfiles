import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import { readFile } from "ags/file"

const settings = JSON.parse(readFile("./settings.json"))

export function toggleAppLauncher() {
    const appLauncher = app.get_window("appLauncher")
    appLauncher.visible = !appLauncher.visible
}

export function appLauncher(monitor) {
    return (
        <window
            visible={false}
            name="appLauncher"
            class="window"
            application={app}
            monitor={monitor}
            exclusivity={Astal.Exclusivity.Ignore}
            layer={Astal.Layer.TOP}
            keymode={Astal.Keymode.ON_DEMAND}
        >
            <box>
            </box>
        </window>
    )
}
