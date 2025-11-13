/* ===========================
   Audio Player Controller
   =========================== */

class AudioPlayer {
    constructor() {
        // Audio element
        this.audio = document.getElementById('audioPlayer');

        // Player controls
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        this.volumeBtn = document.getElementById('volumeBtn');

        // Progress elements
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressHandle = document.getElementById('progressHandle');
        this.currentTimeEl = document.getElementById('currentTime');
        this.totalTimeEl = document.getElementById('totalTime');

        // Volume elements
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeSliderInput = document.getElementById('volumeSliderInput');

        // Album art
        this.albumArt = document.getElementById('albumArt');

        // State
        this.isPlaying = false;
        this.isRepeating = false;
        this.isDragging = false;
        this.currentVolume = 0.7;

        // Playlist
        this.playlist = [
            {
                title: 'Pray',
                artist: 'ThaMyind',
                src: 'assets/audio/pray.mp3',
                cover: 'assets/videos/pray.mp4'
            }
        ];
        this.currentTrackIndex = 0;

        this.init();
    }

    init() {
        // Set initial volume
        this.audio.volume = this.currentVolume;
        this.volumeSliderInput.value = this.currentVolume * 100;

        // Event listeners
        this.playBtn.addEventListener('click', () => this.handlePlayClick());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        this.volumeBtn.addEventListener('click', () => this.toggleVolumeSlider());

        // Audio events
        this.audio.addEventListener('loadedmetadata', () => this.updateTotalTime());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());

        // Progress bar events
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        this.progressBar.addEventListener('mousedown', (e) => this.startDragging(e));
        document.addEventListener('mousemove', (e) => this.onDragging(e));
        document.addEventListener('mouseup', () => this.stopDragging());

        // Touch events for mobile
        this.progressBar.addEventListener('touchstart', (e) => this.startDragging(e));
        document.addEventListener('touchmove', (e) => this.onDragging(e));
        document.addEventListener('touchend', () => this.stopDragging());

        // Volume slider
        this.volumeSliderInput.addEventListener('input', (e) => this.changeVolume(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Add ripple effect to buttons
        this.addRippleEffect();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        const playPromise = this.audio.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    this.isPlaying = true;
                    this.updatePlayButton();
                    this.albumArt.classList.add('playing');
                })
                .catch((error) => {
                    console.error('Playback failed:', error);
                });
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton();
        this.albumArt.classList.remove('playing');
    }

    updatePlayButton() {
        const playIcon = this.playBtn.querySelector('.play-icon');
        const pauseIcon = this.playBtn.querySelector('.pause-icon');

        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    onPlay() {
        this.isPlaying = true;
        this.updatePlayButton();
        this.albumArt.classList.add('playing');
    }

    onPause() {
        this.isPlaying = false;
        this.updatePlayButton();
        this.albumArt.classList.remove('playing');
    }

    previousTrack() {
        if (this.currentTrackIndex > 0) {
            this.currentTrackIndex--;
            this.loadTrack(this.currentTrackIndex);
            this.play();
        } else {
            // Restart current track
            this.audio.currentTime = 0;
        }
    }

    nextTrack() {
        if (this.currentTrackIndex < this.playlist.length - 1) {
            this.currentTrackIndex++;
            this.loadTrack(this.currentTrackIndex);
            this.play();
        } else if (this.isRepeating) {
            this.currentTrackIndex = 0;
            this.loadTrack(this.currentTrackIndex);
            this.play();
        }
    }

    loadTrack(index) {
        const track = this.playlist[index];
        this.audio.src = track.src;

        // Handle video or image covers
        if (track.cover.endsWith('.mp4')) {
            this.albumArt.src = track.cover;
            // Ensure video plays
            this.albumArt.play().catch(e => console.log('Video autoplay blocked:', e));
        } else {
            this.albumArt.src = track.cover;
        }

        document.getElementById('songTitle').textContent = track.title;
        document.getElementById('artistName').textContent = track.artist;
        this.audio.load();
    }

    toggleRepeat() {
        this.isRepeating = !this.isRepeating;
        this.repeatBtn.classList.toggle('active', this.isRepeating);
        this.audio.loop = this.isRepeating;
    }

    handleTrackEnd() {
        if (!this.isRepeating && this.currentTrackIndex < this.playlist.length - 1) {
            this.nextTrack();
        } else if (!this.isRepeating) {
            this.pause();
            this.audio.currentTime = 0;
        }
    }

    updateProgress() {
        if (!this.isDragging) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressFill.style.width = `${progress}%`;
            this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateTotalTime() {
        this.totalTimeEl.textContent = this.formatTime(this.audio.duration);
    }

    seekTo(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = offsetX / rect.width;
        const newTime = percentage * this.audio.duration;

        if (!isNaN(newTime)) {
            this.audio.currentTime = newTime;
        }
    }

    startDragging(e) {
        this.isDragging = true;
        this.progressBar.classList.add('dragging');
        this.seekTo(e.touches ? e.touches[0] : e);
    }

    onDragging(e) {
        if (this.isDragging) {
            e.preventDefault();
            this.seekTo(e.touches ? e.touches[0] : e);
        }
    }

    stopDragging() {
        if (this.isDragging) {
            this.isDragging = false;
            this.progressBar.classList.remove('dragging');
        }
    }

    toggleVolumeSlider() {
        const isVisible = this.volumeSlider.style.display === 'block';
        this.volumeSlider.style.display = isVisible ? 'none' : 'block';
    }

    changeVolume(e) {
        const volume = e.target.value / 100;
        this.audio.volume = volume;
        this.currentVolume = volume;
        this.updateVolumeIcon();
    }

    updateVolumeIcon() {
        const volumeHigh = this.volumeBtn.querySelector('.volume-high');
        const volumeMuted = this.volumeBtn.querySelector('.volume-muted');

        if (this.audio.volume === 0) {
            volumeHigh.style.display = 'none';
            volumeMuted.style.display = 'block';
        } else {
            volumeHigh.style.display = 'block';
            volumeMuted.style.display = 'none';
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    handlePlayClick() {
        // Check if email has been captured
        const emailCaptured = localStorage.getItem('email_captured');

        if (!emailCaptured) {
            // Show email modal
            const emailModal = document.getElementById('emailModal');
            emailModal.style.display = 'flex';
        } else {
            // Play music
            this.togglePlay();
        }
    }

    handleKeyboard(e) {
        // Only handle keyboard events if not typing in an input
        if (e.target.tagName === 'INPUT') return;

        switch(e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.audio.currentTime = Math.max(0, this.audio.currentTime - 5);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 5);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.audio.volume = Math.min(1, this.audio.volume + 0.1);
                this.volumeSliderInput.value = this.audio.volume * 100;
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.audio.volume = Math.max(0, this.audio.volume - 0.1);
                this.volumeSliderInput.value = this.audio.volume * 100;
                break;
            case 'm':
                e.preventDefault();
                if (this.audio.volume > 0) {
                    this.audio.volume = 0;
                } else {
                    this.audio.volume = this.currentVolume;
                }
                this.volumeSliderInput.value = this.audio.volume * 100;
                this.updateVolumeIcon();
                break;
        }
    }

    addRippleEffect() {
        const buttons = document.querySelectorAll('.control-btn, .main-play-btn, .submit-btn');

        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                this.classList.remove('ripple');
                void this.offsetWidth; // Trigger reflow
                this.classList.add('ripple');

                setTimeout(() => {
                    this.classList.remove('ripple');
                }, 600);
            });
        });
    }
}

// Initialize player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.audioPlayer = new AudioPlayer();
});
