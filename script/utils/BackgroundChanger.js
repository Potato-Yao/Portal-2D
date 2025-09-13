class BackgroundChanger {
    /**
     * 根据已解锁的成就数量获取对应的背景图片
     * @returns {string} 背景图片路径
     */
    static getBackgroundImage() {
        try {
            // 检查是否存在AchievementManager和Store
            if (typeof AchievementManager !== 'undefined' && typeof Store !== 'undefined') {
                // 获取所有成就
                const achievements = AchievementManager.getAll();
                
                // 过滤出已完成的成就
                const completedAchievements = achievements.filter(achievement => 
                    achievement && achievement._completed === true
                );
                
                const completedCount = completedAchievements.length;
                
                // 检查是否有总成就数量（用于判断是否全成就）
                const totalAchievements = achievements.length;
                
                // 根据完成的成就数量返回对应的背景图片
                if (completedCount === 0) {
                    return 'theme1.png'; // 未解锁任何成就
                } else if (completedCount < totalAchievements) {
                    return 'theme2.png'; // 解锁一个成就
                } else {
                    return 'theme4.png'; // 解锁全部成就
                }
            } else {
                // 如果AchievementManager或Store未加载，返回默认图片
                return 'theme1.png';
            }
        } catch (error) {
            console.error('Error getting background image:', error);
            return 'theme1.png';
        }
    }
    
    /**
     * 设置页面的背景图片
     * @param {string} basePath - 基础路径，用于不同页面引用相同图片
     */
    static setBackground(basePath = '../imgs/') {
        try {
            // 获取当前应该显示的背景图片
            const backgroundImage = this.getBackgroundImage();
            
            // 构建完整的图片路径
            const imagePath = basePath + backgroundImage;
            
            // 设置body的背景图片
            document.body.style.backgroundImage = `url('${imagePath}')`;
            
            console.log(`Background image set to: ${imagePath}`);
        } catch (error) {
            console.error('Error setting background image:', error);
        }
    }
}

// 确保BackgroundChanger在window对象上可用
window.BackgroundChanger = BackgroundChanger;