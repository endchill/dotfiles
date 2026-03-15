import app from "ags/gtk4/app"
import Gtk from "gi://Gtk?version=4.0"
import Astal from "gi://Astal?version=4.0"
import { MusicPlayerSidePanel, MusicPlayerMusicLibrary } from "./modules/music_player/main.tsx"

export function sidePanel(monitor) {
    return [
        <window
            visible={false}
            name="sidePanel"
            class="window"
            application={app}
            monitor={monitor}
            exclusivity={Astal.Exclusivity.NORMAL}
            layer={Astal.Layer.TOP}
            keymode={Astal.Keymode.ON_DEMAND}
            anchor={Astal.WindowAnchor.LEFT |Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM}
        >
            <box orientation={Gtk.Orientation.VERTICAL}>
                <MusicPlayerSidePanel/>
            </box>
        </window>,
        <window
            visible={false}
            name="secondSidePanel"
            class="window"
            application={app}
            monitor={monitor}
            exclusivity={Astal.Exclusivity.NORMAL}
            layer={Astal.Layer.LEFT}
            keymode={Astal.Keymode.ON_DEMAND}
            anchor={Astal.WindowAnchor.LEFT | Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM}
        >
            <MusicPlayerMusicLibrary/>
        </window>
    ]
}
