import GObject from "gi://GObject?version=2.0"

export class IwdState extends GObject.Object {
    private _isMainWifi: boolean = false
    private _adapterMode: string = ""
    private _isPowered: boolean = false
    private _isConnected: boolean = false
    private _networkName: string = ""
    private _IPv4: string = ""
    private _IPv6: string = ""
    private _macAddress: string = ""
    private _frequency: number = 0
    private _signalStrength: number = 0
    private _iconName: string = ""
    private _downloadSpeed: number = 0
    private _uploadSpeed: number = 0

    static {
        GObject.registerClass({
            Properties: {
                'is-main-wifi': GObject.ParamSpec.boolean(
                    'is-main-wifi', 'is-main-wifi', 'is-main-wifi',
                    GObject.ParamFlags.READWRITE,
                    false
                ),
                'adapter-mode': GObject.ParamSpec.string(
                    'adapter-mode', 'adapter-mode', 'adapter-mode',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'is-powered': GObject.ParamSpec.boolean(
                    'is-powered', 'is-powered', 'is-powered',
                    GObject.ParamFlags.READWRITE,
                    false
                ),
                'is-connected': GObject.ParamSpec.boolean(
                    'is-connected', 'is-connected', 'is-connected',
                    GObject.ParamFlags.READWRITE,
                    false
                ),
                'network-name': GObject.ParamSpec.string(
                    'network-name', 'network-name', 'network-name',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'IPv4': GObject.ParamSpec.string(
                    'IPv4', 'IPv4', 'IPv4',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'IPv6': GObject.ParamSpec.string(
                    'IPv6', 'IPv6', 'IPv6',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'mac-address': GObject.ParamSpec.string(
                    'mac-address', 'mac-address', 'mac-address',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'frequency': GObject.ParamSpec.double(
                    'frequency', 'frequency', 'frequency',
                    GObject.ParamFlags.READWRITE,
                    0, Number.MAX_VALUE, 0
                ),
                'signal-strength': GObject.ParamSpec.double(
                    'signal-strength', 'signal-strength', 'signal-strength',
                    GObject.ParamFlags.READWRITE,
                    0, Number.MAX_VALUE, 0
                ),
                'icon-name': GObject.ParamSpec.string(
                    'icon-name', 'icon-name', 'icon-name',
                    GObject.ParamFlags.READWRITE,
                    ""
                ),
                'download-speed': GObject.ParamSpec.double(
                    'download-speed', 'download-speed', 'download-speed',
                    GObject.ParamFlags.READWRITE,
                    0, Number.MAX_VALUE, 0
                ),
                'upload-speed': GObject.ParamSpec.double(
                    'upload-speed', 'upload-speed', 'upload-speed',
                    GObject.ParamFlags.READWRITE,
                    0, Number.MAX_VALUE, 0
                )
            }
        }, this)
    }

    get isMainWifi(): boolean {
        return this._isMainWifi
    }

    set isMainWifi(value: boolean) {
        if (this._isMainWifi === value) return
        this._isMainWifi = value
        this.notify('is-main-wifi')
    }

    get adapterMode(): string | null {
        return this._adapterMode
    }

    set adapterMode(value: string | null) {
        if (this._adapterMode === value) return
        this._adapterMode = value
        this.notify('adapter-mode')
    }

    get isPowered(): boolean {
        return this._isPowered
    }

    set isPowered(value: boolean) {
        if (this._isPowered === value) return
        this._isPowered = value
        this.notify('is-powered')
    }

    get isConnected(): boolean {
        return this._isConnected
    }

    set isConnected(value: boolean) {
        if (this._isConnected === value) return
        this._isConnected = value
        this.notify('is-connected')
    }

    get networkName(): string | null {
        return this._networkName
    }

    set networkName(value: string | null) {
        if (this._networkName === value) return
        this._networkName = value
        this.notify('network-name')
    }

    get IPv4(): string | null {
        return this._networkName
    }

    set IPv4(value: string | null) {
        if (this._IPv4 === value) return
        this._IPv4 = value
        this.notify('IPv4')
    }

    get IPv6(): string | null {
        return this._IPv6
    }

    set IPv6(value: string | null) {
        if (this._IPv6 === value) return
        this._IPv6 = value
        this.notify('IPv6')
    }

    get macAddress(): string | null {
        return this._macAddress
    }

    set macAddress(value: string | null) {
        if (this._macAddress === value) return
        this._macAddress = value
        this.notify('mac-address')
    }

    get frequency(): number {
        return this._frequency
    }

    set frequency(value: number) {
        if (this._frequency === value) return
        this._frequency = value
        this.notify('frequency')
    }

    get signalStrength(): number {
        return this._signalStrength
    }

    set signalStrength(value: number) {
        if (this._signalStrength === value) return
        this._signalStrength = value
        this.notify('signal-strength')
    }

    get iconName(): string | null {
        return this._iconName
    }

    set iconName(value: string | null) {
        if (this._iconName === value) return
        this._iconName = value
        this.notify('icon-name')
    }

    get maxDownloadSpeed(): number {
        return this._maxDownloadSpeed
    }

    set maxDownloadSpeed(value: number) {
        if (this._maxDownloadSpeed === value) return
        this._maxDownloadSpeed = value
        this.notify('max-download-speed')
    }

    get maxUploadSpeed(): number {
        return this._maxUploadSpeed
    }

    set maxUploadSpeed(value: number) {
        if (this._maxUploadSpeed === value) return
        this._maxUploadSpeed = value
        this.notify('max-upload-speed')
    }

    get downloadSpeed(): number {
        return this._downloadSpeed
    }

    set downloadSpeed(value: number) {
        if (this._downloadSpeed === value) return
        this._downloadSpeed = value
        this.notify('download-speed')
    }

    get uploadSpeed(): number {
        return this._uploadSpeed
    }

    set uploadSpeed(value: number) {
        if (this._uploadSpeed === value) return
        this._uploadSpeed = value
        this.notify('upload-speed')
    }
}
