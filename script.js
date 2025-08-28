class PomodoroTimer {
    constructor() {
        this.timeLeft = 30 * 60; // 30 minutes in seconds
        this.totalTime = 30 * 60;
        this.isRunning = false;
        this.interval = null;
        this.currentMode = 'work';
        this.sessionCount = 0;
        this.totalSessionTime = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.timeElement = document.getElementById('time');
        this.statusElement = document.getElementById('status');
        this.startButton = document.getElementById('start');
        this.pauseButton = document.getElementById('pause');
        this.resetButton = document.getElementById('reset');
        this.progressFill = document.getElementById('progress-fill');
        this.sessionCountElement = document.getElementById('session-count');
        this.totalTimeElement = document.getElementById('total-time');
        this.modeButtons = document.querySelectorAll('.mode-btn');
    }
    
    bindEvents() {
        this.startButton.addEventListener('click', () => this.start());
        this.pauseButton.addEventListener('click', () => this.pause());
        this.resetButton.addEventListener('click', () => this.reset());
        
        this.modeButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchMode(e));
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startButton.disabled = true;
            this.pauseButton.disabled = false;
            
            this.interval = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.timerComplete();
                }
            }, 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startButton.disabled = false;
            this.pauseButton.disabled = true;
            clearInterval(this.interval);
        }
    }
    
    reset() {
        this.pause();
        this.timeLeft = this.totalTime;
        this.updateDisplay();
        // Reset title when timer is reset
        document.title = 'Pomodoro Timer';
    }
    
    switchMode(event) {
        const button = event.target;
        const time = parseInt(button.dataset.time);
        const mode = button.dataset.mode;
        
        // Update active button
        this.modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update timer
        this.currentMode = mode;
        this.totalTime = time * 60;
        this.timeLeft = this.totalTime;
        
        // Update status text
        this.updateStatusText();
        
        // Reset and update display
        this.reset();
    }
    
    updateStatusText() {
        const statusTexts = {
            'work': 'Work Time',
            'break': 'Break Time',
            'long-break': 'Long Break Time'
        };
        this.statusElement.textContent = statusTexts[this.currentMode] || 'Work Time';
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timeElement.textContent = timeString;
        
        // Update browser tab title with countdown when timer is running
        if (this.isRunning) {
            document.title = `(${timeString}) Pomodoro Timer`;
        } else {
            document.title = 'Pomodoro Timer';
        }
        
        // Update progress bar
        const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        // Update session info
        this.updateSessionInfo();
    }
    
    updateSessionInfo() {
        this.sessionCountElement.textContent = this.sessionCount;
        
        const totalHours = Math.floor(this.totalSessionTime / 3600);
        const totalMinutes = Math.floor((this.totalSessionTime % 3600) / 60);
        this.totalTimeElement.textContent = `${totalHours}h ${totalMinutes}m`;
    }
    
    timerComplete() {
        this.pause();
        
        // Add session time to total
        this.totalSessionTime += this.totalTime;
        
        // Increment session count for work sessions
        if (this.currentMode === 'work') {
            this.sessionCount++;
        }
        
        // Play notification sound (if supported)
        this.playNotification();
        
        // Show completion animation
        this.showCompletionAnimation();
        
        // Reset title when timer completes
        document.title = 'Pomodoro Timer';
        
        // Auto-switch to next mode
        this.autoSwitchMode();
        
        // Update display
        this.updateDisplay();
    }
    
    playNotification() {
        // Try to play a notification sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            // Fallback: show browser notification if available
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Pomodoro Timer', {
                    body: `${this.currentMode === 'work' ? 'Work session' : 'Break'} completed!`,
                    icon: '🍅'
                });
            }
        }
    }
    
    showCompletionAnimation() {
        this.timeElement.classList.add('timer-complete');
        setTimeout(() => {
            this.timeElement.classList.remove('timer-complete');
        }, 500);
    }
    
    autoSwitchMode() {
        if (this.currentMode === 'work') {
            // After work, switch to break or long break
            if (this.sessionCount % 4 === 0) {
                // Every 4 work sessions, take a long break
                this.switchToMode('long-break');
            } else {
                this.switchToMode('break');
            }
        } else {
            // After break, switch back to work
            this.switchToMode('work');
        }
    }
    
    switchToMode(mode) {
        const button = Array.from(this.modeButtons).find(btn => btn.dataset.mode === mode);
        if (button) {
            button.click();
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});
