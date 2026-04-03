import QtQuick 2.15
import QtQuick.Window 2.15

Window {
    visible: true
    width: 400
    height: 300
    title: "Hello World"

    Text {
        anchors.centerIn: parent
        text: "Hello, World!"
        font.pixelSize: 24
    }
}
