import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"
import Gtk from "gi://Gtk?version=4.0"
import { For, createBinding } from "ags"
import { readFile, writeFile } from "ags/file"
import { execAsync } from "ags/process"
import { scaleFactor } from "../../app.tsx"
import { MpvStatus, Metadata, PlaylistMetadata, Labels } from "./gobjects.tsx"
import { connectToSocket, mpvSendCommand, toggleSidePanel, toggleSecondSidePanel, toggleMusicPlayerPopup, cycleLoopState } from "./functions.tsx"
import { generateMusicPlaylists } from "./playlist_scanner.tsx"

export const mpvStatus = new MpvStatus()
export const metadata = new Metadata()
export const playlistMetadata = new PlaylistMetadata()
export const labels = new Labels()

const settings = JSON.parse(readFile("./settings.json"))
const maxSpeed = settings.music.maxSpeed
const minSpeed = settings.music.minSpeed
const maxPitch = settings.music.maxPitch
const minPitch = settings.music.minPitch
const audioDriver = settings.music.audioDriver

const cacheDir = GLib.build_filenamev([GLib.get_user_cache_dir(), "ags", "music_player"])
const playlistTypesDirs = GLib.build_filenamev([cacheDir, "playlists"])
const cacheFile = GLib.build_filenamev([cacheDir, "cache.json"])
const cache = JSON.parse(readFile(`${cacheFile}`))
const pause = cache.isPaused ? "yes" : "no"
const shuffle = cache.isShuffled ? "yes" : "no"
const loopPlaylist = cache.isLoopPlaylist ? "inf" : "no"
const loopFile = cache.isLoopFile ? "inf" : "no"
const speed = cache.speed
const pitch = cache.pitch

function getSubdirectories(path) {
    let directories = [];
    let file = Gio.File.new_for_path(path);

    try {
        let enumerator = file.enumerate_children(
            'standard::name,standard::type',
            Gio.FileQueryInfoFlags.NONE,
            null
        );

        let info;
        while ((info = enumerator.next_file(null)) !== null) {
            if (info.get_file_type() === Gio.FileType.DIRECTORY) {
                directories.push(info.get_name());
            }
        }
    } catch (e) {
        console.error(`Error reading directory: ${e.message}`);
    }

    return directories;
}

mpvStatus.speed = cache.speed
mpvStatus.pitch = cache.pitch
mpvStatus.isPitchCorrectionDisable = cache.isPitchCorrectionDisable

execAsync([
    "mpv",
    `--script=${GLib.get_user_config_dir()}/ags/modules/music_player/mpv_scripts/jspf_reader.lua`,
    `--pause=${pause}`,
    `--shuffle=${shuffle}`,
    `--loop-playlist=${loopPlaylist}`,
    `--loop-file=${loopFile}`,
    `--speed=${speed}`,
    `--pitch=${pitch}`,
    "--no-config",
    "--no-video",
    "--no-terminal",
    `--input-ipc-server=/tmp/ags_${GLib.get_user_name()}/mpv.socket`,
    "--ad-lavc-threads=0",
    `--audio-device=${audioDriver}`,
    "--idle",
    "/home/endchill/.cache/ags/music_player/playlists/album/CODZM Easter Egg Songs.jspf"
])

connectToSocket()

export function MusicPlayerBarCover() {
    return (
        <button visible={settings.music.bar.cover} class="musicPlayerCover" onClicked={() => toggleSidePanel()}>
        <image
            file={createBinding(metadata, "coverPath")}
            pixelSize={`${scaleFactor * 36}`}
        />
        </button>
    )
}

