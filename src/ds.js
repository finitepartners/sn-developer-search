var el = document.getElementById('dSearchForm');
var el2;
// var loc = document.location;
var sc = parseParam('sc');
var q = parseParam('q');

el2 = document.getElementById('permLink');
el2.onclick = dPermLink;

el.onsubmit = dSearch;

if (sc != '') {
  el2 = document.getElementById('searchConditions');
  if (el2) {
    el2.checked = true;
  }
}

if (q != '') {
  el2 = document.getElementById('q');
  if (el2) {
    el2.value = q;
    dSearch();
  }
}

function dPermLink() {
  var loc = String(document.location);
  var re = /https:\/\/([^\/]*)\/.*/gi;
  var matches = re.exec(loc);
  var element = gel('q');

  var url = 'https://' + matches[1] + '/nav_to.do?uri=ds.do?q=' + element.value;
  if (document.getElementById('searchConditions').checked) {
    url += '^sc=true';
  }

  if (element) {
    // eslint-disable-next-line no-alert
    prompt('Because of a browser limitation the URL can not be placed directly in the clipboard.  Please use Ctrl-C to copy the data and escape to dismiss this dialog', url);
  }
}

function dSearch() {
  var element = document.getElementById('q');
  var ga = new GlideAjax('DevSearch3AJAX');
  var searchConditions = document.getElementById('searchConditions');

  if (element.value != '') {
    if (typeof showLoadingDialog == 'function') {
      showLoadingDialog();
    }
    ga.addParam('sysparm_name', 'devSearch');
    ga.addParam('sysparm_search', element.value);
    if (searchConditions.checked) {
      ga.addParam('sysparm_conditions', 'true');
    } else {
      ga.addParam('sysparm_conditions', 'false');
    }
    ga.getXMLAnswer(dSearchResult);
  }
  return false;
}

function dSearchResult(answer) {
  var element = document.getElementById('dsResults');
  element.innerHTML = answer;
  if (typeof hideLoadingDialog == 'function') {
    hideLoadingDialog();
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
