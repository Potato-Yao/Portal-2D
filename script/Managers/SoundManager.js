class SoundManager {
    constructor() {
        this.bgmsFormal = [
            new Audio("./assets/audios/bgms/1.mp3"),
            new Audio("./assets/audios/bgms/2.mp3"),
        ];
        this.backgroundMusic = null;
        this.init();
    }

    playBGM(name = null) {
        // console.log(name)
        if (window.$game.chapterNow === "Outro" && name === null)
            return;
        // 如果当前正在播放的音乐和将要播放的相同，就直接返回
        if (this.backgroundMusic && this.backgroundMusic === this.bgms[ name ])
            return;
        // 如果当前有正在播放的音乐，就暂停
        if (this.backgroundMusic)
            this.backgroundMusic.pause();
        if (name) {
            this.backgroundMusic = this.bgms[ name ];
        }
        else
            this.backgroundMusic = this.bgmsFormal[ Math.floor(Math.random() * this.bgmsFormal.length) ];
        // console.log(this.backgroundMusic);
        this.backgroundMusic.currentTime = 0;
        this.backgroundMusic.volume = 0.5;
        this.backgroundMusic.play();
        if (name === null)
            this.backgroundMusic.addEventListener('ended', this.handleClick);
        document.removeEventListener('click', this.handleClick);
    }

    handleClick = () => {
        this.playBGM();
    };

    init() {
        document.addEventListener('click', this.handleClick);
    }


    async load() {
        this.bgms = {};
        this.bgmsURL = await window.$game.dataManager.loadJSON("./assets/audios/BGMs.json");
        Object.keys(this.bgmsURL).forEach((id) => {
            const audio = new Audio(this.bgmsURL[ id ]);
            audio.loop = true;
            this.bgms[ id ] = audio;
        });

    }
    async playSound(kind, id = 0) {
        /**
         * @type {HTMLAudioElement}
         */
        const sound = this.sounds[ kind ] && this.sounds[ kind ][ id ];
        if (sound) {
            if (!sound.paused) {
                if (kind == "walk")
                    return;
                /**
                 * @type {HTMLAudioElement}
                 */
                const copy = sound.cloneNode();
                copy.currentTime = 0;
                copy.play().catch(error => {
                    console.error(`Error playing sound: ${kind + id}`, error);
                });
            }
            else {
                // sound.play().catch(error => {
                //     console.error(`Error playing sound: ${kind + id}`, error);
                // });
            }
        } else {
            console.warn(`Sound ${id} not found in AudioManager.`);
        }
    }
}