export function MusicPlayerBarLabel() {
    return (
        <button
            class="musicPlayerLabels"
            onClicked={() => toggleMusicPlayerPopup()}
            $={(self) => {
                const rightClick = Gtk.GestureClick.new()
                rightClick.set_button(3)
                rightClick.connect("released", () => {
                    mpvSendCommand({ command: ["cycle", "pause"] })
                })
                self.add_controller(rightClick)
            }}
        >
            <box orientation={Gtk.Orientation.VERTICAL} homogeneous={true}>
                <label visible={settings.music.bar.firstLineLabel} label={createBinding(labels, "barFirstLine")} class="firstLine"/>
                <label visible={settings.music.bar.secondLineLabel} label={createBinding(labels, "barSecondLine")} class="secondLine"/>
            </box>
        </button>
    )
}

export function MusicPlayerControls() {
    return (
        <box class="musicPlayerControls">
            <button onClicked={() => cycleLoopState()}>
                <image
                    iconName={createBinding(mpvStatus, "isLoopFile")((s) => s === "inf" ? "media-playlist-repeat-song" : "media-playlist-repeat")}
                    class={createBinding(mpvStatus, "isLoopFile")((l) => l ? "on" : "off")}
                    pixelSize={`${scaleFactor * 16}`}
                    css={`-gtk-icon-transform: scale(${scaleFactor});`}
                />
            </button>
            <button onClicked={() => mpvSendCommand({ command: ["playlist-prev"] })}>
                <image
                    iconName="media-skip-backward"
                    pixelSize={`${scaleFactor * 16}`}
                    css={`-gtk-icon-transform: scale(${scaleFactor});`}
                />
            </button>
            <button onClicked={() => mpvSendCommand({ command: ["cycle", "pause"] })}
                $={(self) => {
                    const rightClick = Gtk.GestureClick.new()
                    rightClick.set_button(3)
                    rightClick.connect("released", () => {
                        mpvSendCommand({ command: ["stop"] })
                    })

                    self.add_controller(rightClick)
                }}
            >
                <image
                    iconName={createBinding(mpvStatus, "isPaused")((p) => p ? "media-playback-start" : "media-playback-pause")}
                    pixelSize={`${scaleFactor * 16}`}
                    css={`-gtk-icon-transform: scale(${scaleFactor});`}
                />
            </button>
            <button onClicked={() => mpvSendCommand({ command: ["playlist-next"] })}>
                <image
                    iconName="media-skip-forward"
                    pixelSize={`${scaleFactor * 16}`}
                    css={`-gtk-icon-transform: scale(${scaleFactor});`}
                />
            </button>
            <button onClicked={() => mpvSendCommand({ command: ["cycle", "shuffle"] })}>
                <image
                    iconName="media-playlist-shuffle"
                    class={createBinding(mpvStatus, "isShuffled")((s) => s ? "on" : "off")}
                    pixelSize={`${scaleFactor * 16}`}
                    css={`-gtk-icon-transform: scale(${scaleFactor});`}
                />
            </button>
        </box>
    )
}

