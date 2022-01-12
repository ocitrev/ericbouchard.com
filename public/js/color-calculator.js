var nested = false;
var errorCtl = null;

$(document).ready(function () {
  $('#txtRed').change(onRGBChanged);
  $('#txtGreen').change(onRGBChanged);
  $('#txtBlue').change(onRGBChanged);
  $('#txtInt').change(onIntChanged);
  $('#txtHexa').change(onHexaChanged);
  $('#txtWeb').change(onWebChanged);

  $('input[type="number"]').click(function () {
    $(this).select();
  });

  $('input[type="text"]').click(function () {
    $(this).select();
  });

});

function getWebRGB(r, g, b) {
  var strR = '' + r.toString(16);
  while (strR.length < 2)
    strR = '0' + strR;

  var strG = '' + g.toString(16);
  while (strG.length < 2)
    strG = '0' + strG;

  var strB = '' + b.toString(16);
  while (strB.length < 2)
    strB = '0' + strB;

  return '#' + strR + strG + strB;
}

function clamp(val, min, max) {
  if (val < min)
    return min;

  if (val > max)
    return max;

  return val;
}

function onRGBChanged() {
  $('.error').toggleClass('error');
  var txtRed = $('#txtRed');
  var txtGreen = $('#txtGreen');
  var txtBlue = $('#txtBlue');
  var txtInt = $('#txtInt');
  var txtHexa = $('#txtHexa');
  var txtWeb = $('#txtWeb');
  var mRed = /\d+/g.exec(txtRed.val());
  var mGreen = /\d+/g.exec(txtGreen.val());
  var mBlue = /\d+/g.exec(txtBlue.val());

  if (mRed != null && mGreen != null && mBlue != null) {
    var r = clamp(parseInt(mRed, 10), 0, 255);
    var g = clamp(parseInt(mGreen, 10), 0, 255);
    var b = clamp(parseInt(mBlue, 10), 0, 255);
    txtWeb.val(getWebRGB(r, g, b));
    var col = (r | g << 8 | b << 16);
    txtInt.val(col);
    txtHexa.val('0x' + col.toString(16));
    txtRed.val(r);
    txtGreen.val(g);
    txtBlue.val(b);

    $('#preview').css('background-color', txtWeb.val());
  } else {
    if (mRed == null)
      txtRed.addClass('error').fadeIn();

    if (mGreen == null)
      txtGreen.addClass('error');

    if (mBlue == null)
      txtBlue.addClass('error');
  }
}

function onIntChanged() {
  $('.error').toggleClass('error');
  var txtRed = $('#txtRed');
  var txtGreen = $('#txtGreen');
  var txtBlue = $('#txtBlue');
  var txtInt = $('#txtInt');
  var txtHexa = $('#txtHexa');
  var txtWeb = $('#txtWeb');
  var m = /\d+/g.exec(txtInt.val());

  if (m != null) {
    var col = clamp(parseInt(m, 10), 0, 0xffffff);
    var r = (col) & 0xff;
    var g = (col >> 8) & 0xff;
    var b = (col >> 16) & 0xff;
    txtRed.val(r.toString(10));
    txtGreen.val(g);
    txtBlue.val(b);
    txtWeb.val(getWebRGB(r, g, b));
    txtHexa.val('0x' + col.toString(16));
    txtInt.val(col);

    $('#preview').css('background-color', txtWeb.val());
  } else {
    txtInt.addClass('error');
  }
}

function onHexaChanged() {
  $('.error').toggleClass('error');
  var txtRed = $('#txtRed');
  var txtGreen = $('#txtGreen');
  var txtBlue = $('#txtBlue');
  var txtInt = $('#txtInt');
  var txtHexa = $('#txtHexa');
  var txtWeb = $('#txtWeb');
  var m = /(0[xX])?([a-fA-F0-9]{1,6})/g.exec(txtHexa.val());

  if (m != null) {
    var col = clamp(parseInt(m[2], 16), 0, 0xffffff);
    var r = (col) & 0xff;
    var g = (col >> 8) & 0xff;
    var b = (col >> 16) & 0xff;
    txtRed.val(r);
    txtGreen.val(g);
    txtBlue.val(b);
    txtInt.val(col);
    txtWeb.val(getWebRGB(r, g, b));
    txtHexa.val('0x' + col.toString(16));

    $('#preview').css('background-color', txtWeb.val());
  } else {
    txtHexa.addClass('error')
  }
}

function onWebChanged() {
  $('.error').toggleClass('error');
  var txtRed = $('#txtRed');
  var txtGreen = $('#txtGreen');
  var txtBlue = $('#txtBlue');
  var txtInt = $('#txtInt');
  var txtHexa = $('#txtHexa');
  var txtWeb = $('#txtWeb');
  var m = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/g.exec(txtWeb.val());

  if (m != null) {
    var col;

    if (m[1].length == 3) {
      var tmpR = m[1].charAt(0);
      var tmpG = m[1].charAt(1);
      var tmpB = m[1].charAt(2);
      var tmp = '' + tmpR + tmpR
                   + tmpG + tmpG
                   + tmpB + tmpB;

      col = parseInt(tmp, 16);
    } else {
      col = parseInt(m[1], 16);
    }

    var r = (col >> 16) & 0xff;
    var g = (col >> 8) & 0xff;
    var b = (col) & 0xff;
    col = r | g << 8 | b << 16;

    txtRed.val(r);
    txtGreen.val(g);
    txtBlue.val(b);
    txtInt.val(col);
    txtHexa.val('0x' + col.toString(16));
    txtWeb.val(getWebRGB(r, g, b));

    $('#preview').css('background-color', txtWeb.val());
  } else {
    txtWeb.addClass('error');
  }
}
