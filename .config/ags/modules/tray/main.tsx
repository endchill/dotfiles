import Gtk from "gi://Gtk?version=4.0"
import AstalTray from "gi://AstalTray"
import { For, createBinding } from "ags"

const tray = AstalTray.get_default()
const items = createBinding(tray, "items")
const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
    btn.menuModel = item.menuModel
    btn.insert_action_group("dbusmenu", item.actionGroup)
    item.connect("notify::action-group", () => {
        btn.insert_action_group("dbusmenu", item.actionGroup)
    })
}

export function TrayBar() {
    return (
        <box name="trayBar" vexpand={false}>
            <For each={items}>
                {(item) => (
                    <menubutton class="entry" $={(self) => init(self, item)}>
                        <image gicon={createBinding(item, "gicon")}/>
                    </menubutton>
                )}
            </For>
        </box>
    )
}
