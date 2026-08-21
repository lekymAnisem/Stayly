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
