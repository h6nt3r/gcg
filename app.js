function shellEscape(s) {
  if (!s && s !== 0) return '';
  s = String(s);
  if (/^[a-zA-Z0-9_\/:.-]+$/.test(s)) return s;
  return "'" + s.replace(/'/g, "'\\''") + "'";
}

function gatherOptions() {
  const parts = [];

  // Target validation
  const url = document.getElementById('url').value.trim();
  const bulk = document.getElementById('bulkfile').value.trim();
  const rfile = document.getElementById('requestfile').value.trim();

  if (url.length < 1 && bulk.length < 1 && rfile.length < 1) {
    alert("Target can't be empty");
    return '';
  }

  // Add sudo if update is checked
  if (document.getElementById('opt_update').checked) {
    parts.push('sudo');
  }
  
  parts.push('ghauri');

  // General options
  const versionChecked = document.getElementById('opt_version').checked;
  const updateChecked = document.getElementById('opt_update').checked;

  if (versionChecked) parts.push('--version');
  if (updateChecked) parts.push('--update');

  // Only process other options if neither version nor update is checked
  if (!versionChecked && !updateChecked) {
    if (document.getElementById('opt_batch').checked) parts.push('--batch');
    if (document.getElementById('opt_flush').checked) parts.push('--flush-session');
    if (document.getElementById('opt_fresh').checked) parts.push('--fresh-queries');
  
    // Target
    if (url) parts.push('-u', shellEscape(url));
    if (bulk) parts.push('-m', shellEscape(bulk));
    if (rfile) parts.push('-r', shellEscape(rfile));

    // Request
    if (document.getElementById('useragent').value.trim()) {
      parts.push('-A', shellEscape(document.getElementById('useragent').value.trim()));
    }
    if (document.getElementById('random_agent').checked) parts.push('--random-agent');
    if (document.getElementById('header').value.trim()) parts.push('-H', shellEscape(document.getElementById('header').value.trim()));
    if (document.getElementById('headers').value.trim()) parts.push('--headers', shellEscape(document.getElementById('headers').value.trim()));
    if (document.getElementById('postdata').value.trim()) parts.push('--data', shellEscape(document.getElementById('postdata').value.trim()));
    if (document.getElementById('cookie').value.trim()) parts.push('--cookie', shellEscape(document.getElementById('cookie').value.trim()));
    if (document.getElementById('referer').value.trim()) parts.push('--referer', shellEscape(document.getElementById('referer').value.trim()));
    if (document.getElementById('host').value.trim()) parts.push('--host', shellEscape(document.getElementById('host').value.trim()));
    if (document.getElementById('proxy').value.trim()) parts.push('--proxy', shellEscape(document.getElementById('proxy').value.trim()));
    if (document.getElementById('delay').value) parts.push('--delay', String(document.getElementById('delay').value));
    if (document.getElementById('timeout').value) parts.push('--timeout', String(document.getElementById('timeout').value));
    if (document.getElementById('retries').value) parts.push('--retries', String(document.getElementById('retries').value));
    if (document.getElementById('confirm').checked) parts.push('--confirm');
    if (document.getElementById('skip_urlencode').checked) parts.push('--skip-urlencode');
    if (document.getElementById('force_ssl').checked) parts.push('--force-ssl');

    // Optimization
    if (document.getElementById('threads').value) parts.push('--threads', String(document.getElementById('threads').value));

    // Injection
    if (document.getElementById('testparam').value.trim()) parts.push('-p', shellEscape(document.getElementById('testparam').value.trim()));
    if (document.getElementById('dbms').value.trim()) parts.push('--dbms', shellEscape(document.getElementById('dbms').value.trim()));
    if (document.getElementById('prefix') && document.getElementById('prefix').value.trim()) parts.push('--prefix', shellEscape(document.getElementById('prefix').value.trim()));
    if (document.getElementById('suffix') && document.getElementById('suffix').value.trim()) parts.push('--suffix', shellEscape(document.getElementById('suffix').value.trim()));
    if (document.getElementById('safechars').value.trim()) parts.push('--safe-chars', shellEscape(document.getElementById('safechars').value.trim()));
    if (document.getElementById('fetchusing').value.trim()) parts.push('--fetch-using', shellEscape(document.getElementById('fetchusing').value.trim()));

    // Detection
    if (document.getElementById('verbosity').value) parts.push('-v', String(document.getElementById('verbosity').value));
    if (document.getElementById('level').value) parts.push('--level', document.getElementById('level').value);
    if (document.getElementById('code').value.trim()) parts.push('--code', shellEscape(document.getElementById('code').value.trim()));
    if (document.getElementById('matchstring').value.trim()) parts.push('--string', shellEscape(document.getElementById('matchstring').value.trim()));
    if (document.getElementById('notstring').value.trim()) parts.push('--not-string', shellEscape(document.getElementById('notstring').value.trim()));
    if (document.getElementById('text_only').checked) parts.push('--text-only');

    // Techniques
    const techFlags = [];
    ['B','E','U','S','T','Q'].forEach(t => {
      const el = document.getElementById('tech_' + t);
      if (el && el.checked) techFlags.push(t);
    });
    if (techFlags.length > 0) parts.push('--technique', techFlags.join(''));
    if (document.getElementById('time_sec').value) {
      parts.push('--time-sec', String(document.getElementById('time_sec').value));
    }

    // Enumeration
    ['banner','current_user','current_db','hostname','dbs','tables','columns','count','dump','sqlshell'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.checked) parts.push(el.value);
    });
    if (document.getElementById('enum_db').value.trim()) parts.push('-D', shellEscape(document.getElementById('enum_db').value.trim()));
    if (document.getElementById('enum_table').value.trim()) parts.push('-T', shellEscape(document.getElementById('enum_table').value.trim()));
    if (document.getElementById('enum_cols').value.trim()) parts.push('-C', shellEscape(document.getElementById('enum_cols').value.trim()));

    // Advanced
    if (document.getElementById('test_filter').checked) parts.push('--test-filter');
    if (document.getElementById('custom_extra').value.trim()) {
      const extras = document.getElementById('custom_extra').value.trim();
      parts.push(extras);
    }
  }

  return parts.join(' ');
}

