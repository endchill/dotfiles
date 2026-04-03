import { readFile } from "ags/file"
import { execAsync } from "ags/process"
import { scaleFactor } from "../../app.tsx"

const settings = JSON.parse(readFile("./settings.json"))

export function Power() {
    return (
        <button name="power" onClicked={() => {execAsync("wlogout")}}>
            <image iconName="system-shutdown" pixelSize={`${scaleFactor * 24}`}/>
        </button>
    )
}
