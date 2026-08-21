#!/bin/bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

# ── System updates ──────────────────────────────────────────
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget gnupg2 software-properties-common ufw

# ── Prometheus ──────────────────────────────────────────────
%{ if prometheus_enabled ~}
PROM_VERSION="${prometheus_version}"
PROM_USER="prometheus"
PROM_DIR="/etc/prometheus"
PROM_DATA_DIR="/var/lib/prometheus"

if ! id -u $PROM_USER &>/dev/null; then
  useradd --no-create-home --shell /bin/false $PROM_USER
fi

mkdir -p $PROM_DIR $PROM_DATA_DIR
curl -fsSL "https://github.com/prometheus/prometheus/releases/download/v$${PROM_VERSION}/prometheus-$${PROM_VERSION}.linux-amd64.tar.gz" \
  | tar -xz -C /tmp/
cp /tmp/prometheus-$${PROM_VERSION}.linux-amd64/{prometheus,promtool} /usr/local/bin/
cp -r /tmp/prometheus-$${PROM_VERSION}.linux-amd64/{consoles,console_libraries} $PROM_DIR/
rm -rf /tmp/prometheus-$${PROM_VERSION}.linux-amd64

cat > $PROM_DIR/prometheus.yml << 'PROMCFG'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
PROMCFG
%{ if app_metrics_url != "" ~}
cat >> $PROM_DIR/prometheus.yml << PROMCFG2

  - job_name: "stayly-backend"
    metrics_path: /api/metrics
    static_configs:
      - targets: ["${app_metrics_url}"]
PROMCFG2
%{ endif ~}

chown -R $PROM_USER:$PROM_USER $PROM_DIR $PROM_DATA_DIR

cat > /etc/systemd/system/prometheus.service << 'PROMSVC'
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target
[Service]
User=prometheus
Group=prometheus
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus \
  --web.console.templates=/etc/prometheus/consoles \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.listen-address=0.0.0.0:9090
Restart=always
[Install]
WantedBy=multi-user.target
PROMSVC

systemctl daemon-reload
systemctl enable prometheus
systemctl restart prometheus
%{ endif ~}

# ── Grafana ─────────────────────────────────────────────────
%{ if grafana_enabled ~}
mkdir -p /etc/apt/keyrings
curl -fsSL https://apt.grafana.com/gpg.key | gpg --dearmor -o /etc/apt/keyrings/grafana.gpg
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" \
  > /etc/apt/sources.list.d/grafana.list
apt-get update -qq
apt-get install -y -qq grafana

%{ if grafana_admin_password != "" ~}
cat > /etc/grafana/grafana.ini << 'GRAFCFG'
[server]
http_addr = 0.0.0.0
http_port = 3000
[auth.admin]
admin_password = ${grafana_admin_password}
GRAFCFG
%{ endif ~}

systemctl daemon-reload
systemctl enable grafana-server
systemctl restart grafana-server

# ── Grafana provisioning: Prometheus datasource + app dashboard ──
mkdir -p /etc/grafana/provisioning/datasources /etc/grafana/provisioning/dashboards /var/lib/grafana/dashboards

cat > /etc/grafana/provisioning/datasources/prometheus.yaml << GRAFDS
apiVersion: 1
datasources:
  - name: Prometheus
    uid: prometheus
    type: prometheus
    access: proxy
    url: http://localhost:9090
    isDefault: true
GRAFDS

cat > /etc/grafana/provisioning/dashboards/provider.yaml << GRAFPROV
apiVersion: 1
providers:
  - name: stayly
    orgId: 1
    folder: Stayly
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: false
GRAFPROV

