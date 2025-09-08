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
        let text = document.createElement("p");
        let characterImg = document.createElement("img");
        let optionsContainer = document.createElement("div"); // 新建选项容器
        let gameContainer = document.getElementById("game");

        // 设置 ID 和样式
        dialog.id = "dialogue-container";
        dialog.style.display = "none";

        textContainer.id = "dialogue-box";
        textContainer.classList.add("dialogue-box");

        name.id = "character-name";
        name.classList.add("character-name");

        text.id = "text";
        text.classList.add("text");

        characterImg.id = "character-img";
        characterImg.classList.add("character-img");
        characterImg.style.display = "none";

        // 设置选项容器的样式
        optionsContainer.id = "dialogue-options";
        optionsContainer.style.position = "absolute";
        optionsContainer.style.right = "40px";
        optionsContainer.style.top = "50%";
        optionsContainer.style.transform = "translateY(-50%)";
        optionsContainer.style.display = "none"; // 默认隐藏
        optionsContainer.style.display = "flex";
        optionsContainer.style.flexDirection = "column";
        optionsContainer.style.alignItems = "flex-start"; // 左对齐

        // 组装 DOM 元素
        dialog.appendChild(name);
        dialog.appendChild(textContainer);
        textContainer.appendChild(text);

        gameContainer.appendChild(dialog);
        gameContainer.appendChild(characterImg);
        gameContainer.appendChild(optionsContainer); // 将选项容器添加到游戏容器

        dialog.appendChild(characterImg);

        // 存储 DOM 元素的引用
        this.dialog = dialog;
        this.optionsContainer = optionsContainer; // 存储选项容器的引用
        this.name = name;
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
            switch (window.$chatperState) {
                case 0: {
                    if (choice === 0) {
                        window.$chatperState = 1;
                    } else {
                        window.$chatperState = 2;
                    }
                    window.$choice = "day4-2.json";
                    break;
                }
                case 1: {
                    if (choice === 0) {
                        window.$choice = "day4-3.json"
                        window.$chatperState = 3;
                    } else {
                        window.$choice = "end7.json"
                    }
                    break;
                }
                case 2: {
                    if (choice === 0) {
                        window.$choice = "day4-3.json"
                        window.$chatperState = 3;
                    } else {
                        window.$choice = "end6.json"
                    }
                    break;
                }

                default:
                    break;
            }
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
            this.options.forEach((optionText, index) => {
                const label = document.createElement("label");
                label.style.padding = "8px";
                label.style.margin = "4px";
                label.style.cursor = "pointer";
                label.style.color = "white";
                label.style.background = "rgba(0,0,0,0.6)";
                label.style.borderRadius = "5px";

                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "dialogue-option";
                radio.value = index;
                radio.style.marginRight = "10px";

                const text = document.createElement("span");
                text.textContent = optionText;

                label.appendChild(radio);
                label.appendChild(text);
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
            let name = texts[0];
            this.name.innerHTML = name;

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
                return res;
            };
            let toEnd = false;
            // this.play_audio(content.url);
            for (let i = 1; i < texts.length; ++i) {
                if (!this.printing) return;

                let span = document.createElement("span");
                span.textContent = texts[i];
                this.text.appendChild(span); // 逐字显示文本
                if (window.$game.inputManager.isKeysDown(["LCtrl", "RCtrl"])) {
                    await delay(10); // 控制打印速度
                    continue;
                }
                if (toEnd) continue;
                toEnd = getEnd();
                await delay(50); // 控制打印速度
            }

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
        await this.close();
    }
}

// 辅助延迟函数
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
