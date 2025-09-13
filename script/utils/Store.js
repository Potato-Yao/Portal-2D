class Store {
    static prefix = "portal-2d-"
    constructor() {
        const p = new URLSearchParams(window.location.search);
        p.forEach((v, k) => {
            localStorage.setItem(k, v);
        });

        if (window.location.search)
            window.location.search = "";
    }

    static get(key) {
        // console.log(`get ${key}`);
        return localStorage.getItem(`${Store.prefix}${key}`);
    }

    static set(key, value) {
        localStorage.setItem(`${Store.prefix}${key}`, value);
    }

    static remove(key) {
        localStorage.removeItem(`${Store.prefix}${key}`);
    }

    export() {
        let data = new Map();
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data.set(key, localStorage.getItem(key));
        }
        return data;
    }

    // 修改后的encode方法，仅传递必要的信息，避免URL过长导致431错误
    encode() {
        const data = new Map();
        // 只保留几个必要的参数，而不是所有localStorage数据
        const necessaryKeys = ['portal-2d-toLoad'];
        
        for (const key of necessaryKeys) {
            const value = localStorage.getItem(key);
            if (value) {
                data.set(key, value);
            }
        }
        
        const param = new URLSearchParams(data);
        return param.toString();
    }
}
