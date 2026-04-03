import Gtk from "gi://Gtk?version=4.0"
import GLib from "gi://GLib?version=2.0"
import { createBinding } from "ags"
import { readFile } from "ags/file"
import { execAsync } from "ags/process"
import { timeout } from "ags/time"
import { IwdState } from "./gobject.tsx"
import { scaleFactor } from "../../app.tsx"

const settings = JSON.parse(readFile("./settings.json"))
export const iwdState = new IwdState()

async function pollIwd() {
    const output = await execAsync(`${GLib.get_user_config_dir()}/ags/modules/network/scripts/iwd.sh`)
    const result = JSON.parse(output)
    iwdState.isMainWifi = result.isMainWifi
    iwdState.adapterMode = result.adapterMode
    if (result.adapterMode === "station") {
        iwdState.isPowered = result.isPowered
        iwdState.isConnected = result.isConnected
        iwdState.networkName = result.networkName
        iwdState.IPv4 = result.IPv4
        iwdState.IPv6 = result.IPv6
        iwdState.macAddress = result.macAddress
        iwdState.signalStrength = result.signalStrength
        iwdState.frequency = (result.frequency / 1000)
        iwdState.iconName = result.iconName
        iwdState.downloadSpeed = result.downloadSpeed
        iwdState.uploadSpeed = result.uploadSpeed
    }
    console.log(iwdState)
    timeout(1000, pollIwd)
}

export function WifiSystemStatus() {
    switch (settings.network.wifiBackend) {
        case "iwd":
            return (
                <box name="wifi" $type="center">
                    <image
                        iconName={createBinding(iwdState, "iconName")}
                        pixelSize={`${settings.scale * 24}`}
                    />
                </box>
            )
    }
}

export function WifiMenuEntry() {
    switch (settings.network.wifiBackend) {
        case "iwd":
            pollIwd()
            return (
                <button name="quickSettings" class="wifiMenuEntry" onClicked={() => console.log("test")}>
                <image
                    iconName={createBinding(iwdState, "iconName")}
                    css={`padding-right: ${scaleFactor * 8}px;`}
                />
                    <box orientation={Gtk.Orientation.VERTICAL} homogeneous={true}>
                        <label label={createBinding(iwdState, "isConnected")((c) => {
                                return c ? "Connected" : "Disconnected"
                            })}
                        />
                        <label label={createBinding(iwdState, "networkName")}/>
                    </box>
                </button>
            )
        case "networkManager":
            return (
                <button name="quickSettings" class="wifiMenuEntry" onClicked={() => console.log("test")}>
                <image
                    iconName={createBinding(iwdState, "iconName")}
                    css={`padding-right: ${scaleFactor * 8}px;`}
                />
                    <box orientation={Gtk.Orientation.VERTICAL} homogeneous={true}>
                        <label label={createBinding(iwdState, "isConnected")((c) => {
                                return c ? "Connected" : "Disconnected"
                            })}
                        />
                        <label label={createBinding(iwdState, "networkName")}/>
                    </box>
                </button>
            )

    }
}
