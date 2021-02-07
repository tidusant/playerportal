$(function () {
	var $w = $(wallet);

	$w.on("forgotPasswordCalled", function (ev, message) {
		alert("Please check your email for password reset information!");
	});

	$w.on("passwordResetCalled", function (ev, successMessage) {
		alert("Reset successful! Please log in...");
		window.location.href = "/Account/Login";
	});

	$(".btnforgotpassword").click(function () {
		forgotpassword();
	});
});

function forgotpassword() {
	var firstname = $("#firstname").val();
	var lastname = $("#lastname").val();
	var email = $("#email").val();
	wallet.forgotPassword(firstname, lastname, email);
}