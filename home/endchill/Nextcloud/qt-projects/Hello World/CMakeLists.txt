cmake_minimum_required(VERSION 3.16)
project(HelloWorld)

set(CMAKE_AUTOMOC ON)

find_package(Qt6 REQUIRED COMPONENTS Quick)

qt_add_executable(HelloWorld main.cpp)
qt_add_qml_module(HelloWorld URI HelloWorld VERSION 1.0 QML_FILES main.qml)

target_link_libraries(HelloWorld PRIVATE Qt6::Quick)
