#!/usr/bin/env bash

set -eu -o pipefail

if [[ "$EUID" != 0 ]]; then
    printf 'This script needs to run as root\n'
    exit 1
fi

if [[ -f "$XDG_CONFIG_HOME/.endchill's_installer" ]]; then
    printf 'Error: This system was already configured by this installer.\nRemove '/home/user/.config/.installer_stamp' to bypass this check.\n'
    exit 1
fi

ucode="amd-ucode"
aur_helper="yay"
use_paru=false
rootpw=true
confirm=false
install_nvidia_drivers=false
random=$RANDOM

uid=$(id --user $username)
home_dir=$(getent passwd $uid | awk -F ':' '{print $6}')

pacstrap_packages=(
    base
    base-devel
    linux
    linux-firmware
    linux-headers
    linux-lts
    linux-lts-headers
    linux-rt
    linux-rt-headers
    linux-zen
    linux-zen-headers
)
pacstrap_packages+=("$ucode")
pacman_packages=(
    alacritty
    archlinux-xdg-menu
    bluejay
    breeze
    breeze-icons
    brightnessctl
    cifs-utils
    clipvault-bin
    cosmic-greeter
    dolphin
    downgrade
    earlyoom
    firefox
    flatpak
    freedownloadmanager
    git
    gnome-disk-utility
    greetd
    grimblast
    grimblast-git
    gtk2
    gwenview
    hyprcursor
    hyprland
    hyprlock
    hyprpaper
    hyprpicker
    hyprshutdown
    hyprwire
    iw
    iwd
    jpeg2png-git
    jq
    kate
    kdeconnect
    krita
    man
    mpv
    nerd-fonts
    networkmanager
    openssh
    pipewire
    pipewire-alsa
    pipewire-jack
    pipewire-pulse
    playerctl
    polkit-kde-agent
    puddletag
    qarma-git
    qt6ct-kde
    rsync
    sassc
    scrcpy
    spek
    steam
    tailscale
    tmux
    uwsm
    waybar
    wget
    wine-staging
    wl-clip-persist
    wl-clipboard
    xdg-desktop-portal
    xdg-desktop-portal-gtk
    xdg-desktop-portal-hyprland
    yt-dlp
    zip
    zsh
)
aur_packages=(
#     kvantum-qt6-git
)
flatpak_package=(
    com.dec05eba.gpu_screen_recorder
    com.github.tchx84.Flatseal
    dev.vencord.Vesktop
    io.github.benjamimgois.goverlay
    md.obsidian.Obsidian
    net.lutris.Lutris
#     com.github.wwmm.easyeffects
#     org.kde.ark
#     org.kde.dolphin
#     org.kde.gwenview
#     org.kde.kate
#     org.kde.krita
)

get_latest_release() {
    local repo="$1"
    local filename="$2"
    local extension="$3"
    curl -fsSL "https://api.github.com/repos/$repo/releases/latest" | \
    jq -r --arg name "$filename$extension" '.assets[] | select(.name == $name) | .browser_download_url'
}

if [[ "$rootpw" == true ]]; then
    chmod 640 "/etc/sudoers"
    printf '\n# Make sudo require root password\nDefaults rootpw' >> /etc/sudoers
    chmod 440 "/etc/sudoers"
fi

useradd -m $username
printf '%s:%s\n' "$username" "$password" | chpasswd
usermod -aG wheel $username
sed -i 's/^# %wheel ALL=(ALL:ALL) ALL$/%wheel ALL=(ALL:ALL) ALL/' "/etc/sudoers"

disk_configuration() {
    {
        printf '\033[31m[directory]\033[0m \033[31m[size]\033[0m\n'
        lsblk -p | awk '
            /disk/ {printf "\033[36m%s\033[0m \033[32m%s\n\033[0m", $1, $4}
            /part/ {printf "\033[34m%s\033[0m \033[32m%s\n\033[0m", $1, $4}
        '
    } | column -t

    printf 'Enter disk directory to install on\n'
    printf '\te.g. \033[36m/dev/sda\033[0m: '

    #TODO write a system to check if the input disk is a valid disk or not

    read -r disk
    printf 'This will wipe \033[31m%s\033[0m, no return point\n' "$disk"
    printf '\tprocess? [y/N]: '
    read -r confirm_format

    [[ "$confirm_format" =~ ^[Yy]$ ]] || { printf 'operation cancelled\n' && exit 1 }

    printf 'Are you sure? [y/N]\n: '
    read -r confirm_format

    if [[ "$confirm_format" =~ ^[Yy]$ ]]; then
        printf 'formating...\n'

        mount "/dev/$root_partition" "/mnt"
        mount "/dev/$boot_partition" "/mnt/boot"
    else
        printf 'operation cancelled\n'
        exit 1
    fi
}

