import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"
import { extractMetadata } from "./functions.tsx"

// Recursively finds all audio files in the provided directories
function findAudioFiles(directories: string[]): string[] {
    // List of supported audio file extensions
    const audioExtensions = [".mp3", ".flac", ".ogg", ".m4a", ".wav", ".opus", ".aac"]
    const files: string[] = []

    // Recursively scan a directory and collect audio files
    function scanDirectory(dirPath: string) {
        try {
            // Open the directory using GIO
            const dir = Gio.File.new_for_path(dirPath)
            const enumerator = dir.enumerate_children(
                "standard::*",                      // Query all standard file attributes
                Gio.FileQueryInfoFlags.NONE,
                null
            )

            let fileInfo
            // Iterate through all entries in the directory
            while ((fileInfo = enumerator.next_file(null))) {
                const fileName = fileInfo.get_name()
                const filePath = GLib.build_filenamev([dirPath, fileName])
                const fileType = fileInfo.get_file_type()

                // If it's a directory, recursively scan it
                if (fileType === Gio.FileType.DIRECTORY) {
                    scanDirectory(filePath)
                }
                // If it's a regular file, check if it's an audio file
                else if (fileType === Gio.FileType.REGULAR) {
                    const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase()
                    if (audioExtensions.includes(ext)) {
                        files.push(filePath)
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to scan directory ${dirPath}:`, error)
        }
    }

    // Scan each provided directory
    directories.forEach(dir => scanDirectory(dir))
    return files
}

// Interface for JSPF track according to xspf.org specification
interface JSPFTrack {
    location: string[]    // Array of URIs for the track (JSPF requires array)
    title?: string        // Track title
    creator?: string      // Artist name
    album?: string        // Album name
    trackNum?: number     // Track number (JSPF uses trackNum, not track)
    duration?: number     // Duration in milliseconds
    meta?: Array<{ [key: string]: string }>  // Array of key-value objects for custom metadata
}

// Interface for JSPF playlist according to xspf.org specification
interface JSPFPlaylist {
    playlist: {
        title: string       // Playlist title (album/year/genre/artist name)
        track: JSPFTrack[]  // Array of track objects
        extension?: {       // Optional extension for application-specific data
            [key: string]: any
        }
    }
}

// Converts metadata object to JSPF track format according to xspf.org specification
function metadataToJSPFTrack(metadata: any): JSPFTrack {
    // Create the track object with required location field (must be array of URIs)
    const track: JSPFTrack = {
        location: [metadata.filePathUrl]  // Already has file:// prefix from extractMetadata
    }

    // Add standard JSPF fields if available
    if (metadata.title) track.title = metadata.title
        if (metadata.artist) track.creator = metadata.artist      // JSPF uses "creator" not "artist"
            if (metadata.album) track.album = metadata.album
                if (metadata.track !== null) track.trackNum = metadata.track  // JSPF uses "trackNum" not "track"
                    if (metadata.durationMs !== null) track.duration = metadata.durationMs  // Already in milliseconds

                        // Create meta array for custom metadata (disc, year, genre)
                        const meta: Array<{ [key: string]: string }> = []
                        if (metadata.disc !== null) {
                            meta.push({ "discNumber": metadata.disc.toString() })  // Store disc number in meta array
                        }
                        if (metadata.year) {
                            meta.push({ "year": metadata.year })  // Store year in meta array
                        }
                        if (metadata.genre) {
                            meta.push({ "genre": metadata.genre })  // Store genre in meta array
                        }

                        // Only add meta field if there's custom metadata
                        if (meta.length > 0) track.meta = meta

                            return track
}

// Creates a JSPF playlist object according to xspf.org specification
function createJSPF(title: string, tracks: any[], albumArtist?: string): JSPFPlaylist {
    // Create the playlist object with required title and track fields
    const playlist: JSPFPlaylist = {
        playlist: {
            title: title,  // Playlist title (album/year/genre/artist name)
            track: tracks.map(metadataToJSPFTrack)  // Convert all tracks to JSPF format
        }
    }

    // Add extension object if albumArtist is available (non-standard field)
    if (albumArtist) {
        playlist.playlist.extension = {
            "application": "ags-music_player",      // Application identifier
            "albumArtist": albumArtist        // Album artist stored in extension
        }
    }

    return playlist
}

// Creates a directory if it doesn't exist, including parent directories
function ensureDirectory(path: string) {
    const dir = Gio.File.new_for_path(path)
    if (!dir.query_exists(null)) {
        dir.make_directory_with_parents(null)  // Creates all parent directories as needed
    }
}

// Writes JSPF playlist to a file as formatted JSON
function writeJSPF(filePath: string, data: JSPFPlaylist) {
    const file = Gio.File.new_for_path(filePath)
    const content = JSON.stringify(data, null, 2)  // Pretty-print JSON with 2-space indentation
    file.replace_contents(
        content,
        null,
        false,
        Gio.FileCreateFlags.REPLACE_DESTINATION,  // Overwrite if file exists
        null
    )
}

// Removes invalid filename characters and trims whitespace
function sanitizeFilename(name: string): string {
    return name.replace(/[/\\?%*:|"<>]/g, "_").trim()
}

// Main function to generate JSPF playlists organized by album, year, genre, and artist
export async function generateMusicPlaylists(settings: { music: { filesDirectories: string[] } }) {
    try {
        // Get the user's home directory
        const homeDir = GLib.get_home_dir()
        // Build the cache directory path: ~/.cache/ags/music_player/playlists/
        const cacheDir = GLib.build_filenamev([homeDir, ".cache", "ags", "music_player", "playlists"])

        // Create subdirectories for each category
        const categories = ["album", "year", "genre", "artist"]
        categories.forEach(category => {
            ensureDirectory(GLib.build_filenamev([cacheDir, category]))
        })

        // Find all audio files in the configured directories
        const audioFiles = findAudioFiles(settings.music.filesDirectories)
        console.log(`Found ${audioFiles.length} audio files`)

        // Extract metadata from all audio files
        const metadataList: any[] = []
        for (const file of audioFiles) {
            try {
                const metadata = await extractMetadata(file)
                if (metadata) {
                    metadataList.push(metadata)
                }
            } catch (error) {
                console.error(`Failed to process file ${file}:`, error)
            }
        }

        // Create Maps to group tracks by different categories
        const groupedByAlbum = new Map<string, any[]>()
        const groupedByYear = new Map<string, any[]>()
        const groupedByGenre = new Map<string, any[]>()
        const groupedByArtist = new Map<string, any[]>()

        // Group each track into all four categories
        metadataList.forEach(metadata => {
            // Use "other" as fallback for missing or empty metadata, trim whitespace
            const album = (metadata.album && metadata.album.trim() && metadata.album !== "Unassigned") ? metadata.album.trim() : "other"
            const year = (metadata.year && metadata.year.trim() && metadata.year !== "Unassigned") ? metadata.year.trim() : "other"
            const genre = (metadata.genre && metadata.genre.trim() && metadata.genre !== "Unassigned") ? metadata.genre.trim() : "other"
            const artist = (metadata.artist && metadata.artist.trim() && metadata.artist !== "Unassigned") ? metadata.artist.trim() : "other"

            // Initialize arrays if this is the first track for this category value
            if (!groupedByAlbum.has(album)) groupedByAlbum.set(album, [])
                if (!groupedByYear.has(year)) groupedByYear.set(year, [])
                    if (!groupedByGenre.has(genre)) groupedByGenre.set(genre, [])
                        if (!groupedByArtist.has(artist)) groupedByArtist.set(artist, [])

                            // Add the track to each category
                            groupedByAlbum.get(album)!.push(metadata)
                            groupedByYear.get(year)!.push(metadata)
                            groupedByGenre.get(genre)!.push(metadata)
                            groupedByArtist.get(artist)!.push(metadata)
        })

        // Function to sort tracks by disc number, then track number, then alphabetically
        const sortTracks = (tracks: any[]) => {
            return tracks.sort((a, b) => {
                // First, sort by disc number
                if (a.disc !== b.disc) return (a.disc || 0) - (b.disc || 0)
                    // Then, sort by track number
                    if (a.track !== b.track) return (a.track || 0) - (b.track || 0)
                        // Finally, sort alphabetically by title (or file path if no title)
                        const titleA = (a.title || a.filePathUrl).toLowerCase()
                        const titleB = (b.title || b.filePathUrl).toLowerCase()
                        return titleA.localeCompare(titleB)
            })
        }

        // Generate JSPF files for each album
        groupedByAlbum.forEach((tracks, albumName) => {
            try {
                // Find albumArtist from the first track that has it
                const albumArtist = tracks.find(t => t.albumArtist && t.albumArtist !== "Unknown")?.albumArtist
                const sortedTracks = sortTracks(tracks)
                const jspf = createJSPF(albumName, sortedTracks, albumArtist)  // Create JSPF object with albumArtist
                const filePath = GLib.build_filenamev([cacheDir, "album", `${sanitizeFilename(albumName)}.jspf`])
                writeJSPF(filePath, jspf)  // Write JSPF to file
            } catch (error) {
                console.error(`Failed to generate album playlist for ${albumName}:`, error)
            }
        })

        // Generate JSPF files for each year
        groupedByYear.forEach((tracks, year) => {
            try {
                const sortedTracks = sortTracks(tracks)
                const jspf = createJSPF(year, sortedTracks)  // Create JSPF object without albumArtist
                const filePath = GLib.build_filenamev([cacheDir, "year", `${sanitizeFilename(year)}.jspf`])
                writeJSPF(filePath, jspf)  // Write JSPF to file
            } catch (error) {
                console.error(`Failed to generate year playlist for ${year}:`, error)
            }
        })

        // Generate JSPF files for each genre
        groupedByGenre.forEach((tracks, genre) => {
            try {
                const sortedTracks = sortTracks(tracks)
                const jspf = createJSPF(genre, sortedTracks)  // Create JSPF object without albumArtist
                const filePath = GLib.build_filenamev([cacheDir, "genre", `${sanitizeFilename(genre)}.jspf`])
                writeJSPF(filePath, jspf)  // Write JSPF to file
            } catch (error) {
                console.error(`Failed to generate genre playlist for ${genre}:`, error)
            }
        })

        // Generate JSPF files for each artist
        groupedByArtist.forEach((tracks, artist) => {
            try {
                const sortedTracks = sortTracks(tracks)
                const jspf = createJSPF(artist, sortedTracks)  // Create JSPF object without albumArtist
                const filePath = GLib.build_filenamev([cacheDir, "artist", `${sanitizeFilename(artist)}.jspf`])
                writeJSPF(filePath, jspf)  // Write JSPF to file
            } catch (error) {
                console.error(`Failed to generate artist playlist for ${artist}:`, error)
            }
        })

        console.log(`Generated playlists in ${cacheDir}`)
    } catch (error) {
        console.error("Failed to generate music playlists:", error)
        throw error
    }
}
