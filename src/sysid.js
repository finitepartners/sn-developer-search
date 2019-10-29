var el = document.getElementById('dSearchForm');
var el2;
// var loc = document.location;
var q = parseParam('q');

el.onsubmit = dSearch;

if (q != '') {
  el2 = document.getElementById('q');
  if (el2) {
    el2.value = q;
    dSearch();
  }
}

function dSearch() {
  var element = document.getElementById('q');
  var ga = new GlideAjax('DevSearch3AJAX');
  // var sc = document.getElementById('searchConditions');

  if (element.value != '') {
    if (typeof showLoadingDialog == 'function') {
      showLoadingDialog();
    }
    ga.addParam('sysparm_name', 'findBySysID');
    ga.addParam('sysparm_search', element.value);
    ga.getXMLAnswer(dSearchResult);
  }
  return false;
}

function dSearchResult(answer) {
  answer = answer.evalJSON();
  if (typeof hideLoadingDialog == 'function') {
    hideLoadingDialog();
  }
  if (answer.error) {
    // eslint-disable-next-line no-alert
    alert(answer.error_message);
  } else {
    document.location = answer.link;
  }
}

function parseParam(p) {
  var loc = String(document.location);
  var re = RegExp('.*' + p + '=([^^]*)', 'ig');
  var matches = re.exec(loc);
  if (matches) {
    return matches[1];
  }
  return '';
}
