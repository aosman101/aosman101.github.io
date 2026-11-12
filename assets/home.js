/* ================================================================
   HOME PAGE — pipeline playground + stack explorer
   Needs script.js first (uses window.AO_LOGOS for the tool logos).
================================================================ */

/* ── Pipeline playground ──
   A simulated run of three real projects. Visitors can switch
   pipeline, inspect each stage, and send a bad batch to watch the
   quality gate stop it. Counts are illustrative, not live data. */
(function initPlayground() {
  var root = document.getElementById('playground');
  if (!root) return;

  var PIPELINES = [
    {
      id: 'tfl', tab: 'TfL lakehouse', title: 'TfL Real-Time Lakehouse', href: 'projects.html#tfl-lakehouse',
      gate: 3,
      okText: 'Run succeeded. Fresh arrivals are modelled, checked and traceable.',
      failText: 'Stopped at Validate. The batch is flagged before anyone builds on it.',
      stages: [
        { stage: 'Ingest', tool: 'TfL Unified API', logo: 'transportforlondon', ok: '{n} arrivals', about: 'Airflow polls the TfL API for live bus and tube arrivals.' },
        { stage: 'Land', tool: 'Parquet lake', logo: 'apacheparquet', ok: '12 files', about: 'Raw arrivals land as Parquet files, so any run can be replayed.' },
        { stage: 'Transform', tool: 'dbt + DuckDB', logo: 'dbt', ok: '9 models', about: 'dbt builds staging and mart models inside DuckDB.' },
        { stage: 'Validate', tool: 'Great Expectations', logo: 'greatexpectations', ok: '24 of 24 checks', fail: '3 of 24 checks failed', about: 'Great Expectations checks every batch before it is trusted.' },
        { stage: 'Trace', tool: 'OpenLineage', logo: 'openlineage', ok: 'lineage recorded', about: 'OpenLineage records which run produced which table.' }
      ]
    },
    {
      id: 'cdc', tab: 'StreamShop CDC', title: 'StreamShop CDC Analytics Stack', href: 'projects.html#streamshop-cdc',
      gate: 4,
      okText: 'Run succeeded. Order changes reached ClickHouse and passed their tests.',
      failText: 'dbt tests failed. The facts are flagged before they reach a query.',
      stages: [
        { stage: 'Capture', tool: 'Postgres WAL', logo: 'postgresql', ok: '{n} row changes', about: 'Every insert, update and delete in Postgres is written to its log.' },
        { stage: 'Stream', tool: 'Debezium', logo: 'debezium', ok: '{n} events', about: 'Debezium turns those log entries into change events.' },
        { stage: 'Buffer', tool: 'Redpanda', logo: 'redpanda', ok: 'in order', about: 'Redpanda, a Kafka-compatible broker, holds the events in order.' },
        { stage: 'Load', tool: 'Python sink to ClickHouse', logo: 'clickhouse', ok: '{n} rows', about: 'A Python sink writes each change into ClickHouse.' },
        { stage: 'Model and test', tool: 'dbt', logo: 'dbt', ok: 'tests passed', fail: '2 tests failed', about: 'dbt models the changes into facts and tests them.' }
      ]
    },
    {
      id: 'pl', tab: 'Premier League', title: 'Premier League Analytics Warehouse', href: 'projects.html#premier-league-warehouse',
      gate: 4,
      okText: 'Run succeeded. Eleven seasons are modelled and ready to query.',
      failText: 'CI failed on a dbt test. The change cannot merge until it is fixed.',
      stages: [
        { stage: 'Source', tool: 'openfootball JSON', mono: '{ }', ok: '11 seasons', about: 'Open match data for seasons 2014–15 to 2024–25.' },
        { stage: 'Convert', tool: 'Python to NDJSON', logo: 'python', ok: '4,180 matches', about: 'Python flattens the JSON into newline-delimited rows.' },
        { stage: 'Load', tool: 'BigQuery raw', logo: 'googlebigquery', ok: 'raw tables loaded', about: 'The rows load into raw tables in BigQuery.' },
        { stage: 'Model', tool: 'dbt marts', logo: 'dbt', ok: 'marts built', about: 'dbt shapes the raw tables into dimensional marts.' },
        { stage: 'Test', tool: 'GitHub Actions CI', logo: 'githubactions', ok: 'CI passed', fail: 'CI failed', about: 'GitHub Actions runs the dbt build and tests on every push.' }
      ]
    }
  ];

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STEP = reduced ? 0 : 640;
  var tabsEl = root.querySelector('.pg-tabs');
  var stagesEl = root.querySelector('.pg-stages');
  var detailEl = root.querySelector('.pg-detail');
  var runBtn = root.querySelector('.pg-run');
  var badToggle = root.querySelector('.pg-bad input');
  var linkEl = root.querySelector('.pg-link');
  var current = PIPELINES[0], rows = [], timers = [], running = false;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function say(text, tone) {
    detailEl.textContent = text;
    detailEl.className = 'pg-detail' + (tone ? ' is-' + tone : '');
  }

  function setState(row, state, text) {
    row.className = 'pg-stage is-' + state;
    row.querySelector('.pg-status').textContent = text || '';
  }

  function renderStages() {
    stagesEl.textContent = '';
    rows = current.stages.map(function (s) {
      var li = el('li');
      var btn = el('button', 'pg-stage is-idle');
      btn.type = 'button';
      var node = el('span', 'pg-node');
      var logo = s.logo && window.AO_LOGOS && window.AO_LOGOS.make(s.logo);
      if (logo) node.appendChild(logo); else node.appendChild(el('span', 'pg-mono', s.mono || s.tool.slice(0, 2)));
      var text = el('span', 'pg-text');
      text.appendChild(el('span', 'pg-name', s.stage));
      text.appendChild(el('span', 'pg-tool', s.tool));
      btn.appendChild(node);
      btn.appendChild(text);
      btn.appendChild(el('span', 'pg-status'));
      btn.addEventListener('click', function () {
        rows.forEach(function (r) { r.classList.remove('is-picked'); });
        btn.classList.add('is-picked');
        say(s.stage + ': ' + s.about);
      });
      li.appendChild(btn);
      stagesEl.appendChild(li);
      return btn;
    });
    linkEl.href = current.href;
    linkEl.textContent = 'Read about ' + current.title;
  }

  function finish(failed) {
    running = false;
    runBtn.disabled = false;
    runBtn.querySelector('span').textContent = 'Run again';
    root.classList.toggle('is-failed', failed);
    root.classList.toggle('is-passed', !failed);
    say(failed ? current.failText : current.okText, failed ? 'fail' : 'ok');
  }

  function run() {
    if (running) return;
    running = true;
    clearTimers();
    root.classList.remove('is-failed', 'is-passed');
    runBtn.disabled = true;
    runBtn.querySelector('span').textContent = 'Running';
    var bad = badToggle.checked;
    var n = (900 + Math.floor(Math.random() * 3600)).toLocaleString('en-GB');
    rows.forEach(function (r) { r.classList.remove('is-picked'); setState(r, 'idle', ''); });

    current.stages.forEach(function (s, i) {
      timers.push(setTimeout(function () {
        setState(rows[i], 'running', 'running');
        if (!reduced) say(s.stage + ': ' + s.about);
      }, i * STEP));
      timers.push(setTimeout(function () {
        if (bad && i === current.gate) {
          setState(rows[i], 'fail', s.fail);
          for (var j = i + 1; j < rows.length; j++) setState(rows[j], 'skipped', 'skipped');
          clearTimers();
          finish(true);
          return;
        }
        setState(rows[i], 'done', s.ok.replace('{n}', n));
        if (i === rows.length - 1) finish(false);
      }, i * STEP + STEP * 0.85));
    });
  }

  function choose(p, autorun) {
    current = p;
    clearTimers();
    running = false;
    runBtn.disabled = false;
    runBtn.querySelector('span').textContent = 'Run pipeline';
    root.classList.remove('is-failed', 'is-passed');
    Array.prototype.forEach.call(tabsEl.children, function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.id === p.id));
    });
    renderStages();
    say('Press run, or pick a stage to see what it does.');
    if (autorun) run();
  }

  PIPELINES.forEach(function (p) {
    var b = el('button', 'pg-tab', p.tab);
    b.type = 'button';
    b.dataset.id = p.id;
    b.addEventListener('click', function () { choose(p, true); });
    tabsEl.appendChild(b);
  });
  runBtn.addEventListener('click', run);
  badToggle.addEventListener('change', function () { clearTimers(); running = false; run(); });

  choose(PIPELINES[0], false);
  root.classList.add('is-ready');
  timers.push(setTimeout(run, reduced ? 0 : 1300));
})();

