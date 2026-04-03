import Gtk from "gi://Gtk?version=4.0"
import AstalBluetooth from "gi://AstalBluetooth"
import { createBinding } from "ags"
import { scaleFactor } from "../../app.tsx"

const bluetooth = AstalBluetooth.get_default()

export function BluetoothMenuEntry() {
    return (
        <button name="quickSettings" class="bluetoothMenuEntry" onClicked={() => console.log("test")}>
            <image iconName="bluetooth-active" css={`padding-right: ${scaleFactor * 8}px;`}/>
            <box orientation={Gtk.Orientation.VERTICAL} homogeneous={true}>
                    <label label={createBinding(bluetooth, "isPowered")((b) => {
                        return b ? "On" : "Off"
                    })}/>
                    <label label={createBinding(bluetooth, "isConnected")((b) => {
                        return b ? "Connected" : "Disconnected"
                    })}/>
            </box>
        </button>
    )
}
