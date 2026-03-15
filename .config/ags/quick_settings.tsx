import app from "ags/gtk4/app"
import Gtk from "gi://Gtk?version=4.0"
import Astal from "gi://Astal?version=4.0"
import { exec, execAsync } from "ags/process"
import { scaleFactor } from "./app.tsx"
import { WifiMenuEntry } from "./modules/network/wifi.tsx"
import { BluetoothMenuEntry } from "./modules/bluetooth/main.tsx"
import { DefaultOutputVolume } from "./modules/audio/main.tsx"
import { BatteryEntry } from "./modules/battery/main.tsx"
import { Tailscale } from "./modules/tailscale/main.tsx"
import { Power } from "./modules/power/main.tsx"

export function toggleQuickSettings() {
    const quickSettings = app.get_window("quickSettings")
    quickSettings.visible = !quickSettings.visible
}

function BrightnessSlider() {
    return (
        <slider
            hexpand
            max={100}
            min={0}
            round_digits={0}
            step={1}
            value={execAsync("brightnessctl -m i | sed -n '1p' | awk -F ',' '{print $4}' | sed 's/%//g'")}
            onChangeValue={({ value }) => {
                exec(`brightnessctl set ${value}%`)
            }}
        />
    )
}

export function quickSettings(monitor) {
    return (
        <window
            visible={false}
            name="quickSettings"
            class="window"
            application={app}
            monitor={monitor}
            exclusivity={Astal.Exclusivity.NORMAL}
            layer={Astal.Layer.TOP}
            keymode={Astal.Keymode.ON_DEMAND}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
        >
            <box orientation={Gtk.Orientation.VERTICAL}>
                <centerbox $type="start">
                    <box $type="start">
                        <Tailscale/>
                        <BatteryEntry/>
                    </box>
                    <box $type="end">
                        <Power/>
                    </box>
                </centerbox>
                <box orientation={Gtk.Orientation.VERTICAL} $type="center">
                    <box css={`margin-left: ${scaleFactor * 8}px;`}>
                        <image iconName="audio-volume-high-symbolic" pixelSize={`${scaleFactor * 16}`}/>
                        <DefaultOutputVolume/>
                    </box>
                    <box css={`margin-left: ${scaleFactor * 8}px;`}>
                        <image iconName="display-brightness-symbolic" pixelSize={`${scaleFactor * 16}`}/>
                        <BrightnessSlider/>
                    </box>
                </box>
                <box $type="end">
                    <box orientation={Gtk.Orientation.VERTICAL}>
                        <WifiMenuEntry/>
                        <button label="" name="quickSettings" class="menuEntry" hexpand onClicked={() => console.log("test")}/>
                        <button label="" name="quickSettings" class="menuEntry" hexpand onClicked={() => console.log("test")}/>
                    </box>
                    <box orientation={Gtk.Orientation.VERTICAL}>
                        <BluetoothMenuEntry/>
                        <button label="" name="quickSettings" class="menuEntry" hexpand onClicked={() => console.log("test")}/>
                        <button label="" name="quickSettings" class="menuEntry" hexpand onClicked={() => console.log("test")}/>
                    </box>
                </box>
            </box>
        </window>
    )
}
