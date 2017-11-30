var login = {
    loginInterface: function() {
        var button = $('#login_btn');
        button.click(function () {
            var userName = $('#login_usrNm').val();
            var password = $('#login_pass').val();
            if (userName === "Fiona" && password === "1234") {
                window.location.href = "http://localhost:54082/tmpl/_style.tmpl.html";
            }
        });
    }
}