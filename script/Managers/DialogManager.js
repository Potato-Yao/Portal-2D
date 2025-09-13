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
        let gameContainer = document.getElementById("game");

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
        optionsContainer.style.position = "absolute";
        optionsContainer.style.right = "40px";
        optionsContainer.style.top = "50%";
        optionsContainer.style.transform = "translateY(-50%)";
        optionsContainer.style.display = "none"; // 默认隐藏
        optionsContainer.style.display = "flex";
        optionsContainer.style.flexDirection = "column";
        optionsContainer.style.alignItems = "center"; // 水平居中
        optionsContainer.style.justifyContent = "center"; // 垂直居中
        optionsContainer.style.width = "100%";
        optionsContainer.style.right = "0";

    // 组装 DOM 元素：名字（顶部） -> 分隔线 -> 正文
    dialog.appendChild(textContainer);
    textContainer.appendChild(name);
    textContainer.appendChild(sep);
    textContainer.appendChild(text);

        gameContainer.appendChild(dialog);
        gameContainer.appendChild(characterImg);
        gameContainer.appendChild(optionsContainer); // 将选项容器添加到游戏容器

        dialog.appendChild(characterImg);

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
                let optionText = button.text;
                const label = document.createElement("label");
                label.style.padding = "8px";
                label.style.margin = "4px";
                label.style.cursor = "pointer";
                label.style.color = "rgba(255,255,255,0.8)";
                label.style.background = "#3e58b6d0";
                label.style.borderRadius = "5px";
                label.style.display = "flex";
                label.style.alignItems = "center";
                label.style.justifyContent = "flex-start";
                label.style.paddingLeft = "30px";
                label.style.width = "fit-content";

                // 鼠标悬停时改变背景色
                label.addEventListener("mouseover", function () {
                    this.style.background = "#3e58b6e0";
                });
                label.addEventListener("mouseout", function () {
                    this.style.background = "#3e58b6d0";
                });

                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "dialogue-option";
                radio.value = index;
                radio.style.position = "absolute";
                radio.style.left = "10px";
                radio.style.opacity = "0";
                radio.style.width = "16px";
                radio.style.height = "16px";
                radio.style.cursor = "pointer";

                // 创建自定义倒三角radio
                const customRadio = document.createElement("div");
                customRadio.style.position = "absolute";
                customRadio.style.left = "10px";
                customRadio.style.width = "0";
                customRadio.style.height = "0";
                customRadio.style.borderLeft = "8px solid transparent";
                customRadio.style.borderRight = "8px solid transparent";
                customRadio.style.borderTop =
                    "12px solid rgba(255,255,255,0.5)";
                customRadio.style.pointerEvents = "none";

                // 监听radio状态变化，更新倒三角样式
                radio.addEventListener("change", function () {
                    // 重置所有倒三角样式
                    document
                        .querySelectorAll(".dialogue-option-custom-radio")
                        .forEach((el) => {
                            el.style.borderTopColor = "rgba(255,255,255,0.5)";
                        });
                    // 设置选中的倒三角样式
                    if (this.checked) {
                        customRadio.style.borderTopColor = "white";
                    }
                });

                customRadio.classList.add("dialogue-option-custom-radio");

                const text = document.createElement("span");
                text.textContent = optionText;

                // 设置label为相对定位，以便自定义radio绝对定位
                label.style.position = "relative";

                label.appendChild(radio);
                label.appendChild(customRadio);
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
