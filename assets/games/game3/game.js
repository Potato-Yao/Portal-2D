// game.js
document.addEventListener('DOMContentLoaded', () => {
    // --- 全局变量和常量 ---
    const TILE_SIZE = 40; // 必须和CSS中的 --tile-size 一致
    const TILE_CLASS_MAPPING = {
        0: 'floor',
        1: 'wall',
        2: 'switch',
        3: 'start',
        4: 'exit',
    };

    let mapsData = null; // 用来存储从 map.json 加载的地图数据
    let player = {
        name: "玩家1",
        hp: 3,
        map_name: "map3_1",
        pos: [0, 0] // 初始位置，稍后会更新
    };
    let isGameOver = false;

    // 获取HTML元素
    const gridContainer = document.getElementById('map-grid');
    const hpDisplay = document.getElementById('hp-display');
    const mapDisplay = document.getElementById('map-display');

    // --- 游戏函数 ---

    // 绘制整个游戏界面
    function drawGame() {
        if (!mapsData) return;

        const grid = mapsData[player.map_name].grid;
        
        // 动态设置网格布局的列数和行数
        gridContainer.style.gridTemplateColumns = `repeat(${grid[0].length}, ${TILE_SIZE}px)`;
        gridContainer.style.gridTemplateRows = `repeat(${grid.length}, ${TILE_SIZE}px)`;
        
        // 清空旧的地图
        gridContainer.innerHTML = '';

        // 遍历地图数据，创建每一个方块div
        grid.forEach((row, i) => {
            row.forEach((tileVal, j) => {
                const tileDiv = document.createElement('div');
                let tileClass = TILE_CLASS_MAPPING[tileVal] || 'floor';
                if (tileVal === 1) {
                    if (player.map_name === 'map3_1') {
                        tileClass = 'wall-map3_1';
                    } else { // 假设除了map1之外的地图都用第二种墙壁
                        tileClass = 'wall-map3_2';
                    }
                }

                tileDiv.classList.add('tile', tileClass);
                
                // 给每个方块加上ID，方便定位玩家
                tileDiv.id = `tile-${i}-${j}`;

                gridContainer.appendChild(tileDiv);
            });
        });

        // 在对应的方块上显示玩家
        const playerTile = document.getElementById(`tile-${player.pos[0]}-${player.pos[1]}`);
        if (playerTile) {
            playerTile.classList.add('player');
        }

        // 更新UI显示
        hpDisplay.textContent = `生命: ${player.hp}`;
        mapDisplay.textContent = `地图: ${player.map_name}`;
    }

    // 处理玩家移动
    function movePlayer(direction) {
        if (isGameOver) return;

        let dx = 0, dy = 0;
        if (direction === "up") dx = -1;
        else if (direction === "down") dx = 1;
        else if (direction === "left") dy = -1;
        else if (direction === "right") dy = 1;

        const [x, y] = player.pos;
        const new_x = x + dx;
        const new_y = y + dy;
        const grid = mapsData[player.map_name].grid;

        if (!(new_x >= 0 && new_x < grid.length && new_y >= 0 && new_y < grid[0].length)) {
            console.log("碰到地图边界！");
            return;
        }

        const cell = grid[new_x][new_y];

        if (cell === 1) {
            console.log("撞到了墙上，无法通过！");
            return;
        }

        if (cell === 4) {
            alert("🎉 你到达出口，游戏胜利！");
            isGameOver = true;
            return;
        }
        
        if (cell === 2) {
            switchMap(new_x, new_y);
        } else {
            player.pos = [new_x, new_y];
        }

        // 每次移动后都重绘游戏
        drawGame();

        if (player.hp <= 0) {
            alert("💀 生命归零，游戏失败！");
            isGameOver = true;
        }
    }

    // 切换地图
    function switchMap(switch_x, switch_y) {
        player.map_name = (player.map_name === "map3_1") ? "map3_2" : "map3_1";
        player.pos = [switch_x, switch_y];

        const grid = mapsData[player.map_name].grid;
        if (grid[player.pos[0]][player.pos[1]] === 1) {
            player.hp -= 1;
            console.log("传送点在墙上！掉一条命");
                        // --- 新增的动画触发逻辑 ---
            hpDisplay.classList.add('damage-flash'); // 立即添加动画类
            
            // 设置一个定时器，在动画播放完毕后移除这个类
            // 动画时长0.5秒，播放2次，总时长1秒 (1000毫秒)
            setTimeout(() => {
                hpDisplay.classList.remove('damage-flash');
            }, 1000);
            // --- 逻辑结束 ---
        }
    }
    
    // 寻找初始位置
    function findStartPos(map_name) {
        const grid = mapsData[map_name].grid;
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (grid[i][j] === 3) {
                    return [i, j];
                }
            }
        }
        return [0, 0]; // 如果找不到，默认位置
    }

    // --- 游戏启动 ---
    async function initGame() {
        // 异步加载地图文件
        const response = await fetch('map3.json');
        mapsData = await response.json();
        
        // 设置玩家初始位置
        player.pos = findStartPos(player.map_name);

        // 首次绘制游戏
        drawGame();

        // 监听键盘事件
// --- 新的键盘事件监听逻辑 ---

        // 帮助函数，用于更新屏幕上虚拟按键的样式
        function updateKeyAppearance(key, isPressed) {
            let keyElementId = null;
            switch(key) {
                case 'ArrowUp': case 'w': keyElementId = 'key-up'; break;
                case 'ArrowDown': case 's': keyElementId = 'key-down'; break;
                case 'ArrowLeft': case 'a': keyElementId = 'key-left'; break;
                case 'ArrowRight': case 'd': keyElementId = 'key-right'; break;
            }

            if (keyElementId) {
                const keyElement = document.getElementById(keyElementId);
                if (isPressed) {
                    keyElement.classList.add('pressed');
                } else {
                    keyElement.classList.remove('pressed');
                }
            }
        }

        // 监听按键按下事件
        window.addEventListener('keydown', (e) => {
            updateKeyAppearance(e.key, true); // 更新按键外观为“按下”

            let direction = null;
            switch(e.key) {
                case 'ArrowUp': case 'w': direction = 'up'; break;
                case 'ArrowDown': case 's': direction = 'down'; break;
                case 'ArrowLeft': case 'a': direction = 'left'; break;
                case 'ArrowRight': case 'd': direction = 'right'; break;
            }
            if (direction) {
                movePlayer(direction); // 移动玩家
            }
        });

        // 监听按键抬起事件
        window.addEventListener('keyup', (e) => {
            updateKeyAppearance(e.key, false); // 恢复按键外观为“抬起”
        });
    }

    initGame();
});