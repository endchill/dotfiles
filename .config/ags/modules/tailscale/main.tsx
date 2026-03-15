import GLib from "gi://GLib?version=2.0"
import { readFile } from "ags/file"
import { createPoll } from "ags/time"
import { exec } from "ags/process"
import { scaleFactor } from "../../app.tsx"

const settings = JSON.parse(readFile("./settings.json"))

const stat = createPoll({
    text: "Checking...",
    klass: "checking",
    image: "off"
}, 1000, () => {
    const tailscaleData = JSON.parse(exec("tailscale status --json"))

    let result = { text: "", klass: "", image: "" };
    switch (tailscaleData.BackendState) {
        case "Running":
            return { text: "Connected", klass: "connected", image: "on"  }
        case "Stopped":
            return { text: "Disconnected", klass: "disconnected", image: "off" }
        case "NeedsLogin":
            return { text: "Login Required", klass: "loginrequired", image: "off"  }
        default:
            return { text: tailscaleData.BackendState, klass: "unknown", image: "off" }
    }
})

function tailscaleToggle() {
    const tailscaleData = JSON.parse(exec("tailscale status --json"))
    if (tailscaleData.BackendState === "Running") {
        exec("sudo tailscale down")
    } else {
        exec("sudo tailscale up")
    }
}

export function Tailscale() {
    return (
        <box>
            <button name="tailscale" class={stat((s) => s.klass)} onClicked={() => tailscaleToggle()} >
                <box>
                    <image
                        file={stat(s => `${GLib.get_user_config_dir()}/ags/icons/tailscale/${s.image}.svg`)}
                        pixelSize={`${scaleFactor * 16}`}
                        css={`margin-right: ${scaleFactor * 8}px;`}
                    />
                    <label label={stat((s) => s.text)}/>
                </box>
            </button>
        </box>
    )
}
