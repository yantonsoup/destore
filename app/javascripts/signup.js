const zxcvbn = nodeRequire('zxcvbn');
const Config = nodeRequire('electron-config');
const config = new Config();
const Ethereum = nodeRequire('../../libs/ethereum/ethereum.js');

const strength = {
  0: 'Worst ☹',
  1: 'Bad ☹',
  2: 'Weak ☹',
  3: 'Good ☺',
  4: 'Strong ☻'
};

const password = document.getElementById('password');
const meter = document.getElementById('password-strength-meter');
const text = document.getElementById('password-strength-text');

$(document).ready(function() {
  // Show/Hide Tabs
  $('.tabs .tab-links a').on('click', function(e) {
    var currentAttrValue = $(this).attr('href');

    $('.tabs ' + currentAttrValue).fadeIn(400).siblings().hide();

    // Change/remove current tab to active
    $(this).parent('li').addClass('active').siblings().removeClass('active');

    e.preventDefault();
  });

  //Route to Host/User on Submit
  $('.form').submit(function(e) {
    e.preventDefault();

    //get password
    var userPass = $(this).find('.password').val();
    config.set('user', { password: userPass });

    //call function for password -> account
    var userID;
    if(!Ethereum.check()) userID = Ethereum.createAccount(userPass);
    else userID = '0x8cf0451e8e69ac504cd0a89d6874a827770e80e6';
    console.log(userID);
    config.set('user', { id: userID });

    //display account in popup (with Authenticate button)

    //FOR NOW - routing to user or host page
    // var currentTab = $(this).data('tab');
    // config.set('user', { path: currentTab });
    // window.location = `../html/${currentTab}.html`;
  });

  $('body').on('click', '#authenticate', function() {
    //routing to user or host page
    var currentTab = $(this).data('tab');
    config.set('user', { path: currentTab });
    window.location = `../html/${currentTab}.html`;
  });

  //password STUFF??
  // password.addEventListener('input', function() {
  //   const val = password.value;
  //   const result = zxcvbn(val);

  //   // Update the password strength meter
  //   meter.value = result.score;
  // });

// check that passwords match and then
  $(function() {
    $('.password-confirm').keyup(function() {
      var pwToCheck = $('.password').val();
      $('#divCheckPasswordMatch').html(pwToCheck == $(this).val() ? 'Passwords match.' : 'Passwords do not match!');
    });
  });

});
