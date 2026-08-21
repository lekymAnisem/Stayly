#!/bin/bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

# ── System updates ──────────────────────────────────────────
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget gnupg2 software-properties-common ufw unzip

# ── Java (OpenJDK 21) ───────────────────────────────────────
apt-get install -y -qq openjdk-21-jdk

# ── Jenkins (LTS) ───────────────────────────────────────────
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key \
  -o /usr/share/keyrings/jenkins-keyring.asc
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
  > /etc/apt/sources.list.d/jenkins.list
set +e
apt-get update -qq 2>&1
UPDATE_EXIT=$?
set -e
if [ $UPDATE_EXIT -ne 0 ]; then
  apt-get install -y -qq dirmngr gnupg
  KEYS=$(apt-get update 2>&1 | grep "NO_PUBKEY" | awk '{print $NF}')
  for key in $KEYS; do
    gpg --keyserver keyserver.ubuntu.com --recv-keys "$key"
    gpg --export --armor "$key" >> /usr/share/keyrings/jenkins-keyring.asc
  done
  apt-get update -qq
fi
apt-get install -y -qq jenkins

systemctl daemon-reload
systemctl enable jenkins
systemctl restart jenkins

# ── SonarQube ───────────────────────────────────────────────
SONAR_VERSION="${sonarqube_version}"
SONAR_USER="sonarqube"
SONAR_DIR="/opt/sonarqube"

if ! id -u $SONAR_USER &>/dev/null; then
  useradd --no-create-home --shell /bin/false $SONAR_USER
fi

apt-get install -y -qq unzip

curl -fsSL "https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-$${SONAR_VERSION}.zip" \
  -o /tmp/sonarqube.zip
unzip -q /tmp/sonarqube.zip -d /opt/
mv /opt/sonarqube-$${SONAR_VERSION} $SONAR_DIR
rm -f /tmp/sonarqube.zip

chown -R $SONAR_USER:$SONAR_USER $SONAR_DIR

cat > /etc/systemd/system/sonarqube.service << 'SONARSVC'
[Unit]
Description=SonarQube
After=network.target

[Service]
Type=forking
User=sonarqube
Group=sonarqube
ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop
Restart=always

[Install]
WantedBy=multi-user.target
SONARSVC

systemctl daemon-reload
systemctl enable sonarqube
systemctl restart sonarqube

# ── Docker CE ───────────────────────────────────────────────
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /usr/share/keyrings/docker.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io

usermod -aG docker jenkins
usermod -aG docker ubuntu

systemctl enable docker
systemctl restart docker

# ── AWS CLI v2 ──────────────────────────────────────────────
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp/
/tmp/aws/install
rm -rf /tmp/aws /tmp/awscliv2.zip

# ── Node.js 20.x ────────────────────────────────────────────
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y -qq nodejs

# ── yq (YAML processor) ─────────────────────────────────────
curl -fsSL "https://github.com/mikefarah/yq/releases/download/v4.44.6/yq_linux_amd64" \
  -o /usr/local/bin/yq
chmod +x /usr/local/bin/yq

# ── Trivy ───────────────────────────────────────────────────
curl -fsSL https://aquasecurity.github.io/trivy-repo/deb/public.key \
  | gpg --dearmor -o /usr/share/keyrings/trivy.gpg
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" \
  > /etc/apt/sources.list.d/trivy.list
apt-get update -qq
apt-get install -y -qq trivy

# ── UFW ─────────────────────────────────────────────────────
ufw --force disable
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 8080/tcp
ufw allow 9000/tcp
ufw --force enable

echo "userdata complete — Jenkins + SonarQube stack installed"
