//注册账号
function signup() {
    const username = document.getElementById("text-signup").value;
    const password = document.getElementById("password-signup").value;
    const passwordCheck = document.getElementById("password-signup-check").value;
    const strength = document.getElementById("strength");

    if (Store.get(username)) {
        showAlertWithCountdown("用户名已存在，请选择其他用户名。", 1);
        return ;
    }
    if (username.length == 0) {
        showAlertWithCountdown("请输入用户名", 1);
        return ;
    }

    if (password != passwordCheck) {
        showAlertWithCountdown("两次密码输入不同", 1);
        return ;
    }
    Store.set(username, password);
    showAlertWithCountdown("注册成功！", 1);

    toLogin(username, password);
}

const toLogin = (usernameVal, passwordVal) => {
    const username = document.getElementById("text");
    const password = document.getElementById("password");

    username.value = usernameVal;
    password.value = passwordVal;

    toLoginPage();
}

// 登录账号
function login() {
    const username = document.getElementById("text").value;
    const password = document.getElementById("password").value;
    const storedPassword = Store.get(username);

    if (storedPassword === null) {
        showAlertWithCountdown("用户名不存在。", 1);
    } else if (storedPassword === password) {
        showAlertWithCountdown("登录成功！", 1);
        Store.set("token", username);

        // 跳转到主页
        window.location.href = `../../index.html?${window.$store.encode()}`;
    } else {
        showAlertWithCountdown("密码错误。", 1);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const signupLink = document.getElementById("signupLink");
    const loginLink = document.getElementById("loginLink");

    window.$store = new Store();

    // 初始显示登录表单
    loginForm.style.display = "block";
    signupForm.style.display = "none";

    // 处理登录和注册表单的切换
    signupLink.addEventListener("click", toSignupPage);

    loginLink.addEventListener("click", toLoginPage);
});

const toSignupPage = (e) => {
    if (e)
        e.preventDefault();
    loginForm.style.display = "none";
    signupForm.style.display = "block";
}

const toLoginPage = (e) => {
    if (e)
        e.preventDefault();
    loginForm.style.display = "block";
    signupForm.style.display = "none";
}

//模拟alert
function showAlertWithCountdown(message, seconds) {
    const alertElements = document.querySelectorAll(".custom-alert");
    console.debug(alertElements);
    alertElements.forEach((alertElement) => {
        const messageElement = alertElement.querySelector(".message");

        messageElement.textContent = message;

        // 显示模态框
        alertElement.classList.remove("hidden");

        // 开始倒计时
        setTimeout(() => {
            hideAlert();
        }, seconds * 1000);
    });
}

function hideAlert() {
    const alertElements = document.querySelectorAll(".custom-alert");
    alertElements.forEach((alertElement) => {
        alertElement.classList.add("hiding");
        setTimeout(() => {
            alertElement.classList.add("hidden");
            alertElement.classList.remove("hiding");
        }, 233);
    });
}
