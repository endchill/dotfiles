#!/usr/bin/env bash

set -eu -o pipefail

if [[ "$EUID" != 0 ]]; then
    echo "This script needs run as root"
    exit 1
fi

if [[ "" == "" ]];then
fi

ucode="amd-ucode"
aur_helper="yay"
use_paru=false
rootpw=true
install_nvidia_drivers=false
random=$RANDOM

for arg in "$@";do
    case "$arg" in
        "--use-paru")
            aur_helper="paru"
            use_paru=true
        ;;
        "--disable-rootpw")
            rootpw=false
        ;;
        "--intel-ucode")
            ucode="intel-ucode"
        ;;
        "--nvidia")
            install_nvidia_drivers=true
        ;;
    esac
done

useradd -m $username
echo "$username:$password" | chpasswd
usermod -aG wheel $username
sed -i 's/^# %wheel ALL=(ALL:ALL) ALL$/%wheel ALL=(ALL:ALL) ALL/' "/etc/sudoers"

if [[ "$rootpw" == true ]]; then
    chmod 640 "/etc/sudoers"
    echo -e "\n# Make sudo require root password\nDefaults rootpw" >> "/etc/sudoers"
    chmod 440 "/etc/sudoers"
fi

uid=$(id --user $username)
home_dir=$(getent passwd $uid | awk -F ':' '{print $6}')

pacman_packages=(
    alacritty
    breeze
    breeze-gtk
    breeze-icons
    cosmic-greeter
    dolphin
    flatpak
    git
    greetd
    grimblast
    hyprcursor
    hyprland
    hyprlock
    hyprpaper
    hyprpicker
    hyprwire
    jq
    nerd-fonts
    openssh
    polkit-kde-agent
    rsync
    tailscale
    uwsm
    waybar
    wget
    xdg-desktop-portal
    xdg-desktop-portal-gtk
    xdg-desktop-portal-hyprland
    zip
    zsh
)
pacman_packages+=("$ucode")
aur_packages=(
    freedownloadmanager
    hyprshutdown
    qt6ct-kde
)
flatpak_package=(
    com.dec05eba.gpu_screen_recorder
    com.discordapp.Discord
    com.github.tchx84.Flatseal
    com.github.wwmm.easyeffects
    dev.vencord.Vesktop
    net.lutris.Lutris
    org.kde.gwenview
    org.kde.kate
    org.kde.krita
)

echo "$username ALL=(ALL) NOPASSWD: /usr/bin/pacman" > "/etc/sudoers.d/tmp"
chmod 440 "/etc/sudoers.d/tmp"

if [[ "$use_paru" == true ]]; then
    sudo -u $username bash -c "git clone https://aur.archlinux.org/paru.git "/tmp/$random" && (cd "/tmp/$random" && makepkg -si --noconfirm)"
else
    sudo -u $username bash -c "git clone https://aur.archlinux.org/yay.git "/tmp/$random" && (cd "/tmp/$random" && makepkg -si --noconfirm)"
fi

pacman -S --noconfirm $pacman_packages
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --assumeyes $flatpak_package
sudo -u $username bash -c "$aur_helper -S --noconfirm $aur_packages"

get_latest_release() {
    local repo="$1"
    local filename="$2"
    local extension="$3"
    curl -fsSL "https://api.github.com/repos/$repo/releases/latest" | jq -r --arg name "${filename}${extension}" '.assets[] | select(.name == $name) | .browser_download_url'
}

curl -L -o "/tmp/Bibata-Modern-Ice.tar.xz" $(get_latest_release "ful1e5/Bibata_Cursor" "Bibata-Modern-Ice" ".tar.xz")
curl -L -o "/tmp/hypr_Bibata-Modern-Ice.tar.gz" $(get_latest_release "LOSEARDES77/Bibata-Cursor-hyprcursor" "hypr_Bibata-Modern-Ice" ".tar.gz")

rm -fr "/tmp/$random"
rm -f "/etc/sudoers.d/tmp"
