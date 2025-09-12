// game.js
document.addEventListener("DOMContentLoaded", () => {
    // --- 全局变量和常量 ---
    const TILE_SIZE = 40;
    const TILE_CLASS_MAPPING = {
        0: "floor",
        2: "switch",
        3: "start",
        4: "exit",
    };

    // 根据需求：重命名 mapsData -> jsonData
    let jsonData = null;
    let player = { name: "玩家1", hp: 3, map_name: "map1", pos: [0, 0] };
    let isGameOver = false;

    // --- 获取HTML元素 ---
    const gridContainer = document.getElementById("map-grid");
    const hpDisplay = document.getElementById("hp-display");
    const mapDisplay = document.getElementById("map-display");
    const instructionsButton = document.getElementById("instructions-button");
    const hintButton = document.getElementById("hint-button");
    const modalOverlay = document.getElementById("modal-overlay");
    const instructionsModal = document.getElementById("instructions-modal");
    const hintModal = document.getElementById("hint-modal");
    const hintTimerSpan = document.getElementById("hint-timer");
    const closeButton = document.querySelector(
        "#instructions-modal .close-button"
    );

    // 解析查询字符串，获得将要读取的JSON文件名
    function getJsonFilenameFromQuery() {
        try {
            const params = new URLSearchParams(window.location.search);
            // 支持多种常见参数名：?json= / ?file= / ?map= / ?data=
            const keys = ["json", "file", "map", "data"];
            for (const k of keys) {
                const v = params.get(k);
                if (v && v.trim()) return v.trim();
            }
            // 若无命名参数，取第一个参数值
            for (const [, v] of params.entries()) {
                if (v && v.trim()) return v.trim();
            }
        } catch (e) {
            console.warn("解析查询字符串失败，使用默认JSON。", e);
        }
        return "第一关map.json";
    }

    // --- 适配缩放函数 ---
    function applyScale() {
        const container = document.getElementById("game-container");
        if (!container) return;

        // 计算容器的原始尺寸（内容自然大小）
        // 使用 getBoundingClientRect 获取当前尺寸，然后用 scale(1) 的基准
        container.style.transform = "scale(1)";
        const rect = container.getBoundingClientRect();

        const availableW = window.innerWidth;
        const availableH = window.innerHeight;
        let scale = Math.min(
            availableW / Math.max(rect.width, 1),
            availableH / Math.max(rect.height, 1)
        );
        // 防止放大超过原始尺寸，避免顶部被挤出
        scale = Math.min(scale, 1);
        container.style.transform = `scale(${scale})`;
    }

    // --- 弹窗控制函数 ---
    function showInstructions() {
        modalOverlay.classList.remove("hidden");
        instructionsModal.classList.remove("hidden");
    }

    function hideAllModals() {
        modalOverlay.classList.add("hidden");
        instructionsModal.classList.add("hidden");
        hintModal.classList.add("hidden");
    }

    // --- 游戏绘图函数 ---
    function drawGame() {
        if (!jsonData) return;
        const grid = jsonData[player.map_name].grid;
        gridContainer.style.gridTemplateColumns = `repeat(${grid[0].length}, ${TILE_SIZE}px)`;
        gridContainer.style.gridTemplateRows = `repeat(${grid.length}, ${TILE_SIZE}px)`;
        gridContainer.innerHTML = "";

        grid.forEach((row, i) => {
            row.forEach((tileVal, j) => {
                const tileDiv = document.createElement("div");
                let tileClass = TILE_CLASS_MAPPING[tileVal] || "floor";
                if (tileVal === 1) {
                    tileClass =
                        player.map_name === "map1" ? "wall-map1" : "wall-map2";
                }
                tileDiv.classList.add("tile", tileClass);
                tileDiv.id = `tile-${i}-${j}`;
                gridContainer.appendChild(tileDiv);
            });
        });

        const playerTile = document.getElementById(
            `tile-${player.pos[0]}-${player.pos[1]}`
        );
        if (playerTile) playerTile.classList.add("player");

        hpDisplay.textContent = `生命: ${player.hp}`;
        mapDisplay.textContent = `地图: ${player.map_name}`;

        // 绘制完成后进行一次自适应缩放
        applyScale();
    }

    // --- 核心游戏逻辑 ---
    function movePlayer(direction) {
        if (isGameOver) return;
        let dx = 0,
            dy = 0;
        if (direction === "up") dx = -1;
        else if (direction === "down") dx = 1;
        else if (direction === "left") dy = -1;
        else if (direction === "right") dy = 1;

        const [x, y] = player.pos;
        const new_x = x + dx,
            new_y = y + dy;
        const grid = jsonData[player.map_name].grid;

        if (
            !(
                new_x >= 0 &&
                new_x < grid.length &&
                new_y >= 0 &&
                new_y < grid[0].length
            )
        )
            return;

        const cell = grid[new_x][new_y];
        if (cell === 1) return;

        if (cell === 4) {
            alert("🎉 你到达出口，游戏胜利！");
            isGameOver = true;
            window.location.href = winJump;
            return;
        }

        player.pos = [new_x, new_y]; // 先移动位置
        if (cell === 2) switchMap();

        if (isPlayerTrapped()) {
            player.map_name = "map1";
            player.pos = findStartPos("map1");
        }

        drawGame();
        if (player.hp <= 0) {
            alert("💀 生命归零，游戏失败！");
            isGameOver = true;
            window.location.href = loseJump;
        }
    }

    function switchMap() {
        const last_pos = player.pos; // 记录切换前的位置
        player.map_name = player.map_name === "map1" ? "map2" : "map1";
        player.pos = last_pos; // 保持相同坐标

        const grid = jsonData[player.map_name].grid;
        if (grid[player.pos[0]][player.pos[1]] === 1) {
            player.hp -= 1;
            hpDisplay.classList.add("damage-flash");
            setTimeout(() => hpDisplay.classList.remove("damage-flash"), 1000);
        }
    }

    function isPlayerTrapped() {
        const [x, y] = player.pos;
        const grid = jsonData[player.map_name].grid;
        const neighbors = [
            { r: x - 1, c: y },
            { r: x + 1, c: y },
            { r: x, c: y - 1 },
            { r: x, c: y + 1 },
        ];
        for (const { r, c } of neighbors) {
            if (
                r >= 0 &&
                r < grid.length &&
                c >= 0 &&
                c < grid[0].length &&
                grid[r][c] !== 1
            ) {
                return false;
            }
        }
        return true;
    }

    function findStartPos(map_name) {
        const grid = jsonData[map_name].grid;
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (grid[i][j] === 3) return [i, j];
            }
        }
        return [0, 0];
    }

    // --- 新增：线索功能 ---
    function showHint() {
        if (player.hp <= 1) {
            alert("生命值不足，无法查看线索！");
            return;
        }
        player.hp -= 1;
        drawGame(); // 更新HP显示
        hintButton.disabled = true; // 禁用按钮防止重复点击

        const drawMiniMap = (containerId, mapName) => {
            const grid = jsonData[mapName].grid;
            const container = document.getElementById(containerId);
            container.innerHTML = "";
            container.style.gridTemplateColumns = `repeat(${grid[0].length}, 25px)`;
            grid.forEach((row) => {
                row.forEach((tileVal) => {
                    const tileDiv = document.createElement("div");
                    let tileClass = TILE_CLASS_MAPPING[tileVal] || "floor";
                    if (tileVal === 1)
                        tileClass =
                            mapName === "map1" ? "wall-map1" : "wall-map2";
                    tileDiv.classList.add("mini-tile", tileClass);
                    container.appendChild(tileDiv);
                });
            });
        };

        drawMiniMap("hint-map1-grid", "map1");
        drawMiniMap("hint-map2-grid", "map2");

        modalOverlay.classList.remove("hidden");
        hintModal.classList.remove("hidden");

        let timeLeft = 10;
        hintTimerSpan.textContent = timeLeft;
        const timerInterval = setInterval(() => {
            timeLeft--;
            hintTimerSpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                hideAllModals();
                hintButton.disabled = false; // 重新启用按钮
            }
        }, 1000);
    }

    // --- 游戏启动与事件监听 ---
    async function initGame() {
        // 从查询字符串解析要读取的JSON文件名
        const jsonFilename = getJsonFilenameFromQuery();
        try {
            const response = await fetch(jsonFilename);
            if (!response.ok) throw new Error(`加载失败: ${response.status}`);
            jsonData = await response.json();
        } catch (err) {
            console.error("加载JSON失败", err);
            alert("关卡数据加载失败，请检查URL参数或网络。");
            return;
        }

        // 读取跳转链接（如果存在）
        winJump =
            jsonData && jsonData.winJump ? String(jsonData.winJump) : undefined;
        loseJump =
            jsonData && jsonData.loseJump
                ? String(jsonData.loseJump)
                : undefined;

        player.pos = findStartPos(player.map_name);
        drawGame();

        // 初始缩放一次
        applyScale();

        // 自动显示初始说明
        showInstructions();
        setTimeout(hideAllModals, 60000); // 60秒后自动关闭

        // 按钮事件监听
        instructionsButton.addEventListener("click", showInstructions);
        hintButton.addEventListener("click", showHint);
        closeButton.addEventListener("click", hideAllModals);
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) hideAllModals();
        });

        // 键盘事件监听...
        const keyMap = {
            ArrowUp: "up",
            w: "up",
            ArrowDown: "down",
            s: "down",
            ArrowLeft: "left",
            a: "left",
            ArrowRight: "right",
            d: "right",
        };
        const pressedKeys = new Set();

        window.addEventListener("keydown", (e) => {
            const keyElement = document.getElementById(`key-${keyMap[e.key]}`);
            if (keyElement) keyElement.classList.add("pressed");

            if (keyMap[e.key] && !pressedKeys.has(e.key)) {
                pressedKeys.add(e.key);
                movePlayer(keyMap[e.key]);
            }
        });
        window.addEventListener("keyup", (e) => {
            const keyElement = document.getElementById(`key-${keyMap[e.key]}`);
            if (keyElement) keyElement.classList.remove("pressed");
            pressedKeys.delete(e.key);
        });

        // 窗口大小变化时重新适配
        window.addEventListener("resize", applyScale);
    }

    initGame();
});
