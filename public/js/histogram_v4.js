function createCookie(name, value) {
  document.cookie = name + '=' + escape(value) + "; path=" + g_cookiePath;
}

function toggleHistogram(e, control) {
  if (e.ctrlKey) {
    if (g_showHistogram == 0) {
      g_showHistogram = 1;
      createCookie('histogram', 'luminosity');
      control.src = g_imageHistogram + '&type=luminosity';
    }
    else if (g_showHistogram == 1) {
      g_showHistogram = 2;
      createCookie('histogram', 'colors');
      control.src = g_imageHistogram + '&type=colors';
    }
    else {
      g_showHistogram = 0;
      createCookie('histogram', 'hide');
      control.src = g_imageOriginal;
    }
  }
}

function navigateNext() {
  var nextHref = document.getElementById('nextHref');
  if (nextHref != null) {
    document.location = nextHref.href;
  }
}

var closeup_visible = false;

function closeup(sender, e, image) {
  var photoImg = document.getElementById(sender);

  if (!closeup_visible) {
    photoImg.src = image;
    closeup_visible = true;
    photoImg.onclick = closeup_onclick;
  }
  else {
    photoImg.src = g_imageOriginal;
    closeup_visible = false;
    photoImg.onclick = null;
  }

  e.cancelBubble = true;
}

function closeup_onclick() {
  this.src = g_imageOriginal;
  closeup_visible = false;
}

function setStyleDisplay(item1, display1, item2, display2) {
  var element1 = document.getElementById(item1);
  if (element1 != null) {
    element1.style.display = display1;
  }

  var element2 = document.getElementById(item2);
  if (element2 != null) {
    element2.style.display = display2;
  }
}

var httpRequest = null;

function createHttpRequest() {
  if (httpRequest == null) {
    if (window.ActiveXObject) {
      // for IE
      httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
    }
    else if (window.XMLHttpRequest) {
      // for other browsers
      httpRequest = new XMLHttpRequest();
    }

    if (httpRequest != null) {
      httpRequest.onreadystatechange = processRequest;
    }
  }
}

function submitComment(author, comment, spamProof, url, photoHash) {
  resetError();

  createHttpRequest();

  if (httpRequest != null) {
    var txtAuthor = document.getElementById(author);
    var txtComment = document.getElementById(comment);
    var txtSpamProof = document.getElementById(spamProof);

    httpRequest.open('POST', url, true);
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");

    var body = 'author=' + encodeURIComponent(txtAuthor.value) + '&spamproof=' +
                    encodeURIComponent(txtSpamProof.value) + '&comment=' + encodeURIComponent(txtComment.value) +
                    '&photohash=' + encodeURIComponent(photoHash);

    httpRequest.send(body);
  }
  else {
    document.forms['Form1'].submit();
  }
}

function resetError() {
  var commentAuthor = document.getElementById('comments_commentAuthor');
  if (commentAuthor != null) {
    commentAuthor.style.borderColor = '';
    commentAuthor.style.borderStyle = '';
  }

  var commentText = document.getElementById('comments_commentText');
  if (commentText != null) {
    commentText.style.borderColor = '';
    commentText.style.borderStyle = '';
  }

  var spamProof = document.getElementById('comments_spamProof');
  if (spamProof != null) {
    spamProof.style.borderColor = '';
    spamProof.style.borderStyle = '';
  }
}

function processRequest() {
  if (httpRequest.readyState == 4) {
    if (httpRequest.status == 200) {
      var commentsPlaceHolder = document.getElementById('commentsPlaceHolderDiv');
      var btnCancel = document.getElementById('btnCancel');

      btnCancel.click();
      commentsPlaceHolder.innerHTML = httpRequest.responseText;

      document.forms['Form1'].reset();
    }
    else {
      UpdateCaptcha();

      var responseXml = httpRequest.responseXML;
      var exceptionElement = responseXml.documentElement;

      var paramNameNode = exceptionElement.getElementsByTagName('paramName');
      var messageNode = exceptionElement.getElementsByTagName('message');

      if (paramNameNode != null && paramNameNode.length > 0) {
        paramNameNode = paramNameNode[0];

        var text;
        if (paramNameNode.text) {
          text = paramNameNode.text;
        }
        else if (paramNameNode.textContent) {
          text = paramNameNode.textContent;
        }

        if (text == 'author') {
          var commentAuthor = document.getElementById('comments_commentAuthor');
          if (commentAuthor != null) {
            commentAuthor.style.borderColor = 'red';
            commentAuthor.style.borderStyle = 'solid';
          }
        }
        else if (text == 'comment') {
          var commentText = document.getElementById('comments_commentText');
          if (commentText != null) {
            commentText.style.borderColor = 'red';
            commentText.style.borderStyle = 'solid';
          }
        }
        else if (text == 'spamproof') {
          var spamProof = document.getElementById('comments_spamProof');
          if (spamProof != null) {
            spamProof.style.borderColor = 'red';
            spamProof.style.borderStyle = 'solid';
          }
        }
        else {
          alert('Une erreure inconue est subvenue.');
        }
      }
      else if (messageNode != null && messageNode.length > 0) {
        messageNode = messageNode[0];

        var text;
        if (messageNode.text) {
          text = messageNode.text;
        }
        else if (messageNode.textContent) {
          text = messageNode.textContent;
        }

        alert(text);
      }
    }
  }
}

function randomString(length) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  var ret = '';
  for (var i = 0; i < length; i++) {
    var index = Math.floor(Math.random() * chars.length);
    ret += chars.substring(index, index + 1);
  }
  return ret;
}

function UpdateCaptcha() {
  var captchaImage = document.getElementById('comments_captchaImage');
  var captchaKey = randomString(12);
  captchaImage.src = 'captcha.rem?key=' + captchaKey;
}