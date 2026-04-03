import app from "ags/gtk4/app"
import GLib from "gi://GLib?version=2.0"
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { readFile, writeFile } from "ags/file"
import { exec } from "ags/process"
import { appLauncher } from "./app_launcher.tsx"
import { bar } from "./bar.tsx"
import { quickSettings } from "./quick_settings.tsx"
import { sidePanel } from "./side_panel.tsx"
import { musicPlayerPopup } from "./modules/music_player/main.tsx"
import "./modules/music_player/watchers.tsx"

const settings = JSON.parse(readFile("./settings.json"))

const monitors = AstalHyprland.get_default().get_monitors()
const primaryMonitor = monitors.find((monitor) => monitor.x === 0 && monitor.y === 0)

export const monitorsID = (() => {
    const monitorsNameToID = settings.monitors
        .map((name) => monitors.find((monitor) => monitor.name === name))
        .filter(Boolean)
        .map((monitor) => monitor.id)
    if (monitorsNameToID.length !== 0) {
        return monitorsNameToID
    } else {
        return [primaryMonitor.id]
    }
})()

export const scaleFactor = (() => {
    if (settings.screenScallingAware === true) {
        return primaryMonitor.height * 0.0009375 * (1 / primaryMonitor.scale) * settings.scale
    } else {
        return primaryMonitor.height * 0.0009375 * settings.scale
    }
})()

writeFile(`/tmp/ags_${GLib.get_user_name()}/style_virables.scss`, `$scale_factor: ${scaleFactor};`)
exec(`sed -i '1c @import \"/tmp/ags_${GLib.get_user_name()}/style_virables.scss\";' ./style.scss`)
exec(`sassc ./style.scss /tmp/ags_${GLib.get_user_name()}/style.css -I ./`)

app.start({
    css: `/tmp/ags_${GLib.get_user_name()}/style.css`,
    main() {
        monitorsID.forEach((m) => {
            return [
                appLauncher(m),
                bar(m),
                quickSettings(m),
                sidePanel(m),
                musicPlayerPopup(m)
            ]
        })
    }
})
