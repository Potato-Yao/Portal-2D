class AchievementManager {
    static getAll() {
        try {
            return JSON.parse(Store.get("achievements"))?.[ Auth.getToken() ] || [];
        } catch (e) {
            console.error("Failed to parse achievements data:", e);
            return [];
        }
    }

    /**
     * @returns {Map<string, boolean>}
     */
    getAllStatus() {
        const all = AchievementManager.getAll();
        const status = new Map();
        all.forEach((achievement) => {
            if (achievement && achievement.title) {
                status.set(achievement.title, achievement._completed || false);
            }
        });

        return status;
    }

    constructor() {
        /**
         * @type {Achievement[]}
         */
        this.achievements = [];

        /**
         * @type {Map<string, boolean>}
         */
        this.status = this.getAllStatus();
        this.popup = document.querySelector(".achievement");
        this.user = Auth.getToken();
    }

    async load() {
        try {
            const achievements = await window.$game.dataManager.loadJSON("./assets/stages/achievements.json");
            
            console.log(`Achievements JSON loaded, count: ${achievements ? achievements.length : 0}`);
            
            // 检查数据是否有效
            if (!achievements || !Array.isArray(achievements)) {
                console.error("Invalid achievements data format");
                return;
            }
            
            const Achievements = [
                EndingAchievement
            ];
            
            // 清空现有成就列表，重新加载
            this.achievements = [];
            this.status = this.getAllStatus();
            
            achievements.forEach((a, index) => {
                try {
                    // 确保成就对象有效
                    if (!a || typeof a !== 'object') {
                        console.warn(`Skipping invalid achievement at index ${index}`);
                        return;
                    }
                    
                    console.log(`Processing achievement at index ${index}: ${JSON.stringify(a)}`);
                    
                    // 为每个EndingAchievement设置正确的ending值（根据索引从1开始）
                    if (Achievements[a.type] === EndingAchievement || a.type === 0) {
                        a.ending = index + 1;
                    }
                    
                    // 创建并添加成就实例
                    let achievementInstance;
                    try {
                        achievementInstance = new Achievements[a.type](a);
                    } catch (e) {
                        // 如果类型匹配失败，默认创建EndingAchievement实例
                        console.warn(`Failed to create achievement of type ${a.type}, falling back to EndingAchievement`, e);
                        achievementInstance = new EndingAchievement(a);
                    }
                    
                    this.add(achievementInstance);
                } catch (e) {
                    console.error(`Failed to process achievement at index ${index}:`, e);
                    // 即使出现错误也继续处理下一个成就
                }
            });
            
            console.log(`Successfully loaded ${this.achievements.length} achievements`);
            
            // 确保所有成就都保存到本地存储
            this.refresh();
        } catch (error) {
            console.error("Failed to load achievements:", error);
        }
    }

    get game() {
        return window.$game;
    }

    get view() {
        return this.game.view;
    }

    get player() {
        return this.view.player;
    }

    getStatus(title) {
        return this.getAllStatus().get(title) || false;
    }

    update(t) {
        this.achievements.forEach((achievement) => {
            if (achievement && achievement.completed !== true) {
                try {
                    achievement.check(t, this);
                } catch (e) {
                    console.error(`Error checking achievement: ${achievement.title}`, e);
                }
            }
        });
    }

    add(achievement) {
        if (!achievement || !achievement.title) {
            console.warn("Skipping invalid achievement");
            return;
        }
        
        if (!this.getAllStatus().has(achievement.title)) {
            this.status.set(achievement.title, false);
        }
        
        const status = this.getStatus(achievement.title);
        achievement.completed = status;
        this.achievements.push(achievement);
        
        console.log(`Added achievement: ${achievement.title} (Ending ${achievement.ending})`);
    }

    onCompleted(achievement) {
        if (!achievement || !achievement.title) {
            console.warn("Invalid achievement completion event");
            return;
        }
        
        this.achievements.forEach((a) => {
            if (a && a.title === achievement.title) {
                a.completed = true;
                this.status.set(a.title, true);
            }
        });
        
        this.refresh();

        if (this.popup) {
            try {
                this.popup.querySelector(".title").innerText = achievement.title || "未知成就";
                this.popup.querySelector(".desc").innerText = achievement.desc || "";
                this.popup.classList.remove("hidden");
                setTimeout(() => {
                    this.popup.classList.add("hide");
                    setTimeout(() => {
                        this.popup.classList.add("hidden");
                        this.popup.classList.remove("hide");
                    }, 1000);
                }, 5000);
            } catch (e) {
                console.error("Failed to show achievement popup", e);
            }
        }
    }

    refresh() {
        try {
            const all = JSON.parse(Store.get("achievements")) ?? {};
            
            // 确保用户数据对象存在
            if (!all[this.user]) {
                all[this.user] = [];
            }
            
            console.log(`Current achievements count in memory: ${this.achievements.length}`);
            
            // 更新所有成就状态
            const achievementData = this.achievements.map((achievement, index) => {
                if (!achievement) {
                    console.warn(`Skipping null achievement at index ${index}`);
                    return null;
                }
                
                const achievementObj = {
                    title: achievement.title || "未知成就",
                    desc: achievement.desc || "",
                    _condition: achievement._condition || "",
                    _completed: this.status.get(achievement.title) || false,
                    ending: achievement.ending || 0
                };
                
                console.log(`Processing achievement: ${achievementObj.title} (Ending ${achievementObj.ending})`);
                return achievementObj;
            }).filter(Boolean); // 过滤掉null值
            
            all[this.user] = achievementData;
            Store.set("achievements", JSON.stringify(all));
            
            console.log(`Refreshed achievements data, stored ${achievementData.length} achievements`);
            
            // 检查存储的数据
            const stored = JSON.parse(Store.get("achievements"))?.[this.user] || [];
            console.log(`Stored achievements count: ${stored.length}`);
        } catch (error) {
            console.error("Failed to refresh achievements data:", error);
        }
    }
}

/**
 * @abstract
 */
class Achievement {
    constructor(a) {
        this.title = a?.title || "未知成就";
        this.desc = a?.desc || "";
        this._condition = a?.condition || "";
        this._completed = false;
    }

    get completed() {
        return this._completed;
    }

    set completed(value) {
        this._completed = value;
    }

    check(t, that) {
        if (this.completed) return;
        if (this.condition(t, that)) {
            this.completed = true;
            that.onCompleted(this);
        }
    }

    condition(t, that) {
        return false;
    }
}

class EndingAchievement extends Achievement {
    constructor(a) {
        super(a);
        this.ending = a?.ending || 0;
    }
    
    condition(t, that) {
        // 增加更多的安全检查，确保that、that.game、that.game.chapterNow和that.game.ending存在
        return that && that.game && that.game.chapterNow === "Outro" && 
               typeof that.game.ending !== 'undefined' && that.game.ending == this.ending;
    }
}
