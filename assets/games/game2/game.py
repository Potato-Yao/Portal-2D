import json
import os

# 读取地图,不同关卡换json文件的名字！！
with open("map1.json", "r") as f:
    map1 = json.load(f)

class Player:
    def __init__(self, name, start_map="map1_1"):
        self.name = name
        self.map_name = start_map
        self.hp = 3  # 初始生命
        self.pos = self.find_start_pos(start_map)

    def find_start_pos(self, map_name):
        grid = map1[map_name]["grid"]
        for i, row in enumerate(grid):
            for j, val in enumerate(row):
                if val == 3:  # 入口
                    return [i, j]
        raise ValueError(f"{map_name} 没有入口!")

    def display_map(self):
        """在控制台打印地图和玩家位置"""
        os.system('cls' if os.name == 'nt' else 'clear')  # 清屏
        print(f"地图：{self.map_name}   生命：{self.hp}")
        grid = map1[self.map_name]["grid"]
        for i, row in enumerate(grid):
            line = ""
            for j, val in enumerate(row):
                if [i, j] == self.pos:
                    line += " P "
                else:
                    line += f" {val} "
            print(line)
        print("\n方向: up/down/left/right, exit退出")

    def move(self, direction):
        dx, dy = 0, 0
        if direction == "up": dx = -1
        elif direction == "down": dx = 1
        elif direction == "left": dy = -1
        elif direction == "right": dy = 1
        else:
            print("请输入有效方向")
            return False

        x, y = self.pos
        new_x, new_y = x + dx, y + dy
        grid = map1[self.map_name]["grid"]

        # 边界检测
        if not (0 <= new_x < len(grid) and 0 <= new_y < len(grid[0])):
            print("碰到地图边界！")
            return False

        cell = grid[new_x][new_y]

        # 胜利判定
        if cell == 4:  # 出口
            print("🎉 你到达出口，游戏胜利！")
            return "win"

        # 【改动一】切换地图机关：将新位置的坐标传递给 switch_map
        if cell == 2:
            self.switch_map(new_x, new_y)
            return False
        
        # 墙格子判断
        if cell == 1:
            print("撞到了墙上，无法通过！")
            return False # 直接返回，不移动也不掉血

        # 普通可走区域
        self.pos = [new_x, new_y]
        return False

    def switch_map(self,switch_x,switch_y):
        # 切换规则 map1 <-> map2
        new_map = "map1_2" if self.map_name == "map1_1" else "map1_1"
        self.map_name = new_map
        self.pos = [switch_x, switch_y]
        print(f"通过机关切换到 {self.map_name}，新位置 {self.pos}")

        # 检查入口是否在墙上
        grid = map1[new_map]["grid"]
        if grid[self.pos[0]][self.pos[1]] == 1:
            self.hp -= 1
            print(f"入口在墙上！掉一条命，剩余生命：{self.hp}")
            if self.hp <= 0:
                print("💀 生命归零，游戏失败！")
                return "lose"

# 游戏循环
player = Player("玩家1")

while True:
    player.display_map()
    cmd = input("你的操作: ").strip()
    if cmd == "exit":
        break
    result = player.move(cmd)
    if result in ["win", "lose"]:
        break