cat > /var/lib/grafana/dashboards/stayly-app.json << 'GRAFDASH'
{"title":"Stayly App Overview","uid":"stayly-app","tags":["stayly"],"timezone":"browser","schemaVersion":39,"refresh":"30s","time":{"from":"now-6h","to":"now"},"panels":[{"id":1,"type":"stat","title":"Up","gridPos":{"x":0,"y":0,"w":4,"h":4},"datasource":{"type":"prometheus","uid":"prometheus"},"targets":[{"expr":"up{job=\"stayly-backend\"}","refId":"A"}],"fieldConfig":{"defaults":{"thresholds":{"mode":"absolute","steps":[{"color":"red","value":null},{"color":"green","value":1}]}}}},{"id":2,"type":"timeseries","title":"Requests/sec","gridPos":{"x":4,"y":0,"w":10,"h":8},"datasource":{"type":"prometheus","uid":"prometheus"},"targets":[{"expr":"sum(rate(stayly_http_requests_total[5m])) by (route)","legendFormat":"{{route}}","refId":"A"}]},{"id":3,"type":"timeseries","title":"p95 latency (s)","gridPos":{"x":14,"y":0,"w":10,"h":8},"datasource":{"type":"prometheus","uid":"prometheus"},"targets":[{"expr":"histogram_quantile(0.95, sum(rate(stayly_http_request_duration_seconds_bucket[5m])) by (le))","legendFormat":"p95","refId":"A"}]},{"id":4,"type":"timeseries","title":"HTTP 5xx errors/sec","gridPos":{"x":0,"y":4,"w":4,"h":4},"datasource":{"type":"prometheus","uid":"prometheus"},"targets":[{"expr":"sum(rate(stayly_http_requests_total{status=~\"5..\"}[5m]))","legendFormat":"5xx/s","refId":"A"}],"fieldConfig":{"defaults":{"thresholds":{"mode":"absolute","steps":[{"color":"green","value":null},{"color":"red","value":0.01}]}}}},{"id":5,"type":"timeseries","title":"Event loop lag (s)","gridPos":{"x":0,"y":8,"w":8,"h":8},"datasource":{"type":"prometheus","uid":"prometheus"},"targets":[{"expr":"stayly_nodejs_eventloop_lag_seconds","legendFormat":"lag","refId":"A"}]},{"id":6,"type":"timeseries","title":"Memory","gridPos":{"x":8,"y":8,"w":8,"h":8},"datasource":{"type":"prometheus","uid":"prometheus"},"targets":[{"expr":"stayly_process_resident_memory_bytes","legendFormat":"RSS","refId":"A"},{"expr":"stayly_nodejs_heap_size_used_bytes","legendFormat":"heap used","refId":"B"}],"fieldConfig":{"defaults":{"unit":"bytes"}}},{"id":7,"type":"timeseries","title":"Active handles","gridPos":{"x":16,"y":8,"w":8,"h":8},"datasource":{"type":"prometheus","uid":"prometheus"},"targets":[{"expr":"stayly_nodejs_active_handles_total","legendFormat":"handles","refId":"A"}]}]}
GRAFDASH

chown -R grafana:grafana /var/lib/grafana/dashboards /etc/grafana/provisioning
systemctl restart grafana-server
%{ endif ~}

# ── Alertmanager ────────────────────────────────────────────
%{ if alertmanager_enabled ~}
AM_VERSION="${alertmanager_version}"
AM_USER="alertmanager"
AM_DIR="/etc/alertmanager"
AM_DATA_DIR="/var/lib/alertmanager"

if ! id -u $AM_USER &>/dev/null; then
  useradd --no-create-home --shell /bin/false $AM_USER
fi

mkdir -p $AM_DIR $AM_DATA_DIR
curl -fsSL "https://github.com/prometheus/alertmanager/releases/download/v$${AM_VERSION}/alertmanager-$${AM_VERSION}.linux-amd64.tar.gz" \
  | tar -xz -C /tmp/
cp /tmp/alertmanager-$${AM_VERSION}.linux-amd64/{alertmanager,amtool} /usr/local/bin/
rm -rf /tmp/alertmanager-$${AM_VERSION}.linux-amd64

chown -R $AM_USER:$AM_USER $AM_DIR $AM_DATA_DIR

cat > /etc/systemd/system/alertmanager.service << 'AMSVC'
[Unit]
Description=Alertmanager
Wants=network-online.target
After=network-online.target
[Service]
User=alertmanager
Group=alertmanager
ExecStart=/usr/local/bin/alertmanager \
  --config.file=/etc/alertmanager/alertmanager.yml \
  --storage.path=/var/lib/alertmanager \
  --web.listen-address=0.0.0.0:9093
Restart=always
[Install]
WantedBy=multi-user.target
AMSVC

systemctl daemon-reload
systemctl enable alertmanager
systemctl restart alertmanager
%{ endif ~}

# ── UFW ─────────────────────────────────────────────────────
ufw --force disable
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
%{ if prometheus_enabled ~} ufw allow 9090/tcp %{ endif ~}
%{ if grafana_enabled ~} ufw allow 3000/tcp %{ endif ~}
%{ if alertmanager_enabled ~} ufw allow 9093/tcp %{ endif ~}
ufw --force enable

echo "userdata complete — monitoring stack installed"
