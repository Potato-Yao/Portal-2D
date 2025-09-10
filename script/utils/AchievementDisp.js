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
        return JSON.parse(Store.get("achievements"))?.[this.user] ?? [];
    }

    disp() {
        const achievements = this.getAll();
        const container = this.container;

        // 分离已获得和未获得的成就
        const completed = achievements.filter(a => a._completed);
        const incomplete = achievements.filter(a => !a._completed);

        // 先显示已获得的成就
        completed.forEach(achievement => {
            const btn = this.generate(achievement);
            container.appendChild(btn);
        });

        // 再显示未获得的成就
        incomplete.forEach(achievement => {
            const btn = this.generate(achievement);
            container.appendChild(btn);
        });

        if (achievements.length === 0) {
            const empty = document.createElement("div");
            empty.classList.add("empty");
            empty.innerText = "没有可用的成就";
            container.appendChild(empty);
        }
    }

    generate(achievement) {
        const ele = document.createElement("div");
        ele.classList.add("list-item");
            // 根据完成状态添加不同类名
            ele.classList.add(achievement._completed ? "completed" : "incomplete");

        const title = document.createElement("div");
        title.classList.add("title");
        title.innerText = achievement.title;
        ele.appendChild(title);

        const condition = document.createElement("div");
        condition.classList.add("condition");
        condition.innerText = achievement._condition;
        ele.appendChild(condition);

        const desc = document.createElement("div");
        desc.classList.add("desc");
        desc.innerText = achievement.desc;
        ele.appendChild(desc);

        const status = document.createElement("div");
        status.classList.add("status");
        status.innerText = achievement._completed ? "已完成" : "未完成";
        ele.appendChild(status);

        return ele;
    }
}
