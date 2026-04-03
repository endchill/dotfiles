import Gtk from "gi://Gtk?version=4.0"
import AstalMpris from "gi://AstalMpris"


const mpris = AstalMpris.get_defaults

export function MediaHub() {
    return (
        <box orientation={Gtk.Orientation.VERTICAL}>
        </box>
    )
}