export function MusicPlayerSidePanel() {
    return (
        <box name="musicPlayerSidePanel" orientation={Gtk.Orientation.VERTICAL}>
            <button visible={settings.music.sidePanel.cover} class="cover" onClicked={() => toggleSecondSidePanel()}>
                <image
                    visible={settings.music.sidePanel.cover}
                    file={createBinding(metadata, "coverPath")}
                    pixelSize={`${scaleFactor * 480}`}
                />
            </button>
            <box orientation={Gtk.Orientation.VERTICAL}>
                <label visible={settings.music.sidePanel.firstLineLabel} label={createBinding(labels, "sidePanelFirstLine")}/>
                <label visible={settings.music.sidePanel.secondLineLabel}  label={createBinding(labels, "sidePanelSecondLine")}/>
                <label visible={settings.music.sidePanel.thirdLineLabel}  label={createBinding(labels, "sidePanelThirdLine")}/>
            </box>
            <box orientation={Gtk.Orientation.VERTICAL}>
                <slider
                    class="timePosSlider"
                    max={createBinding(mpvStatus, "duration")}
                    min={0}
                    round_digits={7}
                    value={createBinding(mpvStatus, "timePos")}
                    onChangeValue={({ value }) => {
                        mpvSendCommand({ command: ["set_property", "time-pos", value] })
                    }}
                />
                <slider
                    max={settings.music.speedScale === "semitones" ?
                        Math.round(12 * Math.log2(maxSpeed)) :
                        maxSpeed}
                    min={settings.music.speedScale === "semitones" ?
                        Math.round(12 * Math.log2(minSpeed)) :
                        minSpeed}
                    round_digits={settings.music.speedScale === "semitones" ? 0 : 2}
                    value={settings.music.speedScale === "semitones" ?
                        createBinding(mpvStatus, "speed")(speed => Math.round(12 * Math.log2(speed))) :
                        createBinding(mpvStatus, "speed")}
                    onChangeValue={({ value }) => {
                        const speed = settings.music.speedScale === "semitones" ?
                                    Math.pow(2, value / 12) :
                                    value.toFixed(2)
                        mpvSendCommand({ command: ["set_property", "speed", speed] })
                        cache.speed = speed
                        if (mpvStatus.isPitchCorrectionDisable) {
                            mpvSendCommand({ command: ["set_property", "pitch", speed] })
                            cache.pitch = speed
                        }
                        writeFile(cacheFile, JSON.stringify(cache))
                    }}
                    $={(self) => {
                        if (settings.music.speedScale === "multipliers") {
                            if (minSpeed % 0.5 !== 0) {
                                self.add_mark(minSpeed, Gtk.PositionType.TOP, minSpeed.toFixed(2) + "x")
                                self.add_mark(minSpeed, Gtk.PositionType.BOTTOM, "")
                            }
                            for (let speed = Math.ceil(minSpeed * 2) / 2; speed <= maxSpeed; speed += 0.5) {
                                self.add_mark(speed, Gtk.PositionType.TOP, speed.toFixed(1) + "x")
                                self.add_mark(speed, Gtk.PositionType.BOTTOM, "")
                            }
                        } else if (settings.music.speedScale === "semitones") {
                            const minSemitones = Math.round(12 * Math.log2(minSpeed))
                            const maxSemitones = Math.round(12 * Math.log2(maxSpeed))
                            for (let semitone = minSemitones; semitone <= maxSemitones; semitone++) {
                                const label = semitone % 6 === 0 ? semitone.toString() : ""
                                self.add_mark(semitone, Gtk.PositionType.TOP, label)
                                self.add_mark(semitone, Gtk.PositionType.BOTTOM, "")
                            }
                        }
                    }}
                />
                <slider
                    max={cache.disablePitchCorrection ?
                        (settings.music.pitchScale === "semitones" ?
                        Math.round(12 * Math.log2(maxSpeed)) :
                        maxSpeed) :
                        (settings.music.pitchScale === "semitones" ?
                        maxPitch :
                        Math.pow(2, maxPitch / 12))}
                    min={cache.disablePitchCorrection ?
                        (settings.music.pitchScale === "semitones" ?
                        Math.round(12 * Math.log2(minSpeed)) :
                        minSpeed) :
                        (settings.music.pitchScale === "semitones" ?
                        minPitch :
                        Math.pow(2, minPitch / 12))}
                    round_digits={settings.music.pitchScale === "semitones" ? 0 : 2}
                    value={settings.music.pitchScale === "semitones" ?
                        createBinding(mpvStatus, "pitch")(pitch => Math.round(12 * Math.log2(pitch))) :
                        createBinding(mpvStatus, "pitch")}
                    onChangeValue={({ value }) => {
                        const pitch = settings.music.pitchScale === "semitones" ?
                                    Math.pow(2, value / 12) :
                                    value
                        mpvSendCommand({ command: ["set_property", "pitch", pitch] })
                        cache.pitch = pitch
                        if (mpvStatus.isPitchCorrectionDisable) {
                            mpvSendCommand({ command: ["set_property", "speed", pitch] })
                            cache.speed = pitch
                        }
                        writeFile(cacheFile, JSON.stringify(cache))
                    }}
                    $={(self) => {
                        const actualMinPitch = cache.disablePitchCorrection ? Math.round(12 * Math.log2(minSpeed)) : minPitch
                        const actualMaxPitch = cache.disablePitchCorrection ? Math.round(12 * Math.log2(maxSpeed)) : maxPitch

                        if (settings.music.pitchScale === "multipliers") {
                            const minMultiplier = Math.pow(2, actualMinPitch / 12)
                            const maxMultiplier = Math.pow(2, actualMaxPitch / 12)
                            if (minMultiplier % 0.5 !== 0) {
                                self.add_mark(minMultiplier, Gtk.PositionType.TOP, minMultiplier.toFixed(2) + "x")
                                self.add_mark(minMultiplier, Gtk.PositionType.BOTTOM, "")
                            }
                            for (let speed = Math.ceil(minMultiplier * 2) / 2; speed <= maxMultiplier; speed += 0.5) {
                                self.add_mark(speed, Gtk.PositionType.TOP, speed.toFixed(1) + "x")
                                self.add_mark(speed, Gtk.PositionType.BOTTOM, "")
                            }
                        } else if (settings.music.pitchScale === "semitones") {
                            for (let semitone = actualMinPitch; semitone <= actualMaxPitch; semitone++) {
                                const label = semitone % 6 === 0 ? semitone.toString() : ""
                                self.add_mark(semitone, Gtk.PositionType.TOP, label)
                                self.add_mark(semitone, Gtk.PositionType.BOTTOM, "")
                            }
                        }
                    }}
                />
            </box>
            <centerbox>
                <MusicPlayerControls $type="center"/>
            </centerbox>
        </box>
    )
}

