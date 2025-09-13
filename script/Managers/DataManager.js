class DataManager {
    constructor() {
        // 初始化一个数组来存储加载的script元素，以便后续清理
        this.loadedScripts = [];
    }
    
    // 添加resolve方法，用于接收和处理JSONP数据
    resolve(data) {
        // 确保回调函数存在并调用它
        if (this._resolveCallback) {
            this._resolveCallback(data);
        }
    }
    
    async loadJSON(src) {
        let jsonp = document.createElement('script');
        jsonp.src = src;
        let json = await new Promise((resolve) => {
            // 保存resolve回调函数的引用
            this._resolveCallback = resolve;
            
            // 错误处理，确保即使加载失败也能继续执行
            jsonp.onerror = () => {
                console.error(`Failed to load JSON: ${src}`);
                resolve([]); // 加载失败时返回空数组
            };

            // 将script元素添加到DOM上开始加载
            const resourceElement = document.getElementById('resource');
            if (resourceElement) {
                resourceElement.appendChild(jsonp);
                // 保存已加载的script元素引用
                this.loadedScripts.push(jsonp);
            }
        });
        
        // 清理：移除已加载的script元素（可选，取决于是否需要缓存）
        // this.cleanupLoadedScripts();
        
        return json;
    }
    
    // 清理已加载的script元素（可以根据需要调用）
    cleanupLoadedScripts() {
        const resourceElement = document.getElementById('resource');
        if (resourceElement) {
            this.loadedScripts.forEach(script => {
                try {
                    if (script.parentNode === resourceElement) {
                        resourceElement.removeChild(script);
                    }
                } catch (e) {
                    console.warn('Failed to remove script element:', e);
                }
            });
            this.loadedScripts = [];
        }
    }
    
    async loadImg(src) {
        let img = await new Promise(resolve => {
            let img = new Image();
            img.src = src;
            const resourceElement = document.getElementById('resource');
            if (resourceElement) {
                resourceElement.appendChild(img);
            }
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                resolve(null); // 加载失败时返回null
            };
        });
        return img;
    }
    
    async loadSpritesheet(src) {
        try {
            let json = await this.loadJSON(src);
            let imgsrc = src.split('/');
            imgsrc[imgsrc.length - 1] = json.meta.image;
            imgsrc = imgsrc.join('/');
            let img = await this.loadImg(imgsrc);
            
            return new Spritesheet(json, img);
        } catch (error) {
            console.error(`Failed to load spritesheet: ${src}`, error);
            return null;
        }
    }
}
