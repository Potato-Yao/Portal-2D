class Game {
    /**
     * @typedef Computation
     * @type {Function}
     */

    /**
     * @type {Array<Computation>}
     */
    computations = [];

    /**
     * @type {Array<Computation>}
     */
    renderings = [];

    loaded = false;

    constructor() {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext('2d');

        /**
         * @type {KeyboardManager}
         */
        let keyboard = new KeyboardManager();

        /**
         * @type {MouseManager}
         */
        let mouse = new MouseManager(document.querySelector("#game-container"), this.canvas);
        /**
         * @type {InputManager}
         */
        this.inputManager = new InputManager(keyboard, mouse);
        /**
         * @type {DataManager}
         */
        this.dataManager = new DataManager();

        /**
         * @type {MapManager}
         */


        this.map = new MapManager();
        // this.viewData = new ViewData();
        this.dialogManager = new DialogManager();
        this.textureManager = new TextureManager();
        this.soundManager = new SoundManager();
        this.eventManager = new EventManager();
        this.achievementManager = new AchievementManager();

        this.stop = false;
        this.isPaused = false;

        this.store = new Store();
        // this.statistics = {
        //     portal: 0,
        //     bullet: 0,
        //     restart: 0,
        //     jump: 0,
        //     jumpTime: 0,
        // };
        window.$store = this.store;

        this.savePopup = new Save();
        this.loadPopup = new Load((data) => {
            Store.set("parfait", JSON.stringify(data.parfait));
            Store.set("camera", JSON.stringify(data.camera));
            Store.set("statistics", JSON.stringify(data.statistics ?? {}));
            Object.keys(data.statistics ?? {}).forEach((key) => {
                window.$game.statistics[key] = data.statistics[key];
            });
            window.$game.switchView(data.url);
            this.loadPopup.hide();
        });

        // 确保在构造函数中就获取controlMenu元素的引用
        this.controlMenu = document.querySelector('#control');
        
        // 添加备用的ESC键全局监听，确保即使在游戏循环出现问题时也能响应ESC键
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && document.getElementById('game')) {
                if (!this.isPaused) {
                    // 确保controlMenu存在
                    let menu = this.controlMenu || document.querySelector('#control');
                    if (menu) {
                        menu.style.display = 'flex';
                        menu.classList.remove('hidden');
                        this.isPaused = true;
                    }
                }
            }
        }, { passive: false });

        this.resumeBtn = document.querySelector('#control-resume');
        if (this.resumeBtn) this.resumeBtn.addEventListener('click', () => this.resume());
        
        this.backBtn = document.querySelector('#control-back');
        if (this.backBtn) this.backBtn.addEventListener('click', () => this.exit());
        
        this.saveBtn = document.querySelector('#control-save');
        if (this.saveBtn) this.saveBtn.addEventListener('click', () => this.savePopup.show());

        // this.deadScreen = new DeadScreen();

        this.chapterNow = 'day1';
        window.$chatperState = "null";

        this.splash = new Splash();
    }

    async init(filename = 'day0.json') {
        // await this.textureManager.load();
        await this.soundManager.load();
        await this.achievementManager.load();
        await this.load(filename);
    }

    async load(filename = 'day0.json') {
        // await this.map.loadFromURL('./assets/stages/maps/' + filename);
        // await this.dialogManager.loadFromURL('./assets/stages/dialogs/' + filename);
        // await this.viewData.loadFromURL('./assets/stages/viewdatas/' + filename);
        if (filename === "day3jump") {
            if (window.$gameStateSum >= 2) {
                filename = "day3A.json";
            } else {
                filename = "day3B.json";
            }
        } else if (filename === "day4jump0") {
            if (window.$gameState === 1) {
                filename = "end1.json";
                this.ending = 1; // 设置ending属性为1，解锁end1结局成就
            } else {
                filename = "end5.json";
                this.ending = 5; // 设置ending属性为5，解锁end5结局成就
            }
        } else if (filename === "day4jump1") {
            if (window.$gameState === 1) {
                filename = "day4A.json";
            } else {
                filename = "day4B.json";
            }
        }
        // 检查是否是结局文件，如果是，设置对应的ending属性
        const endingMatch = filename.match(/^end(\d+)\.json$/);
        if (endingMatch) {
            this.ending = parseInt(endingMatch[1]);
            // 加载结局文件时设置chapterNow为"Outro"
            this.chapterNow = "Outro";
        } else {
            // 非结局文件使用原有的设置
            this.chapterNow = filename.split('.')[0];
        }
        await this.eventManager.loadFromURL('./assets/stages/events/' + filename);
        this.loaded = true;
        
        // 如果是结局文件，调用achievementManager.update()检查成就
        if (endingMatch) {
            this.achievementManager.update();
        }
        // this.view = new PortalView(this.map, this.viewData);

        // 已在上面根据是否为结局文件设置了chapterNow，移除重复设置
        // this.chapterNow = filename.split('.')[0];
        
        // 在每天开始时自动存档
        if (!window.$isAutosaving) {
            window.$isAutosaving = true;
            setTimeout(() => {
                try {
                    this.savePopup.save("Autosave");
                    console.log("自动存档完成");
                } catch (error) {
                    console.error("自动存档失败", error);
                } finally {
                    window.$isAutosaving = false;
                }
            }, 1000); // 延迟1秒存档，确保所有数据加载完成
        }
    }

    start(prev = 0) {
        this.stop = false;
        this.computations = [];
        this.renderings = [];
        if (!this.loaded) {
            console.error('Game not loaded');
            return;
        }

        // this.computations.push((t) => this.view.compute(t));
        // this.renderings.push(() => this.view.draw());

        const fps = new FrameRate();
        this.computations.push((t) => fps.display(t.timestamp));

        this.renderings.push(() => this.inputManager.mouse.draw());

        this.computations.push((t) => {
            if (this.inputManager.keyboard.isKeyDown('Esc')) {
                // 直接处理ESC键，确保菜单能够立即显示
                if (!this.isPaused) {
                    // 确保controlMenu元素存在
                    let menu = this.controlMenu || document.querySelector('#control');
                    
                    // 使用requestAnimationFrame确保在下一帧渲染时显示菜单
                    window.requestAnimationFrame(() => {
                        // 直接设置display属性，因为CSS中的display: none优先级很高
                        menu.style.display = 'flex';
                        menu.style.visibility = 'visible';
                        
                        // 移除hidden类
                        menu.classList.remove('hidden');
                    });
                    
                    // 标记为已暂停
                    this.isPaused = true;
                    
                    // 播放暂停音效
                    try {
                        this.soundManager.playSound('pause');
                    } catch(e) {
                        console.log('音效播放失败');
                    }
                    
                    // 保存统计数据
                    Store.set("statistics", JSON.stringify(this.statistics));
                }
            }
        });
        window.requestAnimationFrame((timestamp) => this.loop(timestamp, prev));
    }

    /**
     * @param {number} timestamp frame interval in milliseconds
     * @param {number} prev previous frame timestamp
     */
    async loop(timestamp, prev) {
        // console.log(Store.get("achievements"));
        const interval = timestamp - prev;
        const now = timestamp;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        await this.eventManager.handle();

        this.computations.forEach((comp) => comp({timestamp, interval}));
        this.renderings.forEach((render) => render({timestamp, interval}));
        if (this.stop) {
            while (!this.loaded) {
                await wait(100);
            }
            this.start(timestamp);
            return;
        }

        const beforePause = performance.now();
        while (this.isPaused) {
            await wait(100);
        }
        const pauseTime = performance.now() - beforePause;

        window.requestAnimationFrame((timestamp) => this.loop(timestamp, now + pauseTime));
    }

    async fadeIn() {
        this.canvas.classList.remove('fadeOut');
        this.canvas.classList.add('fadeIn');

        await wait(500);
        this.canvas.classList.remove('fadeIn');
    }

    async fadeOut() {
        this.canvas.classList.remove('fadeIn');
        this.canvas.classList.add('fadeOut');

        await wait(500);
        // this.canvas.classList.remove('fadeOut');
    }

    async rebuild(oprerate) {
        await this.fadeOut();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        await oprerate();
        await this.fadeIn();
    }

    async restart() {
        this.restartBtn.blur();
        this.isPaused = true;
        await this.rebuild(async () => {
            await this.eventManager.clear();
            await this.resetView();
            this.resume();
        });
    }

    async resetView() {
        Store.set("statistics", JSON.stringify(this.statistics));
        this.load(this.chapterNow + '.json');
        this.stop = true;
        // this.view = new PortalView(this.map, this.viewData);
    }

    async switchView(url) {
        Store.set("statistics", JSON.stringify(this.statistics));
        this.isPaused = true;
        await this.rebuild(async () => {
            this.loaded = false;
            await this.dialogManager.clear();
            await this.splash.hide();
            this.eventManager.clear();
            this.map = new MapManager();
            await this.load(url);
            this.resume();
            this.resetView();
        });
    }

    pause() {
        if (!this.isPaused) {
            // 确保controlMenu元素存在，如果不存在则重新获取
            if (!this.controlMenu) {
                this.controlMenu = document.querySelector('#control');
            }
            
            this.soundManager.playSound('pause');
            this.controlMenu.classList.remove('hidden');
            
            // 添加强制重绘逻辑，确保菜单能够立即显示
            this.controlMenu.style.display = 'none';
            setTimeout(() => {
                this.controlMenu.style.display = '';
            }, 10);
            
            this.isPaused = true;
            Store.set("statistics", JSON.stringify(this.statistics));
        }
    }

    resume() {
        if (this.isPaused) {
            this.soundManager.playSound('resume');
            this.controlMenu.classList.add('hidden');
            this.isPaused = false;
        }
    }

    exit() {
        Store.set("statistics", JSON.stringify(this.statistics));
        this.savePopup.save("Autosave");
        window.location.href = `./index.html?${window.$store.encode()}`;
    }

    gameEnd() {
        Store.set("statistics", JSON.stringify(this.statistics));
        window.location.href = `./index.html?${window.$store.encode()}`;
    }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
