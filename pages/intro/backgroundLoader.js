/**
 * 背景图片加载器
 * 负责从localStorage读取保存的背景图片路径并应用到页面
 */
(function() {
    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        try {
            // 尝试从localStorage读取保存的背景图片路径
            const savedBackground = Store.get('backgroundImage');
            if (savedBackground) {
                // 如果有保存的背景图片，直接设置
                console.log('Loading saved background image:', savedBackground);
                document.body.style.backgroundImage = `url('../../assets/imgs/${savedBackground}')`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundRepeat = 'no-repeat';
            } else if (window.BackgroundChanger) {
                // 如果没有保存的背景图片，使用BackgroundChanger设置默认背景
                BackgroundChanger.setBackground('../../assets/imgs/');
            }
        } catch (error) {
            console.error('Error loading background image:', error);
            // 如果出错，使用BackgroundChanger设置默认背景
            if (window.BackgroundChanger) {
                BackgroundChanger.setBackground('../../assets/imgs/');
            }
        }
    });
})();