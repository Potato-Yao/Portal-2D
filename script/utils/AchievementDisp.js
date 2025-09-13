class AchievementDisp {
    /**
     *
     * @param {HTMLElement} ele
     */
    constructor(ele) {
        this.container = ele
        this.user = Auth.getToken();
    }

    getAll() {
        // 确保从Store中正确获取成就数据，即使数据结构不完整也能正确处理
        try {
            const allAchievements = JSON.parse(Store.get("achievements")) || {};
            const userAchievements = allAchievements[this.user] || [];
            
            // 确保返回的是数组
            if (!Array.isArray(userAchievements)) {
                console.warn("User achievements data is not an array");
                return [];
            }
            
            return userAchievements;
        } catch (e) {
            console.error("Error parsing achievements data:", e);
            return [];
        }
    }

    disp() {
        const achievements = this.getAll();
        const container = this.container;
        
        // 验证容器存在
        if (!container) {
            console.error("Container element not found for achievements display");
            return;
        }

        console.log(`Total achievements retrieved: ${achievements.length}`);
        
        // 清空容器，避免重复显示
        container.innerHTML = "";

        // 确保我们总是显示所有成就，而不仅仅是已完成的
        // 先过滤掉无效的成就对象
        const validAchievements = achievements.filter(a => a && a.title);
        console.log(`Valid achievements count: ${validAchievements.length}`);
        
        // 分离已获得和未获得的成就
        const completed = validAchievements.filter(a => a._completed);
        const incomplete = validAchievements.filter(a => !a._completed);
        
        console.log(`Completed achievements: ${completed.length}, Incomplete achievements: ${incomplete.length}`);

        // 先显示已获得的成就
        if (completed.length > 0) {
            completed.forEach(achievement => {
                try {
                    console.log(`Adding completed achievement: ${achievement.title}`);
                    const btn = this.generate(achievement);
                    if (btn) container.appendChild(btn);
                } catch (e) {
                    console.error("Failed to add completed achievement:", e);
                }
            });
        }

        // 再显示未获得的成就
        if (incomplete.length > 0) {
            incomplete.forEach(achievement => {
                try {
                    console.log(`Adding incomplete achievement: ${achievement.title}`);
                    const btn = this.generate(achievement);
                    if (btn) container.appendChild(btn);
                } catch (e) {
                    console.error("Failed to add incomplete achievement:", e);
                }
            });
        }

        // 如果没有有效的成就，显示空状态
        if (validAchievements.length === 0) {
            const empty = document.createElement("div");
            empty.classList.add("empty");
            empty.innerText = "没有可用的成就";
            container.appendChild(empty);
        }
    }

    generate(achievement) {
        // 确保成就对象及其属性存在
        if (!achievement) {
            console.warn("Attempting to generate UI for invalid achievement");
            return null;
        }
        
        try {
            const ele = document.createElement("div");
            ele.classList.add("list-item");
            // 根据完成状态添加不同类名
            ele.classList.add(achievement._completed ? "completed" : "incomplete");

            const title = document.createElement("div");
            title.classList.add("title");
            title.innerText = achievement.title || "未知成就";
            ele.appendChild(title);

            const condition = document.createElement("div");
            condition.classList.add("condition");
            condition.innerText = achievement._condition || achievement.condition || "未知条件";
            ele.appendChild(condition);

            const desc = document.createElement("div");
            desc.classList.add("desc");
            desc.innerText = achievement.desc || "";
            ele.appendChild(desc);

            const status = document.createElement("div");
            status.classList.add("status");
            status.innerText = achievement._completed ? "已完成" : "未完成";
            ele.appendChild(status);

            return ele;
        } catch (e) {
            console.error("Failed to generate achievement element:", e);
            return null;
        }
    }
}
