import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import { scaleFactor } from "./app.tsx"
import { Clock } from "./modules/clock/main.tsx"
import { MusicPlayerBarCover, MusicPlayerControls, MusicPlayerBarLabel } from "./modules/music_player/main.tsx"
import { TrayBar } from "./modules/tray/main.tsx"
import { SystemStatus } from "./modules/system_status/main.tsx"

export function bar(monitor) {
    return (
        <window
            visible={true}
            name="bar"
            class="window"
            application={app}
            monitor={monitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            layer={Astal.Layer.TOP}
            anchor={
                Astal.WindowAnchor.TOP |
                Astal.WindowAnchor.LEFT |
                Astal.WindowAnchor.RIGHT
            }
        >
            <centerbox>
                <box class="left" css={`margin-left: ${scaleFactor * 4}px;`} $type="start">
                    <Clock/>
                    <MusicPlayerBarCover/>
                    <MusicPlayerControls/>
                </box>
                <box class="center" $type="center">
                    <MusicPlayerBarLabel/>
                </box>
                <box class="right" css={`margin-right: ${scaleFactor * 4}px;`} $type="end">
                    <TrayBar/>
                    <SystemStatus/>
                </box>
            </centerbox>
        </window>
    )
}
