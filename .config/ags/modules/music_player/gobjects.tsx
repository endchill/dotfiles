import GObject from "gi://GObject?version=2.0"
import GLib from "gi://GLib?version=2.0"

export class MpvStatus extends GObject.Object {
    private _filename: string = ""
    private _filePath: string = ""
    private _duration: number = null
    private _timePos: number = 0
    private _isPaused: boolean = false
    private _isShuffled: boolean = false
    private _isLoopFile: boolean = false
    private _isLoopPlaylist: boolean = false
    private _isPitchCorrectionDisable: boolean = false
    private _speed: number = 1.0
    private _pitch: number = 1.0

    static {
        GObject.registerClass({
            Properties: {
                'file-name': GObject.ParamSpec.string(
                    'file-name', 'file-name', 'file-name',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'file-path': GObject.ParamSpec.string(
                    'file-path', 'file-path', 'file-path',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'duration': GObject.ParamSpec.double(
                    'duration', 'duration', 'duration',
                    GObject.ParamFlags.READWRITE,
                    0, Number.MAX_VALUE, null
                ),
                'time-pos': GObject.ParamSpec.double(
                    'time-pos', 'time-pos', 'time-pos',
                    GObject.ParamFlags.READWRITE,
                    0, Number.MAX_VALUE, 0
                ),
                'is-paused': GObject.ParamSpec.boolean(
                    'is-paused', 'is-paused', 'is-paused',
                    GObject.ParamFlags.READWRITE,
                    false
                ),
                'is-shuffled': GObject.ParamSpec.boolean(
                    'is-shuffled', 'is-shuffled', 'is-shuffled',
                    GObject.ParamFlags.READWRITE,
                    false
                ),
                'is-loop-file': GObject.ParamSpec.boolean(
                    'is-loop-file', 'is-loop-file', 'is-loop-file',
                    GObject.ParamFlags.READWRITE,
                    false
                ),
                'is-loop-playlist': GObject.ParamSpec.boolean(
                    'is-loop-playlist', 'is-loop-playlist', 'is-loop-playlist',
                    GObject.ParamFlags.READWRITE,
                    false
                ),
                'is_pitch_correction_disable': GObject.ParamSpec.boolean(
                    'is_pitch_correction_disable', 'is_pitch_correction_disable', 'is_pitch_correction_disable',
                    GObject.ParamFlags.READWRITE,
                    false
                ),
                'speed': GObject.ParamSpec.double(
                    'speed', 'speed', 'speed',
                    GObject.ParamFlags.READWRITE,
                    0.25, 4.0, 1.0
                ),
                'pitch': GObject.ParamSpec.double(
                    'pitch', 'pitch', 'pitch',
                    GObject.ParamFlags.READWRITE,
                    0.25, 4.0, 1.0
                )
            }
        }, this)
    }

    get filename(): string | null {
        return this._filename
    }

    set filename(value: string | null) {
        if (this._filename === value) return
        this._filename = value
        this.notify('file-name')
    }

    get filePath(): string | null {
        return this._filePath
    }

    set filePath(value: string | null) {
        if (this._filePath === value) return
        this._filePath = value
        this.notify('file-path')
    }

    get duration(): number {
        return this._duration
    }

    set duration(value: number) {
        if (this._duration === value) return
        this._duration = value
        this.notify('duration')
    }

    get timePos(): number {
        return this._timePos
    }

    set timePos(value: number) {
        if (this._timePos === value) return
        this._timePos = value
        this.notify('time-pos')
    }

    get isPaused(): boolean {
        return this._isPaused
    }

    set isPaused(value: boolean) {
        if (this._isPaused === value) return
        this._isPaused = value
        this.notify('is-paused')
    }

    get isShuffled(): boolean {
        return this._isShuffled
    }

    set isShuffled(value: boolean) {
        if (this._isShuffled === value) return
        this._isShuffled = value
        this.notify('is-shuffled')
    }

    get isLoopFile(): boolean {
        return this._isLoopFile
    }

    set isLoopFile(value: boolean) {
        if (this._isLoopFile === value) return
        this._isLoopFile = value
        this.notify('is-loop-file')
    }

    get isLoopPlaylist(): boolean {
        return this._isLoopPlaylist
    }

    set isLoopPlaylist(value: boolean) {
        if (this._isLoopPlaylist === value) return
        this._isLoopPlaylist = value
        this.notify('is-loop-playlist')
    }

    get isPitchCorrectionDisable(): boolean {
        return this._isPitchCorrectionDisable
    }

    set isPitchCorrectionDisable(value: boolean) {
        if (this._isPitchCorrectionDisable === value) return
        this._isPitchCorrectionDisable = value
        this.notify('is_pitch_correction_disable')
    }

    get speed(): number {
        return this._speed
    }

    set speed(value: number) {
        if (this._speed === value) return
        this._speed = value
        this.notify('speed')
    }

    get pitch(): number {
        return this._pitch
    }

    set pitch(value: number) {
        if (this._pitch === value) return
        this._pitch = value
        this.notify('pitch')
    }
}

export class PlaylistMetadata extends GObject.Object {
    private _filePathUrl: string = ""

    static {
        GObject.registerClass({
            Properties: {
                'file-path-url': GObject.ParamSpec.string(
                    'file-path-url', 'file-path-url', 'file-path-url',
                    GObject.ParamFlags.READWRITE,
                    ""
                )
            }
        }, this)
    }
    get filePathUrl(): string | null {
        return this._filePathUrl
    }

    set filePathUrl(value: string | null) {
        if (this._filePathUrl === value) return
        this._filePathUrl = value
        this.notify('file-path-url')
    }
}

export class Metadata extends GObject.Object {
    private _album: string = ""
    private _albumArtist: string = ""
    private _artist: string = ""
    private _coverPath: string = `${GLib.get_user_config_dir()}/ags/icons/music_player/no_cover.svg`
    private _disc: number = null
    private _genre: string = ""
    private _title: string = ""
    private _track: number = null
    private _year: string = ""
    private _bitDepth: number = null
    private _bitRateKbps: number = null
    private _channels: string = ""
    private _codecName: string = ""
    private _durationMs: number = null
    private _sampleRate: number = null
    private _formatName = ""
    private _sampleFormat = ""

    static {
        GObject.registerClass({
            Properties: {
                'album': GObject.ParamSpec.string(
                    'album', 'album', 'album',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'album-artist': GObject.ParamSpec.string(
                    'album-artist', 'album-artist', 'album-artist',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'artist': GObject.ParamSpec.string(
                    'artist', 'artist', 'artist',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'cover-path': GObject.ParamSpec.string(
                    'cover-path', 'cover-path', 'cover-path',
                    GObject.ParamFlags.READWRITE,
                    `${GLib.get_user_config_dir()}/ags/icons/music_player/no_cover.svg`
                ),
                'disc': GObject.ParamSpec.int(
                    'disc', 'disc', 'disc',
                    GObject.ParamFlags.READWRITE,
                    0, 2147483647, null
                ),
                'genre': GObject.ParamSpec.string(
                    'genre', 'genre', 'genre',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'title': GObject.ParamSpec.string(
                    'title', 'title', 'title',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'track': GObject.ParamSpec.int(
                    'track', 'track', 'track',
                    GObject.ParamFlags.READWRITE,
                    0, 2147483647, null
                ),
                'year': GObject.ParamSpec.string(
                    'year', 'year', 'year',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'bit-depth': GObject.ParamSpec.int(
                    'bit-depth', 'bit-depth', 'bit-depth',
                    GObject.ParamFlags.READWRITE,
                    0, 2147483647, null
                ),
                'bit-rate-kbps': GObject.ParamSpec.int(
                    'bit-rate-kbps', 'bit-rate-kbps', 'bit-rate-kbps',
                    GObject.ParamFlags.READWRITE,
                    0, 2147483647, null
                ),
                'channels': GObject.ParamSpec.string(
                    'channels', 'channels', 'channels',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'codec-name': GObject.ParamSpec.string(
                    'codec-name', 'codec-name', 'codec-name',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'duration-ms': GObject.ParamSpec.int(
                    'duration-ms', 'duration-ms', 'duration-ms',
                    GObject.ParamFlags.READWRITE,
                    0, 2147483647, null
                ),
                'format-name': GObject.ParamSpec.string(
                    'format-name', 'format-name', 'format-name',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'sample-format': GObject.ParamSpec.string(
                    'sample-format', 'sample-format', 'sample-format',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'sample-rate': GObject.ParamSpec.int(
                    'sample-rate', 'sample-rate', 'sample-rate',
                    GObject.ParamFlags.READWRITE,
                    0, 2147483647, null
                )
            }
        }, this)
    }

    get album(): string | null {
        return this._album
    }

    set album(value: string | null) {
        if (this._album === value) return
        this._album = value
        this.notify('album')
    }

    get albumArtist(): string | null {
        return this._albumArtist
    }

    set albumArtist(value: string | null) {
        if (this._albumArtist === value) return
        this._albumArtist = value
        this.notify('album-artist')
    }

    get artist(): string | null {
        return this._artist
    }

    set artist(value: string | null) {
        if (this._artist === value) return
        this._artist = value
        this.notify('artist')
    }

    get coverPath(): string | null {
        return this._coverPath
    }

    set coverPath(value: string | null) {
        if (this._coverPath === value) return
        this._coverPath = value
        this.notify('cover-path')
    }

    get disc(): number {
        return this._disc
    }

    set disc(value: number) {
        if (this._disc === value) return
        this._disc = value
        this.notify('disc')
    }

    get genre(): string | null {
        return this._genre
    }

    set genre(value: string | null) {
        if (this._genre === value) return
        this._genre = value
        this.notify('genre')
    }

    get title(): string | null {
        return this._title
    }

    set title(value: string | null) {
        if (this._title === value) return
        this._title = value
        this.notify('title')
    }

    get track(): number {
        return this._track
    }

    set track(value: number) {
        if (this._track === value) return
        this._track = value
        this.notify('track')
    }

    get year(): string | null {
        return this._year
    }

    set year(value: string | null) {
        if (this._year === value) return
        this._year = value
        this.notify('year')
    }

    get bitDepth(): number {
        return this._bitDepth
    }

    set bitDepth(value: number) {
        if (this._bitDepth === value) return
        this._bitDepth = value
        this.notify('bit-depth')
    }

    get bitRateKbps(): number {
        return this._bitRateKbps
    }

    set bitRateKbps(value: number) {
        if (this._bitRateKbps === value) return
        this._bitRateKbps = value
        this.notify('bit-rate-kbps')
    }

    get channels(): string | null {
        return this._channels
    }

    set channels(value: string | null) {
        if (this._channels === value) return
        this._channels = value
        this.notify('channels')
    }

    get codecName(): string | null {
        return this._codecName
    }

    set codecName(value: string | null) {
        if (this._codecName === value) return
        this._codecName = value
        this.notify('codec-name')
    }

    get durationMs(): number {
        return this._durationMs
    }

    set durationMs(value: number) {
        if (this._durationMs === value) return
        this._durationMs = value
        this.notify('duration-ms')
    }

    get formatName(): string | null {
        return this._formatName
    }

    set formatName(value: string | null) {
        if (this._formatName === value) return
        this._formatName = value
        this.notify('format-name')
    }

    get sampleFormat(): string | null {
        return this._sampleFormat
    }

    set sampleFormat(value: string | null) {
        if (this._sampleFormat === value) return
        this._sampleFormat = value
        this.notify('sample-format')
    }

    get sampleRate(): number {
        return this._sampleRate
    }

    set sampleRate(value: number) {
        if (this._sampleRate === value) return
        this._sampleRate = value
        this.notify('sample-rate')
    }
}

export class Labels extends GObject.Object {
    private _barFirstLine: string = ""
    private _barSecondLine: string = ""
    private _sidePanelFirstLine: string = ""
    private _sidePanelSecondLine: string = ""
    private _sidePanelThirdLine: string = ""
    private _popupFirstLine: string = ""
    private _popupSecondLine: string = ""
    private _popupThirdLine: string = ""

    static {
        GObject.registerClass(
        {
            Properties: {
                "bar-first-line": GObject.ParamSpec.string(
                    "bar-first-line", "bar-first-line", "bar-first-line",
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                "bar-second-line": GObject.ParamSpec.string(
                    "bar-second-line", "bar-second-line", "bar-second-line",
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                "side-panel-first-line": GObject.ParamSpec.string(
                    "side-panel-first-line", "side-panel-first-line", "side-panel-first-line",
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                "side-panel-second-line": GObject.ParamSpec.string(
                    "side-panel-second-line", "side-panel-second-line", "side-panel-second-line",
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                "side-panel-third-line": GObject.ParamSpec.string(
                    "side-panel-third-line", "side-panel-third-line", "side-panel-third-line",
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                "popup-first-line": GObject.ParamSpec.string(
                    "popup-first-line", "popup-first-line", "popup-first-line",
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                "popup-second-line": GObject.ParamSpec.string(
                    "popup-second-line", "popup-second-line", "popup-second-line",
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                "popup-third-line": GObject.ParamSpec.string(
                    "popup-third-line", "popup-third-line", "popup-third-line",
                    GObject.ParamFlags.READWRITE,
                    ""
                )
            }
        }, this)
    }

    get barFirstLine(): string | null {
        return this._barFirstLine
    }

    set barFirstLine(value: string | null) {
        if (this._barFirstLine === value) return
        this._barFirstLine = value
        this.notify('bar-first-line')
    }
    get barSecondLine(): string | null {
        return this._barSecondLine
    }

    set barSecondLine(value: string | null) {
        if (this._barSecondLine === value) return
        this._barSecondLine = value
        this.notify('bar-second-line')
    }

    get sidePanelFirstLine(): string | null {
        return this._sidePanelFirstLine
    }

    set sidePanelFirstLine(value: string | null) {
        if (this._sidePanelFirstLine === value) return
        this._sidePanelFirstLine = value
        this.notify('side-panel-first-line')
    }

    get sidePanelSecondLine(): string | null {
        return this._sidePanelSecondLine
    }

    set sidePanelSecondLine(value: string | null) {
        if (this._sidePanelSecondLine === value) return
        this._sidePanelSecondLine = value
        this.notify('side-panel-second-line')
    }

    get sidePanelThirdLine(): string | null {
        return this._sidePanelThirdLine
    }

    set sidePanelThirdLine(value: string | null) {
        if (this._sidePanelThirdLine === value) return
        this._sidePanelThirdLine = value
        this.notify('side-panel-third-line')
    }

    get popupFirstLine(): string | null {
        return this._popupFirstLine
    }

    set popupFirstLine(value: string | null) {
        if (this._popupFirstLine === value) return
        this._popupFirstLine = value
        this.notify('popup-first-line')
    }

    get popupSecondLine(): string | null {
        return this._popupSecondLine
    }

    set popupSecondLine(value: string | null) {
        if (this._popupSecondLine === value) return
        this._popupSecondLine = value
        this.notify('popup-second-line')
    }

    get popupThirdLine(): string | null {
        return this._popupThirdLine
    }

    set popupThirdLine(value: string | null) {
        if (this._popupThirdLine === value) return
        this._popupThirdLine = value
        this.notify('popup-third-line')
    }
}