// Event listeners
document.getElementById('generateBtn').addEventListener('click', function() {
  const cmd = gatherOptions();
  document.getElementById('generated').textContent = cmd;
});

document.getElementById('copyBtn').addEventListener('click', async function() {
  const text = document.getElementById('generated').textContent;
  try {
    // Attempt to use modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    
    this.textContent = 'Copied!';
    setTimeout(() => this.textContent = 'Copy Command', 1500);
  } catch (e) {
    alert('Copy failed. Please select and copy manually.');
  }
});

// Disable other target inputs when one has a value
function updateTargetInputsState() {
  const targetInputs = document.querySelectorAll('.target-input');
  const inputsWithValue = Array.from(targetInputs).filter(input => input.value.trim().length > 0);
  
  if (inputsWithValue.length > 0) {
    targetInputs.forEach(input => {
      if (!inputsWithValue.includes(input)) {
        input.disabled = true;
      }
    });
  } else {
    targetInputs.forEach(input => {
      input.disabled = false;
    });
  }
}

// Handle --version and --update checkboxes
function handleGeneralCheckbox() {
  const versionChecked = document.getElementById('opt_version').checked;
  const updateChecked = document.getElementById('opt_update').checked;
  const shouldDisable = versionChecked || updateChecked;
  const allInputs = document.querySelectorAll('input, textarea, select');
  
  allInputs.forEach(input => {
    // Exclude the version and update checkboxes themselves
    if (input.id !== 'opt_version' && input.id !== 'opt_update' && input.id !== 'generateBtn' && input.id !== 'resetBtn' && input.id !== 'copyBtn') {
      input.disabled = shouldDisable;
    }
  });

  // Ensure the command output is cleared when these are checked
  if (shouldDisable) {
      document.getElementById('generated').textContent = '';
  }
}

// Reset function
function resetForm() {
  document.querySelectorAll('input').forEach(i => {
    if (i.type === 'checkbox' || i.type === 'radio') i.checked = false;
    else if (i.type === 'number' || i.type === 'text') i.value = '';
  });
  document.querySelectorAll('textarea').forEach(t => t.value = '');
  document.querySelectorAll('select').forEach(s => {
    if (s.multiple) Array.from(s.options).forEach(o => o.selected = false);
    else s.selectedIndex = 0;
  });
  
  // Re-enable all inputs after reset
  document.querySelectorAll('input, textarea, select').forEach(input => {
    input.disabled = false;
  });
  
  document.getElementById('generated').textContent = '';
  
  // Update target inputs state after reset
  setTimeout(updateTargetInputsState, 50);
}

// Initialize and add event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Target input handling
  document.querySelectorAll('.target-input').forEach(input => {
    updateTargetInputsState();
    input.addEventListener('input', updateTargetInputsState);
    input.addEventListener('blur', updateTargetInputsState);
  });

  // Update and Version checkbox handling
  document.getElementById('opt_update').addEventListener('change', handleGeneralCheckbox);
  document.getElementById('opt_version').addEventListener('change', handleGeneralCheckbox);

  // Reset button
  document.getElementById('resetBtn').addEventListener('click', resetForm);
});