import GLib from "gi://GLib?version=2.0"
import Gtk from "gi://Gtk?version=4.0"
import { createPoll } from "ags/time"

const display = createPoll({
    text: "--:--",
    klass: ""
}, 1000, () => {
    return {
        text: GLib.DateTime.new_now_local().format('%I:%M %p'),
        klass: GLib.DateTime.new_now_local().format("%p") === "AM" ? "am" : "pm"
    }
})

export function Clock() {
    return (
        <box>
        <button
        name="clock"
        label={display((d) => d.text)}
        class={display((d) => d.klass)}
        onClicked={() => clockState.date = !clockState.date}
        $={(self) => {
            const rightClick = Gtk.GestureClick.new()
            rightClick.set_button(3)
            rightClick.connect("released", () => {
                console.log("right")
            })

            self.add_controller(rightClick)
        }}
        />
        </box>
    )
}