export function musicPlayerPopup(monitor) {
    return (
        <window
            visible={false}
            name="musicPlayerPopup"
            class="window"
            application={app}
            monitor={monitor}
            exclusivity={Astal.Exclusivity.NORMAL}
            layer={Astal.Layer.TOP}
            keymode={Astal.Keymode.ON_DEMAND}
            anchor={Astal.WindowAnchor.TOP}
        >
            <box>
                <button visible={settings.music.sidePanel.cover} class="cover" onClicked={() => toggleSecondSidePanel()}>
                    <image
                        visible={settings.music.sidePanel.cover}
                        file={createBinding(metadata, "coverPath")}
                        pixelSize={`${scaleFactor * 240}`}
                    />
                </button>
                <box orientation={Gtk.Orientation.VERTICAL}>
                    <centerbox orientation={Gtk.Orientation.VERTICAL}>
                        <label visible={settings.music.popup.firstLineLabel} label={createBinding(labels, "sidePanelFirstLine")}/>
                        <label visible={settings.music.popup.secondLineLabel}  label={createBinding(labels, "sidePanelSecondLine")}/>
                        <label visible={settings.music.popup.thirdLineLabel}  label={createBinding(labels, "sidePanelThirdLine")}/>
                        <slider
                            max={createBinding(mpvStatus, "duration")}
                            min={0}
                            round_digits={7}
                            value={createBinding(mpvStatus, "timePos")}
                            onChangeValue={({ value }) => {
                                mpvSendCommand({ command: ["set_property", "time-pos", value] })
                            }}
                        />
                        <MusicPlayerControls $type="center"/>
                    </centerbox>
                </box>
            </box>
        </window>
    )
}

export function MusicPlayerMusicLibrary() {
    return (
        <box orientation={Gtk.Orientation.VERTICAL}>
            <centerbox class="titleBar">
                <button $type="start"
                    onClicked={async () => await generateMusicPlaylists(settings)}
                >
                    <image iconName="view-refresh"/>
                </button>
                <button $type="end"
                    onClicked={() => toggleSecondSidePanel()}
                >
                    <image iconName="window-close"/>
                </button>
            </centerbox>
            <slider
                max={1}
                min={0}
                value={1}
                hasOrigin={true}
                drawValue={false}
            />

        </box>
    )
}