/* ── Stack explorer ──
   A wall of tool logos; picking one shows what it is used for and
   which projects on this site use it. */
(function initStackExplorer() {
  var root = document.getElementById('stackExplorer');
  if (!root) return;

  var PROJECTS = {
    'tfl-lakehouse': 'TfL Real-Time Lakehouse',
    'streamshop-cdc': 'StreamShop CDC',
    'air-quality-lakehouse': 'London Air Quality Lakehouse',
    'f1-raceops': 'F1 RaceOps Warehouse',
    'premier-league-warehouse': 'Premier League Warehouse',
    'mini-lake': 'Mini Lake',
    'deep-stock-insights': 'Deep Stock Insights',
    'lstm-prediction': 'LSTM Stock Forecasting',
    'ai-trading-agent': 'AI Trading Agent'
  };
  var CLIENT = 'Used on freelance client work, so there is no public repo to link.';
  var TOOLS = [
    { name: 'Python', logo: 'python', role: 'The language behind every ingestion job, sink and model on this site.', all: true, uses: ['tfl-lakehouse', 'streamshop-cdc', 'air-quality-lakehouse', 'ai-trading-agent'] },
    { name: 'SQL', logo: 'sql', role: 'Modelling, testing and tuning queries in every warehouse I build.', uses: ['f1-raceops', 'premier-league-warehouse', 'mini-lake'] },
    { name: 'dbt', logo: 'dbt', role: 'Staging-to-mart models with tests, so transformations are reviewed like code.', uses: ['tfl-lakehouse', 'streamshop-cdc', 'air-quality-lakehouse', 'f1-raceops', 'premier-league-warehouse', 'mini-lake'] },
    { name: 'Airflow', logo: 'apacheairflow', role: 'Schedules ingestion and keeps each run observable.', uses: ['tfl-lakehouse', 'air-quality-lakehouse'] },
    { name: 'DuckDB', logo: 'duckdb', role: 'Fast local analytics straight over Parquet files.', uses: ['tfl-lakehouse', 'mini-lake'] },
    { name: 'PostgreSQL', logo: 'postgresql', role: 'Source database for change data capture, and a serving layer.', uses: ['streamshop-cdc', 'air-quality-lakehouse'] },
    { name: 'BigQuery', logo: 'googlebigquery', role: 'Cloud warehouse for dimensional marts and incremental models.', uses: ['premier-league-warehouse'] },
    { name: 'ClickHouse', logo: 'clickhouse', role: 'Column store for query-ready facts from streamed changes.', uses: ['streamshop-cdc'] },
    { name: 'Redpanda', logo: 'redpanda', role: 'Kafka-compatible broker that holds change events in order.', uses: ['streamshop-cdc'] },
    { name: 'Debezium', logo: 'debezium', role: 'Captures row-level changes from Postgres as events.', uses: ['streamshop-cdc'] },
    { name: 'Great Expectations', logo: 'greatexpectations', role: 'Validates every batch before it is trusted.', uses: ['tfl-lakehouse'] },
    { name: 'GitHub Actions', logo: 'githubactions', role: 'CI that runs dbt builds and tests on every push.', uses: ['f1-raceops', 'premier-league-warehouse', 'mini-lake'] },
    { name: 'Docker', logo: 'docker', role: 'Packages services so a stack runs the same anywhere.', uses: ['ai-trading-agent'] },
    { name: 'AWS', logo: 'amazonwebservices', role: 'S3, IAM, EC2 and RDS on freelance and Somalis in Tech work.', note: 'Used on client and community work, so there is no public repo to link.' },
    { name: 'Snowflake', logo: 'snowflake', role: 'Cloud warehouse on client data platforms.', note: CLIENT },
    { name: 'Terraform', logo: 'terraform', role: 'Infrastructure defined as code for client platforms.', note: CLIENT },
    { name: 'Power BI', logo: 'powerbi', role: 'KPI dashboards at HQ Analytics that replaced 16 hours of manual reporting a month.', note: 'Used at work, so there is no public repo to link.' },
    { name: 'Tableau', logo: 'tableau', role: 'Engagement dashboards at Somalis in Tech, alongside ThoughtSpot.', note: 'Used at work, so there is no public repo to link.' },
    { name: 'FastAPI', logo: 'fastapi', role: 'APIs that serve model predictions.', uses: ['deep-stock-insights', 'ai-trading-agent'] },
    { name: 'TensorFlow', logo: 'tensorflow', role: 'Deep learning models for time-series forecasting.', uses: ['deep-stock-insights', 'lstm-prediction'] },
    { name: 'PyTorch', logo: 'pytorch', role: 'Model training for the trading agent.', uses: ['ai-trading-agent'] }
  ];

  var grid = root.querySelector('.sx-grid');
  var panel = root.querySelector('.sx-panel');
  var tiles = [];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function mark(t, big) {
    var logo = t.logo && window.AO_LOGOS && window.AO_LOGOS.make(t.logo);
    var m = logo || el('span', 'sx-mono', t.mono || t.name.slice(0, 2));
    return m;
  }

  function show(i) {
    var t = TOOLS[i];
    tiles.forEach(function (b, j) { b.setAttribute('aria-pressed', String(i === j)); });
    panel.textContent = '';
    var head = el('div', 'sx-head');
    head.appendChild(mark(t, true));
    head.appendChild(el('h3', 'sx-name', t.name));
    panel.appendChild(head);
    panel.appendChild(el('p', 'sx-role', t.role));
    if (t.uses) {
      panel.appendChild(el('p', 'sx-count', 'Used in'));
      var ul = el('ul', 'sx-uses');
      t.uses.forEach(function (id) {
        var li = el('li');
        var a = el('a', null, PROJECTS[id]);
        a.href = 'projects.html#' + id;
        li.appendChild(a);
        ul.appendChild(li);
      });
      if (t.all) {
        var more = el('li');
        var all = el('a', null, 'and most other projects');
        all.href = 'projects.html';
        more.appendChild(all);
        ul.appendChild(more);
      }
      panel.appendChild(ul);
    } else {
      panel.appendChild(el('p', 'sx-note', t.note));
    }
  }

  TOOLS.forEach(function (t, i) {
    var li = el('li');
    var b = el('button', 'sx-tile');
    b.type = 'button';
    b.appendChild(mark(t));
    b.appendChild(el('span', 'sx-label', t.name));
    b.addEventListener('click', function () { show(i); });
    b.addEventListener('focus', function () { show(i); });
    b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') show(i); });
    li.appendChild(b);
    grid.appendChild(li);
    tiles.push(b);
  });
  show(2);
})();
