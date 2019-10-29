/*
 * Developer Search 3.2
 * Author: Garrett Griffin-Morales
 */

var DevSearch3AJAX = Class.create();

DevSearch3AJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  devSearch: function() {
    // Find the Workflow value field sys_id
    var workflowID = false;
    var value = new GlideRecord('sys_dictionary');
    value.addQuery('name', 'sys_variable_value');
    value.addQuery('element', 'value');
    value.setLimit(1);
    value.query();
    if (value.next()) {
      workflowID = String(value.sys_id);
    }

    var snippetSize = 100;
    var searchString = this.getParameter('sysparm_search');
    var dictionary = new GlideRecord('sys_dictionary');
    var qc;
    var dSearch;
    var tempNameField;
    var url = gs.getProperty('glide.servlet.uri', '');
    // var instance = gs.getProperty('instance_name', '');
    var html = '';
    var header =
      "<style>th { text-align:center; } tr.dsListEven th {background-color: #EEEEEE;color: black;} tr.dsListEven td {background-color: #EEEEEE;color: black;}</style><table align='center' cellspacing='0' cellpadding='5' width='100%' style='border-collapse:collapse;'><tbody><tr><th></th><th>Table</th><th>Field</th><th>Name</th><th>Snippet</th><th>Modified</th></tr>";
    var footer = '</tbody></table>';
    // var rowStart = '<tr>';
    var rowEnd = '</tr>';
    var count = 0;
    var text = '';
    var dIndex;
    var snippet = '';

    dictionary.addQuery('sys_scope.scope', 'NOT IN', gs.getProperty('dev_search.excluded_scopes', ''));
    dictionary.addQuery('active', 'true');
    dictionary.addQuery('name', 'DOES NOT CONTAIN', 'var_');
    dictionary.addQuery('name', 'DOES NOT CONTAIN', 'usageanalytics_count');
    dictionary.addQuery('name', '!=', 'sys_query_rewrite');
    dictionary.addQuery('name', '!=', 'v_transaction');
    dictionary.addQuery('name', '!=', 'sys_report_summary_line');
    dictionary.addQuery('name', '!=', 'sys_report_summary_line');
    dictionary.addQuery('name', '!=', 'sys_query_pattern');
    dictionary.addQuery('name', '!=', 'sys_transaction_pattern');
    if (this.getParameter('sysparm_conditions') == 'true') {
      qc = dictionary.addQuery('internal_type.name', 'IN', 'field_name,user_image,url,conditions,condition_string,email_script,script,script_plain,xml');
      qc.addOrCondition('element', 'window_name');
      qc.addOrCondition('element', 'frame_name');
      qc.addOrCondition('element', 'view_name');
      qc.addOrCondition('element', 'url');
      qc.addOrCondition('element', 'catalog_variable');
      qc.addOrCondition('element', 'reference_qual');
      qc.addOrCondition('element', 'style');
      qc.addOrCondition('element', 'attributes');
      qc.addOrCondition('element', 'dependent');
      qc.addOrCondition('element', 'query');
      qc.addOrCondition('element', 'query_with');
      qc.addOrCondition('element', 'query_from');
    } else {
      qc = dictionary.addQuery('internal_type.name', 'IN', 'email_script,script,script_plain,xml');
    }
    qc.addOrCondition('element', 'script');
    qc.addOrCondition('element', 'script_true');
    qc.addOrCondition('element', 'script_false');
    qc.addOrCondition('element', 'xml');
    if (workflowID !== false) {
      qc.addOrCondition('sys_id', workflowID);
    } // sys_variable_value.value field
    dictionary.query();

    while (dictionary._next()) {
      tempNameField = dictionary.name;
      dSearch = new GlideRecord(dictionary.name);
      dSearch.addQuery(dictionary.element, 'CONTAINS', searchString);
      dSearch.query();

      while (dSearch._next()) {
        // Handle Workflow Activity Fields in a Special Way
        var wfLink = '';
        var wfURL = '';
        var wfName = '';
        if (tempNameField == 'sys_variable_value' && dSearch.document == 'wf_activity') {
          // We know this is a workflow, so find the information!
          var wfa = new GlideRecord(dSearch.document);
          if (wfa.get('sys_id', dSearch.document_key)) {
            if (String(wfa.workflow_version.published) != 'true' && String(wfa.workflow_version.checked_out) == '') {
              // We don't want to return this, as it's not an active workflow activity.
              continue;
            } else {
              url = new GlideURL('workflow_ide.do');
              url.set('sysparm_sys_id', wfa.workflow_version);
              wfLink = "<a href='" + url.toString() + "' target='_blank'>Workflow: " + wfa.workflow_version.getDisplayValue() + '</a>';
              wfURL = url.toString();
              wfName = wfa.getDisplayValue();
            }
          }
        }
        text = String(dSearch[dictionary.element]);
        dIndex = text.indexOf(searchString);
        snippet = text.substring(dIndex - snippetSize / 2, dIndex + String(searchString).length + snippetSize / 2);
        count++;
        html += "<tr class='list_row " + this.getCSS(count) + "'>";
        if (wfURL != '') {
          html += "<th><a href='" + wfURL + "' target='_blank'>RES" + this.pad(count, 3) + '</a></th>';
        } else {
          html += "<th><a href='/" + tempNameField + '.do?sys_id=' + dSearch.sys_id + "'>RES" + this.pad(count, 3) + '</a></th>';
        }
        if (wfLink != '') {
          html += '<td>Workflow</td>';
        } else {
          html += '<td>' + dSearch.sys_meta.label + '</td>';
        }
        if (wfLink != '') {
          html += '<td>' + wfName + '</td>';
        } else {
          html += '<td>' + dictionary.element.getDisplayValue() + '</td>';
        }
        if (wfLink != '') {
          html += '<td>' + wfLink + '</td>';
        } else {
          html += "<td><a href='/" + tempNameField + '.do?sys_id=' + dSearch.sys_id + "'>" + dSearch.getDisplayValue() + '</a></td>';
        }
        html += "<td style='font-size:10px; width:300px;'>" + JSUtil.escapeText(snippet.replace(/\/n/gi, '<br/>')) + '</td>';
        html += '<td>' + dSearch.sys_updated_on.getDisplayValue() + '</td>';
        html += rowEnd;
      }
    }

    if (html == '') {
      html = 'No results found.';
    } else {
      html = header + html + footer;
    }
    return html;
  },

  pad: function(num, size) {
    var s = num + '';
    while (s.length < size) {
      s = '0' + s;
    }
    return s;
  },

  getCSS: function(c) {
    if (c % 2 == 0) {
      return 'dsListEven';
    }
    return 'dsListOdd';
  },

  findBySysID: function() {
    var searchString = this.getParameter('sysparm_search');
    if (searchString == '') {
      searchString = this.getParameter('sysparm_sys_id');
    }
    var sysID = searchString;
    var answer = {};
    answer.error = false;
    answer.error_message = '';
    // Grab all dictionary records called "sys_id"
    var table = new GlideRecord('sys_dictionary');
    table.addQuery('sys_scope.scope', 'NOT IN', gs.getProperty('dev_search.excluded_scopes', ''));
    table.addQuery('element', 'sys_id');
    table.query();
    while (table.next()) {
      var rec = new GlideRecord(table.name);
      if (rec.get('sys_id', sysID)) {
        answer.record = rec;
        if (rec.sys_class_name && rec.sys_class_name != '') {
          answer.table = String(rec.sys_class_name);
        } else {
          answer.table = rec.getTableName();
        }
        answer.link = rec.getLink();
        return JSON.stringify(answer);
      }
    }
    answer.error = true;
    answer.error_message = 'No record found matching that sys_id.';
    return JSON.stringify(answer);
  }
});
