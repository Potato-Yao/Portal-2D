class DialogManager {
    constructor() {
        this.buffer = []; // 文本缓冲区
        this.options = []; // 选项文本缓冲区
        this.printing = false;
        this.audio = new Audio();
        this.createDialog();
    }

    // 创建对话框的 DOM 元素
    createDialog() {
        let dialog = document.querySelector(".dialogue-container");
        let textContainer = document.querySelector(".dialogue-box");
        let name = document.createElement("div");
        let sep = document.createElement("div");
        let text = document.createElement("p");
        let characterImg = document.createElement("img");
        let optionsContainer = document.createElement("div"); // 新建选项容器
        let gameRoot = document.getElementById("game");
        let stageContainer = document.getElementById("game-container");

        // 设置 ID 和样式
        dialog.id = "dialogue-container";
        dialog.style.display = "none";

        textContainer.id = "dialogue-box";
        textContainer.classList.add("dialogue-box");

        name.id = "character-name";
        name.classList.add("character-name");

        // 金色分隔线
        sep.classList.add("dialogue-sep");
        sep.style.width = "0px"; // 初始宽度

        text.id = "text";
        text.classList.add("text");

        characterImg.id = "character-img";
        characterImg.classList.add("character-img");
        characterImg.style.display = "none";

        // 设置选项容器的样式
    optionsContainer.id = "dialogue-options";

        // 组装 DOM 元素：名字（顶部） -> 分隔线 -> 正文
        dialog.appendChild(textContainer);
        textContainer.appendChild(name);
        textContainer.appendChild(sep);
        textContainer.appendChild(text);

        gameRoot.appendChild(dialog);
        // 立绘放入背景容器内，保证与背景底部对齐
        if (stageContainer) {
            stageContainer.appendChild(characterImg);
        } else {
            gameRoot.appendChild(characterImg);
        }
        gameRoot.appendChild(optionsContainer); // 将选项容器添加到游戏容器

        // 存储 DOM 元素的引用
        this.dialog = dialog;
        this.optionsContainer = optionsContainer; // 存储选项容器的引用
        this.name = name;
        this.sep = sep;
        this.text = text;
        this.characterImg = characterImg;
    }

    /**
     *
     * @param {Object} data 成员texts为正文，成员options为选项
     */
    load(data) {
        this.buffer = data.texts || [];
        this.options = data.options || [];
    }

    async loadFromURL(url) {
        try {
            const response = await window.$game.dataManager.loadJSON(url);
            this.load(response);
            console.log(this);
        } catch (error) {
            console.error(
                "There has been a problem with your fetch operation:",
                error
            );
        }
    }

    async play_audio(src) {
        if (src == null) return;
        if (this.audio) this.audio.pause();
        this.audio = new Audio(src);
        this.audio.play();
    }

    // 打开对话框动画
    async open() {
        this.name.innerHTML = ""; // 清空名称和文本
        this.text.innerHTML = "";
        if (this.sep) this.sep.style.width = "0px";

        this.dialog.classList.remove("fadeOut");
        this.dialog.classList.add("fadeIn");
        this.dialog.style.display = "block";

        await wait(300);
        this.dialog.classList.remove("fadeIn");
    }

    // 关闭对话框动画
    async close() {
        this.dialog.classList.remove("fadeIn");
        this.dialog.classList.add("fadeOut");
        this.optionsContainer.style.display = "none"; // 关闭时隐藏选项
        if (this.sep) this.sep.style.width = "0px";

        await wait(300);
        this.dialog.classList.remove("fadeOut");
        this.dialog.style.display = "none";

        this.name.innerHTML = ""; // 清空名称和文本
        this.text.innerHTML = "";
    }

    // 打印文本并处理选项
    async prints(texts = [], options = []) {
        this.buffer.push(...texts);
        this.options = options;
        if (this.buffer.length === 0 && !this.options) return null;

        await this.open(); // 打开对话框

        if (this.buffer.length > 0) {
            await this._prints(); // 打印文本
        }

        const choice = await this.showOption(); // 显示选项并等待选择
        console.log(choice);
        if (choice !== null) {
            window.$choice = this.options[choice].url + ".json";
        }

        await this.close(); // 关闭对话框
        this.options = []; // 清除选项
    }

    async showImg(name) {}

    // 显示选项并等待用户选择
    async showOption() {
        console.log(this.options);
        if (!this.options || this.options.length === 0) {
            return null;
        }

        this.optionsContainer.innerHTML = ""; // 清空旧选项

        // 返回一个Promise，它在用户选择后解决
        return new Promise((resolve) => {
            // 为每个选项创建单选按钮
            this.options.forEach((button, index) => {
                const optionText = button.text;
                const label = document.createElement("label");
                label.className = "dialogue-option";

                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "dialogue-option";
                radio.value = index;
                radio.className = "dialogue-option-input";

                const box = document.createElement("div");
                box.className = "dialogue-option-box";

                const text = document.createElement("span");
                text.className = "dialogue-option-text";
                text.textContent = optionText;

                label.appendChild(radio);
                label.appendChild(box);
                box.appendChild(text);
                this.optionsContainer.appendChild(label);
            });

            // 监听 'change' 事件以捕获用户的选择
            const listener = (event) => {
                if (event.target.name === "dialogue-option") {
                    this.optionsContainer.removeEventListener(
                        "change",
                        listener
                    );
                    resolve(parseInt(event.target.value, 10)); // 以选择的索引解决Promise
                }
            };

            this.optionsContainer.addEventListener("change", listener);
            this.optionsContainer.style.display = "flex"; // 显示选项容器

            // 统一选项框长度：取最长文本的所需宽度
            requestAnimationFrame(() => {
                const boxes = Array.from(this.optionsContainer.querySelectorAll('.dialogue-option-box'));
                const texts = Array.from(this.optionsContainer.querySelectorAll('.dialogue-option-text'));
                let max = 0;
                texts.forEach(t => {
                    // 需要实际渲染后的 scrollWidth
                    max = Math.max(max, t.scrollWidth);
                });
                // 将 max 限制到最大可用宽度：视口 1/4 宽度以内（避免越界到右侧）
                const maxAvailable = Math.max(parseInt(getComputedStyle(this.optionsContainer).width) || 0, 0);
                const circle = parseInt(getComputedStyle(this.optionsContainer).getPropertyValue('--circle-d')) || 44;
                const gap = parseInt(getComputedStyle(this.optionsContainer).getPropertyValue('--gap')) || 10;
                const padR = parseInt(getComputedStyle(this.optionsContainer).getPropertyValue('--pad-r')) || 16;
                const inner = circle + gap + padR;
                const target = Math.max(max + inner, parseInt(getComputedStyle(this.optionsContainer).getPropertyValue('--option-min-width')) || 260);
                this.optionsContainer.style.setProperty('--option-width', target + 'px');
                // 更新每个文本的最大宽度
                texts.forEach(t => {
                    t.style.maxWidth = (target - inner) + 'px';
                });
            });
        });
    }

    // 打印缓冲区中的文本
    async _prints() {
        this.printing = true;

        for (let content of this.buffer) {
            if (!this.printing) return;
            if (!content.text) continue;
            this.name.innerHTML = ""; // 清空名称和文本
            this.text.innerHTML = "";
            let text = content.text;
            let texts = text.split(" ");
            let name = (texts[0] || "").trim();
            // 设置名字文本并根据是否为空显示/隐藏分隔线/名字
            this.name.textContent = name;
            this.name.style.display = name ? "block" : "none";
            if (this.sep) this.sep.style.display = name ? "block" : "none";

            if (name === "妈妈") {
                this.characterImg.src = "./assets/imgs/mom.png";
                this.characterImg.style.display = "block";
            } else if (name === "凌华") {
                this.characterImg.src = "./assets/imgs/friend.png";
                this.characterImg.style.display = "block";
            } else {
                this.characterImg.style.display = "none";
            }

            let getEnd = () => {
                let res = false;
                window.$game.inputManager.firstDown("Enter", () => {
                    res = true;
                });
                window.$game.inputManager.firstDown("Space", () => {
                    res = true;
                });
                window.$game.inputManager.firstDown("ClickLeft", () => {
                    res = true;
                });
                window.$game.inputManager.firstDown("Escape", () => {
                    console.log("ffffffff");
                    window.$game.pause();
                });
                return res;
            };
            let toEnd = false;
            // this.play_audio(content.url);
            const updateSeparator = () => {
                if (!this.sep) return;
                // 判断是否多行：根据内容高度与行高比较
                const cs = window.getComputedStyle(this.text);
                const lineHeight = parseFloat(cs.lineHeight) || 0;
                const isMultiLine = this.text.scrollHeight > lineHeight * 1.3;
                // 多行时固定为最大宽度（与CSS一致），单行时为内容实际宽度
                if (isMultiLine) {
                    this.text.classList.add("multi-line");
                    this.text.classList.remove("single-line");
                    this.text.style.width = "66.6667vw";
                    this.sep.style.width = this.text.clientWidth + "px";
                } else {
                    this.text.classList.add("single-line");
                    this.text.classList.remove("multi-line");
                    this.text.style.width = "auto";
                    // 使用 scrollWidth 以获取内容真实宽度
                    this.sep.style.width = this.text.scrollWidth + "px";
                }
            };

            for (let i = 1; i < texts.length; ++i) {
                if (!this.printing) return;

                let span = document.createElement("span");
                span.textContent = texts[i];
                this.text.appendChild(span); // 逐字显示文本
                updateSeparator();
                if (window.$game.inputManager.isKeysDown(["LCtrl", "RCtrl"])) {
                    await delay(10); // 控制打印速度
                    continue;
                }
                if (toEnd) continue;
                toEnd = getEnd();
                await delay(50); // 控制打印速度
            }

            // 最后再对分隔线宽度进行一次校正
            updateSeparator();

            // 等待用户输入
            if (!window.$game.inputManager.isKeysDown(["LCtrl", "RCtrl"]))
                while (
                    await (async () => {
                        await delay(100);
                        return (
                            !getEnd() &&
                            !window.$game.inputManager.isKeysDown([
                                "LCtrl",
                                "RCtrl",
                            ])
                        );
                    })()
                );
            else await delay(100);
        }
        this.buffer = [];
        this.printing = false;
    }

    // 清理并关闭对话框
    async clear() {
        this.buffer = [];
        this.options = null;
        this.optionsContainer.innerHTML = "";
        this.optionsContainer.style.display = "none";
        this.name.innerHTML = "";
        this.text.innerHTML = "";
        this.printing = false;
        if (this.avatarBox) this.avatarBox.style.display = "none";
        await this.close();
    }
}

// 辅助延迟函数
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
