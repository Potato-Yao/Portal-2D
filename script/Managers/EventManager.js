class EventManager {
    constructor() {
        // this.head = null; // 指向队列的第一个元素
        // this.tail = null;  // 指向队列的最后一个元素
        // this.hasProcess = false;
        // this.processing = false;
        this.events = [];
    }

    load(data) {
        this.events = data.events;
    }

    async loadFromURL(url) {
        try {
            const response = await window.$game.dataManager.loadJSON(url);
            this.load(response);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    // add(events) {
    //     for (let event of events) {
    //         if (this.tail == null) {
    //             this.head = this.tail = event;
    //         } else {
    //             this.tail.next = event;
    //             this.tail = event;
    //         }
    //     }
    //     this.hasProcess = true;
    // }

    async handle() {
        // if (!this.hasProcess)
        //     return;
        // this.hasProcess = false;
        // // let player = window.$game.view.player;
        // if (!this.head)
        // {
        //     // player.blockMove = false;
        //     return;
        // }
        // player.blockMove = true;
        // let event = this.head;
        // // console.log(event);
        // this.processing = true;
        for (let event of this.events) {
            console.log(this.events)
            switch (event.type) {
                case "delay":
                    await wait(event.time);
                    break;
                case "dialog":
                    if (window.$game.dialogManager.printing)
                        await window.$game.dialogManager.clear();
                    window.$game.dialogManager.printing = false;
                    await window.$game.dialogManager.prints(event.texts, event.options);
                    break;
                case "fadeIn":
                    await window.$game.fadeIn();
                    break;
                case "fadeOut":
                    await window.$game.fadeOut();
                    break;
                // case "turn":
                //     player.facing = event.facing;
                //     break;
                case "showImg":
                    await window.$game.splash.showImg(event.url);
                    break;
                case "updateDay":
                    const dayShown = document.getElementById("day_shown");
                    dayShown.value = "Day: " + event.day;
                    break;
                case "hideImg":
                    await window.$game.splash.hide();
                    break;
                case "fadeHalf":
                    await window.$game.splash.fadeHalf();
                    break;
                case "playBGM":
                    window.$game.soundManager.playBGM(event.name);
                    break;
                case "jump":
                    if (event.url) {
                        let url = event.url.split("-");
                        if (url[0] === "autoselect") {
                            if (url[1] === "game4") {
                                if (window.$gameStateSum > 2) {
                                    window.location.href = "./assets/games/game/index.html?json=第四关map.json";
                                } else {
                                    window.location.href = "./assets/games/game/index.html?json=第四四关map.json";
                                }
                            }
                        }
                        window.location.href = "./assets/games/" + event.url;
                    }
                    await window.$game.switchView(window.$choice);
                    return;
                // case "deathSelect":
                //     await window.$game.deadScreen.show().then(async () => {
                //         // retry
                //         await window.$game.restart();
                //     }, async () => {
                //         // cancel
                //         Store.set("ending", "bad")
                //         await window.$game.gameEnd();
                //     });
                //     break;
                case "gameEnd":
                    await window.$game.gameEnd();
                    break;
                default:
                    break;
            }
        }

        // // player.blockMove = false;
        // this.processing = false;
        // if (this.head == null) {
        //     return;
        // }
        // this.head = this.head.next; // 移除已处理的事件
        // if (this.head == null)
        //     this.tail = null;
        // this.hasProcess = true;
    }

    async handleCase(event) {

    }

    clear() {
        // this.hasProcess = false;
        // this.processing = false;
        // window.$game.view.player.blockMove = true;
        // this.head = this.tail = null;
    }
}
