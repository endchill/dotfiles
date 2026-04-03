import Gtk from "gi://Gtk?version=4.0"
import AstalWp from "gi://AstalWp"
import { createBinding } from "ags"
import { readFile } from "ags/file"

const settings = JSON.parse(readFile("./settings.json"))
const { defaultSpeaker: speaker } = AstalWp.get_default()!
const curveExponent = settings.audio.volumeCurve
const volumeToSlider = (v: number) => Math.pow(v, 3 / curveExponent)
const sliderToVolume = (s: number) => Math.pow(s, curveExponent / 3)

export function DefaultOutputVolume() {
    return (
        <slider
            hexpand
            max={1}
            min={0}
            round_digits={2}
            step={0.02}
            value={createBinding(speaker, "volume")(volumeToSlider)}
            onChangeValue={({ value }) => {
                speaker.set_volume(sliderToVolume(value))
            }}
        />
    )
}