configuring_base() {
    pacstrap -K /mnt "$pacstrap_packages"
    genfstab -U /mnt >> /mnt/etc/fstab
}

configuring_bootloader() {
    local root_partition=$1

    bootctl install

    cat << EOF > loader.conf
default arch-zen.conf
timeout 0
auto-entries 0
editor yes
EOF

    cat << EOF > /boot/loader/entries/arch.conf
title   Arch Linux Stable Kernel
linux   /vmlinuz-linux
initrd  /initramfs-linux.img
initrd  /$ucode.img
options root=UUID=$root_partition rw zswap.enabled=0
EOF

    cat << EOF > /boot/loader/entries/arch-lts.conf
# title   Arch Linux LTS Kernel
linux   /vmlinuz-linux-lts
initrd  /initramfs-linux-lts.img
initrd  /$ucode.img
options root=UUID=$root_partition rw zswap.enabled=0
EOF

    cat << EOF > /boot/loader/entries/arch-zen.conf
title   Arch Linux Zen Kernel
linux   /vmlinuz-linux-zen
initrd  /initramfs-linux-zen.img
initrd  /$ucode.img
options root=UUID=$root_partition rw zswap.enabled=0
EOF

    cat << EOF > /boot/loader/entries/arch-rt.conf
title   Arch Linux Real-Time Kernel
linux   /vmlinuz-linux-rt
initrd  /initramfs-linux-rt.img
initrd  /$ucode.img
options root=UUID=$root_partition rw zswap.enabled=0
EOF

    bootctl update
}

printf '%s ALL=(ALL) NOPASSWD: /usr/bin/pacman\n' "$username" > /etc/sudoers.d/tmp
chmod 440 "/etc/sudoers.d/tmp"

if [[ "$use_paru" == true ]]; then
    sudo -u $username bash -c "git clone https://aur.archlinux.org/paru.git "/tmp/$random" && (cd "/tmp/$random" && makepkg -si --noconfirm)"
else
    sudo -u $username bash -c "git clone https://aur.archlinux.org/yay.git "/tmp/$random" && (cd "/tmp/$random" && makepkg -si --noconfirm)"
fi

pacman -S --noconfirm "$pacman_packages"
flatpak remote-add --if-not-exists flathub "https://dl.flathub.org/repo/flathub.flatpakrepo"
flatpak install --assumeyes "$flatpak_package"
sudo -u $username bash -c "$aur_helper -S --noconfirm "$aur_packages""

sudo -u $username bash -c "
    curl -L -o "/tmp/Bibata-Modern-Ice.tar.xz" $(get_latest_release "ful1e5/Bibata_Cursor" "Bibata-Modern-Ice" ".tar.xz")
    curl -L -o "/tmp/hypr_Bibata-Modern-Ice.tar.gz" $(get_latest_release "LOSEARDES77/Bibata-Cursor-hyprcursor" "hypr_Bibata-Modern-Ice" ".tar.gz")
    tar -xf "/tmp/Bibata-Modern-Ice.tar.xz" -C "$home_dir/.local/share/icons"
    tar -xf "/tmp/hypr_Bibata-Modern-Ice.tar.gz" -C "$home_dir/.local/share/icons/Bibata-Modern-Ice"
"

finishing() {
    rm -fr "/tmp/$random"
    rm -f "/etc/sudoers.d/tmp"
    touch "/mnt/home/$username/."
}

exit 0

dd if=/dev/zero of=/var/swap.img bs=1M count=4096
chmod 600 /var/swap.img

usermod -aG audio,video $USER

printf '\nis_artix="1"\n' >> /etc/environment
